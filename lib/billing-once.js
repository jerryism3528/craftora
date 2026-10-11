import { query, queryOne } from './db';
import { paypal, paypalMode } from './paypal';
import { getPlans, effectivePlanKey, applyGrantToUser } from './plans';
import { notify, money } from './billing';

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

  // Claim the order atomically so two calls can never grant the plan twice.
  const claimed = await queryOne(
    "UPDATE billing_orders SET status = 'COMPLETED', capture_id = $2, payment_source = $3, payer_email = $4, fulfilled_at = now(), updated_at = now() WHERE id = $1 AND status <> 'COMPLETED' RETURNING *",
    [row.id, cap.id, source, payer]
  );
  if (!claimed) return { ok: true, already: true, row };

  const grant = row.user_id ? await applyGrantToUser(row.user_id, { plan: row.plan_key, months: row.months, source: 'paypal-once' }) : null;
  await query(
    `INSERT INTO billing_payments (user_id, paypal_subscription_id, paypal_txn_id, kind, amount_cents, currency, status, mode)
     VALUES ($1, NULL, $2, 'payment', $3, 'USD', 'completed', $4) ON CONFLICT (paypal_txn_id) DO NOTHING`,
    [row.user_id, cap.id, row.amount_cents, row.mode]
  );
  await notify('billing', 'New one-time purchase', `${payer || 'A customer'} bought ${row.product_key} for ${money(row.amount_cents)} with ${(source || 'paypal').replace('_', ' ')}.`);
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
