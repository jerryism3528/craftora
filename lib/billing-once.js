import crypto from 'crypto';
import { query, queryOne } from './db';
import { paypal, paypalMode } from './paypal';
import { getPlans, effectivePlanKey, applyGrantToUser } from './plans';
import { notify, money } from './billing';
import { SITE } from './company';
import { coinbase, coinbaseMode } from './coinbase';
import { markPromoPaid } from './promo';

export async function activeProducts() {
  try { return await query('SELECT * FROM billing_products WHERE active ORDER BY sort'); } catch { return []; }
}

// Can this user buy this one-time product without wasting money?
export async function checkCanBuy(userId, product) {
  const plans = await getPlans();
  const u = await queryOne('SELECT plan, plan_expires_at FROM users WHERE id = $1', [userId]);
  const cur = effectivePlanKey(u, plans);
  const curRank = plans[cur]?.rank || 0;
  const wantRank = plans[product.plan_key]?.rank || 0;
  if (cur !== 'free' && !u.plan_expires_at && curRank >= wantRank) {
    return { ok: false, error: `You already have lifetime ${plans[cur].name}.` };
  }
  const active = await queryOne("SELECT plan_key FROM subscriptions WHERE user_id = $1 AND status = 'ACTIVE' LIMIT 1", [userId]);
  if (active) {
    return { ok: false, error: `You have an active ${plans[active.plan_key]?.name || ''} subscription. Cancel it in Billing first if you prefer to pay once.` };
  }
  if (cur !== 'free' && curRank > wantRank) {
    return { ok: false, error: `Your ${plans[cur].name} plan is active until ${new Date(u.plan_expires_at).toDateString()}, which already includes ${plans[product.plan_key]?.name}.` };
  }
  return { ok: true };
}

export async function createOnceOrder(user, product) {
  const value = (product.price_cents / 100).toFixed(2);
  const order = await paypal('POST', '/v2/checkout/orders', {
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: product.key,
      custom_id: user.id,
      description: `Craftora ${product.name}`,
      soft_descriptor: 'CRAFTORA',
      amount: { currency_code: 'USD', value },
    }],
    application_context: { brand_name: 'Craftora', shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW' },
  });
  await query(
    `INSERT INTO billing_orders (user_id, paypal_order_id, product_key, plan_key, months, amount_cents, mode)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [user.id, order.id, product.key, product.plan_key, product.months, product.price_cents, paypalMode()]
  );
  return order.id;
}

// Pay with crypto: PayPal hosts the crypto payment, converts it, and settles in USD. Captured automatically on approval.
export async function createCryptoOrder(user, product, name) {
  const value = (product.price_cents / 100).toFixed(2);
  const order = await paypal('POST', '/v2/checkout/orders', {
    processing_instruction: 'ORDER_COMPLETE_ON_PAYMENT_APPROVAL',
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: product.key,
      custom_id: user.id,
      description: `Craftora ${product.name}`,
      soft_descriptor: 'CRAFTORA',
      amount: { currency_code: 'USD', value },
    }],
    payment_source: {
      crypto: {
        country_code: 'US',
        name: { given_name: name.first, surname: name.last },
        experience_context: {
          locale: 'en-US',
          return_url: `${SITE}/billing/crypto`,
          cancel_url: `${SITE}/pricing?checkout=cancelled`,
        },
      },
    },
  }, { requestId: `craftora-crypto-${user.id}-${Date.now()}` });
  await query(
    `INSERT INTO billing_orders (user_id, paypal_order_id, product_key, plan_key, months, amount_cents, mode, payment_source)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'crypto')`,
    [user.id, order.id, product.key, product.plan_key, product.months, product.price_cents, paypalMode()]
  );
  const link = (order.links || []).find((l) => l.rel === 'payer-action' || l.rel === 'approve')?.href;
  if (!link) throw new Error('PayPal did not return a crypto payment link.');
  return { id: order.id, redirect: link };
}

// Check an order (used after the crypto payment page sends the buyer back).
export async function refreshOnceOrder(orderId) {
  const r = await queryOne('SELECT provider FROM billing_orders WHERE paypal_order_id = $1', [orderId]);
  if (r?.provider === 'coinbase') return refreshCoinbaseOrder(orderId);
  const order = await paypal('GET', `/v2/checkout/orders/${orderId}`);
  if (order.status === 'COMPLETED') return fulfilOrder(order);
  if (['VOIDED'].includes(order.status)) {
    await query("UPDATE billing_orders SET status = 'FAILED', updated_at = now() WHERE paypal_order_id = $1 AND status <> 'COMPLETED'", [orderId]);
    return { ok: false, error: 'This payment was cancelled. You were not charged.' };
  }
  return { ok: false, pending: true, error: 'Your crypto payment is still being confirmed. This can take a few minutes. Your plan will be added automatically.' };
}

// Turn a captured PayPal order into a plan. Safe to call many times (only the first one counts).
export async function fulfilOrder(order) {
  const row = await queryOne('SELECT * FROM billing_orders WHERE paypal_order_id = $1', [order.id]);
  if (!row) return { ok: false, error: 'Order not found.' };
  if (row.status === 'COMPLETED') return { ok: true, already: true, row };
  const pu = order.purchase_units?.[0] || {};
  const cap = pu.payments?.captures?.[0];
  const source = Object.keys(order.payment_source || {})[0] || null;
  const payer = order.payer?.email_address || order.payment_source?.paypal?.email_address || null;

  if (!cap || cap.status !== 'COMPLETED') {
    if (cap?.status === 'PENDING') {
      await query("UPDATE billing_orders SET capture_id = $2, payment_source = $3, updated_at = now() WHERE id = $1", [row.id, cap.id, source]);
      await notify('billing', 'Payment pending review', `Order ${order.id} (${row.product_key}) is pending at PayPal. The plan will be added when PayPal completes it.`);
      return { ok: false, pending: true, error: 'PayPal is still reviewing this payment. Your plan will be added as soon as it clears.' };
    }
    await query("UPDATE billing_orders SET status = 'FAILED', payment_source = $2, updated_at = now() WHERE id = $1 AND status <> 'COMPLETED'", [row.id, source]);
    return { ok: false, error: 'The payment was not completed. You were not charged.' };
  }
  if (Math.round(Number(cap.amount?.value || 0) * 100) !== row.amount_cents) {
    await notify('billing', 'Order amount mismatch', `Order ${order.id}: paid ${cap.amount?.value}, expected ${money(row.amount_cents)}. Check it in PayPal.`);
  }

  return grantOrder(row, { captureId: cap.id, source, payer });
}

// Claim the order atomically so two calls can never grant the plan twice, then add the plan.
async function grantOrder(row, { captureId, source, payer }) {
  const claimed = await queryOne(
    "UPDATE billing_orders SET status = 'COMPLETED', capture_id = $2, payment_source = $3, payer_email = $4, fulfilled_at = now(), updated_at = now() WHERE id = $1 AND status <> 'COMPLETED' RETURNING *",
    [row.id, captureId, source, payer]
  );
  if (!claimed) return { ok: true, already: true, row };
  await markPromoPaid(row.paypal_order_id);

  const grant = row.user_id ? await applyGrantToUser(row.user_id, { plan: row.plan_key, months: row.months, source: 'paypal-once' }) : null;
  await query(
    `INSERT INTO billing_payments (user_id, paypal_subscription_id, paypal_txn_id, kind, amount_cents, currency, status, mode)
     VALUES ($1, NULL, $2, 'payment', $3, 'USD', 'completed', $4) ON CONFLICT (paypal_txn_id) DO NOTHING`,
    [row.user_id, captureId, row.amount_cents, row.mode]
  );
  await notify('billing', 'New one-time purchase', `${payer || 'A customer'} bought ${row.product_key} for ${money(row.amount_cents)} with ${(source || 'paypal').replace('_', ' ')}${claimed.promo_code ? ` using code ${claimed.promo_code}` : ''}.`);
  return { ok: true, row: claimed, grant };
}

export async function captureOnceOrder(orderId) {
  let order;
  try {
    order = await paypal('POST', `/v2/checkout/orders/${orderId}/capture`, {}, { requestId: `craftora-capture-${orderId}` });
  } catch (e) {
    const issue = e.paypal?.details?.[0]?.issue;
    if (issue === 'ORDER_ALREADY_CAPTURED') order = await paypal('GET', `/v2/checkout/orders/${orderId}`);
    else throw e;
  }
  return fulfilOrder(order);
}

// Nightly: remind one-time buyers 7 days before their plan ends.
export async function sendExpiryReminders(sendMail) {
  const rows = await query(
    `SELECT DISTINCT ON (u.id) u.id, u.email, u.plan, u.plan_expires_at, o.id AS order_id
       FROM users u JOIN billing_orders o ON o.user_id = u.id AND o.status = 'COMPLETED'
      WHERE u.plan_source = 'paypal-once' AND u.plan_expires_at BETWEEN now() + interval '6 days' AND now() + interval '8 days'
        AND o.reminder_sent_at IS NULL
      ORDER BY u.id, o.fulfilled_at DESC`
  );
  let sent = 0;
  for (const r of rows) {
    try {
      await sendMail(r);
      await query('UPDATE billing_orders SET reminder_sent_at = now() WHERE user_id = $1 AND status = $2', [r.id, 'COMPLETED']);
      sent++;
    } catch (e) { console.error('reminder failed:', e.message); }
  }
  return { due: rows.length, sent };
}

// ---------- USDC through Coinbase Business ----------

export async function createUsdcCheckout(user, product) {
  const ref = crypto.randomUUID();
  const value = (product.price_cents / 100).toFixed(2);
  const ck = await coinbase('POST', '/checkouts', {
    amount: value,
    currency: 'USD',
    description: `Craftora ${product.name}`,
    metadata: { ref, userId: user.id, product: product.key },
    successRedirectUrl: `${SITE}/billing/crypto?cb=${ref}`,
    failRedirectUrl: `${SITE}/pricing?checkout=cancelled`,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  }, { idempotencyKey: ref });
  if (!ck?.id || !ck?.url) throw new Error('Coinbase did not return a checkout link.');
  await query(
    `INSERT INTO billing_orders (user_id, paypal_order_id, product_key, plan_key, months, amount_cents, mode, payment_source, provider, external_ref)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'usdc', 'coinbase', $8)`,
    [user.id, ck.id, product.key, product.plan_key, product.months, product.price_cents, coinbaseMode(), ref]
  );
  return { id: ck.id, ref, redirect: ck.url };
}

export async function orderIdFromRef(ref) {
  const r = await queryOne('SELECT paypal_order_id FROM billing_orders WHERE external_ref = $1', [ref]);
  return r?.paypal_order_id || null;
}

// Turn a Coinbase checkout into a plan. Always re-reads the checkout from Coinbase first.
export async function refreshCoinbaseOrder(checkoutId) {
  if (!/^[a-f0-9]{24}$/i.test(checkoutId || '')) return { ok: false, error: 'Order not found.' };
  const row = await queryOne("SELECT * FROM billing_orders WHERE paypal_order_id = $1 AND provider = 'coinbase'", [checkoutId]);
  if (!row) return { ok: false, error: 'Order not found.' };
  if (row.status === 'COMPLETED') return { ok: true, already: true, row };
  const ck = await coinbase('GET', `/checkouts/${checkoutId}`);
  if (ck.metadata?.ref && row.external_ref && ck.metadata.ref !== row.external_ref) {
    await notify('billing', 'USDC checkout mismatch', `Checkout ${checkoutId} metadata does not match order ${row.id}.`);
    return { ok: false, error: 'This payment could not be matched. Please contact support.' };
  }
  if (ck.status === 'COMPLETED') {
    const paid = Math.round(Number(ck.fiatAmount || ck.amount || 0) * 100);
    if (paid && paid < row.amount_cents - 1) {
      await notify('billing', 'USDC amount mismatch', `Checkout ${checkoutId}: paid ${ck.fiatAmount || ck.amount}, expected ${money(row.amount_cents)}. Check it in Coinbase.`);
      return { ok: false, error: 'The amount received does not match the price. We will review it and email you.' };
    }
    return grantOrder(row, { captureId: `cb_${ck.transactionHash || ck.id}`, source: 'usdc', payer: null });
  }
  if (['EXPIRED', 'FAILED', 'DEACTIVATED'].includes(ck.status)) {
    await query("UPDATE billing_orders SET status = 'FAILED', updated_at = now() WHERE id = $1 AND status <> 'COMPLETED'", [row.id]);
    return { ok: false, error: ck.status === 'EXPIRED' ? 'This payment link expired. You were not charged.' : 'The payment did not go through. You were not charged.' };
  }
  if (['REFUNDED', 'PARTIALLY_REFUNDED'].includes(ck.status)) return { ok: false, error: 'This payment was refunded.' };
  return { ok: false, pending: true, error: 'Your USDC payment is still being confirmed on the network. This usually takes under a minute. Your plan will be added automatically.' };
}
