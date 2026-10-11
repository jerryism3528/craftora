import { query, queryOne } from './db';
import { paypal, paypalMode } from './paypal';
import { getPlans, effectivePlanKey } from './plans';

// Days of access kept after the paid period ends, so a late renewal never locks anyone out.
export const GRACE_DAYS = 3;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LIVE_STATUSES = ['ACTIVE'];

export const money = (cents, cur = 'USD') => `${cur === 'USD' ? '$' : ''}${(Number(cents || 0) / 100).toFixed(Number(cents) % 100 ? 2 : 0)}${cur === 'USD' ? '' : ' ' + cur}`;

export async function notify(type, title, body) {
  await query('INSERT INTO admin_notifications (type, title, body, target_type) VALUES ($1, $2, $3, $4)', [type, title, body || null, 'billing']).catch(() => {});
}

export async function billingPlans(mode = paypalMode()) {
  return query('SELECT * FROM billing_plans WHERE mode = $1 ORDER BY plan_key, billing_interval', [mode]);
}

// Prices for the pricing page: { pro: { month: 500, year: 4800, ready: true }, business: {...} }
export async function priceTable(mode = paypalMode()) {
  let rows = [];
  try { rows = await billingPlans(mode); } catch { rows = []; }
  const out = {};
  for (const r of rows) {
    if (!r.active) continue;
    out[r.plan_key] = out[r.plan_key] || {};
    out[r.plan_key][r.billing_interval] = { cents: r.price_cents, ready: !!r.paypal_plan_id };
  }
  return out;
}

// Create the PayPal product and one billing plan per price (only the ones that do not exist yet).
export async function setupPaypalPlans() {
  const mode = paypalMode();
  const rows = await billingPlans(mode);
  const plans = await getPlans(true);
  let productId = rows.find((r) => r.paypal_product_id)?.paypal_product_id;
  const created = [];
  if (!productId) {
    const p = await paypal('POST', '/v1/catalogs/products', {
      name: 'Craftora',
      description: 'Craftora Pro and Business plans: higher limits for free online tools.',
      type: 'SERVICE',
      category: 'SOFTWARE',
      home_url: 'https://craftora.dev',
    }, { requestId: `craftora-product-${mode}` });
    productId = p.id;
    await query('UPDATE billing_plans SET paypal_product_id = $2 WHERE mode = $1', [mode, productId]);
    created.push(`product ${productId}`);
  }
  for (const r of rows) {
    if (r.paypal_plan_id || !r.active) continue;
    const name = `Craftora ${plans[r.plan_key]?.name || r.plan_key} (${r.billing_interval === 'year' ? 'Yearly' : 'Monthly'})`;
    const plan = await paypal('POST', '/v1/billing/plans', {
      product_id: productId,
      name,
      description: `${name}, billed every ${r.billing_interval}. Cancel any time.`,
      status: 'ACTIVE',
      billing_cycles: [{
        frequency: { interval_unit: r.billing_interval === 'year' ? 'YEAR' : 'MONTH', interval_count: 1 },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: { fixed_price: { value: (r.price_cents / 100).toFixed(2), currency_code: r.currency } },
      }],
      payment_preferences: { auto_bill_outstanding: true, setup_fee_failure_action: 'CONTINUE', payment_failure_threshold: 2 },
    }, { requestId: `craftora-plan-${mode}-${r.plan_key}-${r.billing_interval}-${r.price_cents}` });
    await query('UPDATE billing_plans SET paypal_plan_id = $2, paypal_product_id = $3 WHERE id = $1', [r.id, plan.id, productId]);
    created.push(`${name}: ${plan.id}`);
  }
  return { mode, productId, created };
}

const addDays = (d, n) => new Date(new Date(d).getTime() + n * 86400000);

// Save what PayPal tells us about a subscription. Returns our row.
export async function saveSubscription(sub) {
  const bp = await queryOne('SELECT * FROM billing_plans WHERE paypal_plan_id = $1', [sub.plan_id]);
  if (!bp) throw new Error(`Unknown PayPal plan ${sub.plan_id}`);
  const userId = UUID.test(sub.custom_id || '') ? sub.custom_id : null;
  const paid = sub.billing_info?.next_billing_time || null;
  const lastPay = sub.billing_info?.last_payment?.time || null;
  const row = await queryOne(
    `INSERT INTO subscriptions (user_id, paypal_subscription_id, mode, plan_key, billing_interval, price_cents, status, payer_email, paid_through, last_payment_at, cancelled_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CASE WHEN $7 = 'CANCELLED' THEN now() END)
     ON CONFLICT (paypal_subscription_id) DO UPDATE SET
       user_id = COALESCE(subscriptions.user_id, EXCLUDED.user_id),
       plan_key = EXCLUDED.plan_key, billing_interval = EXCLUDED.billing_interval, price_cents = EXCLUDED.price_cents,
       status = EXCLUDED.status,
       payer_email = COALESCE(EXCLUDED.payer_email, subscriptions.payer_email),
       paid_through = GREATEST(COALESCE(EXCLUDED.paid_through, subscriptions.paid_through), COALESCE(subscriptions.paid_through, EXCLUDED.paid_through)),
       last_payment_at = COALESCE(EXCLUDED.last_payment_at, subscriptions.last_payment_at),
       cancelled_at = CASE WHEN EXCLUDED.status = 'CANCELLED' THEN COALESCE(subscriptions.cancelled_at, now()) ELSE subscriptions.cancelled_at END,
       updated_at = now()
     RETURNING *`,
    [userId, sub.id, bp.mode, bp.plan_key, bp.billing_interval, bp.price_cents, sub.status || 'APPROVAL_PENDING', sub.subscriber?.email_address || null, paid, lastPay]
  );
  return row;
}

// Give or extend the plan for an active subscription. Never downgrades a better plan the user already has.
export async function applyEntitlement(row) {
  if (!row?.user_id) return { changed: false };
  const plans = await getPlans();
  const u = await queryOne('SELECT id, plan, plan_expires_at, plan_source FROM users WHERE id = $1', [row.user_id]);
  if (!u) return { changed: false };
  const cur = effectivePlanKey(u, plans);
  const curRank = plans[cur]?.rank || 0;
  const subRank = plans[row.plan_key]?.rank || 0;
  const curLifetime = cur !== 'free' && !u.plan_expires_at;

  if (LIVE_STATUSES.includes(row.status)) {
    const until = addDays(row.paid_through || addDays(new Date(), row.billing_interval === 'year' ? 366 : 31), GRACE_DAYS);
    if (cur === 'free' || subRank > curRank) {
      await query("UPDATE users SET plan = $2, plan_expires_at = $3, plan_source = 'paypal', updated_at = now() WHERE id = $1", [u.id, row.plan_key, until]);
      return { changed: true, plan: row.plan_key, until };
    }
    if (cur === row.plan_key && !curLifetime) {
      const next = u.plan_expires_at && new Date(u.plan_expires_at) > until ? new Date(u.plan_expires_at) : until;
      await query("UPDATE users SET plan_expires_at = $2, plan_source = 'paypal', updated_at = now() WHERE id = $1", [u.id, next]);
      return { changed: true, plan: row.plan_key, until: next };
    }
    return { changed: false };
  }

  // Cancelled, suspended, or expired: access ends when the paid period ends (no extra grace days).
  if (['CANCELLED', 'SUSPENDED', 'EXPIRED'].includes(row.status) && u.plan_source === 'paypal' && u.plan === row.plan_key && u.plan_expires_at) {
    const other = await queryOne(
      "SELECT 1 FROM subscriptions WHERE user_id = $1 AND status = 'ACTIVE' AND plan_key = $2 AND paypal_subscription_id <> $3",
      [u.id, row.plan_key, row.paypal_subscription_id]
    );
    if (other) return { changed: false };
    const end = row.status === 'CANCELLED' && row.paid_through && new Date(row.paid_through) > new Date() ? new Date(row.paid_through) : new Date();
    if (new Date(u.plan_expires_at) > end) {
      await query('UPDATE users SET plan_expires_at = $2, updated_at = now() WHERE id = $1', [u.id, end]);
      return { changed: true, plan: row.plan_key, until: end };
    }
  }
  return { changed: false };
}

// When a new subscription becomes active, cancel the user's older ones (for example after an upgrade).
async function cancelReplaced(row) {
  if (row.status !== 'ACTIVE' || !row.user_id) return;
  const olds = await query(
    "SELECT * FROM subscriptions WHERE user_id = $1 AND status = 'ACTIVE' AND paypal_subscription_id <> $2 AND created_at < $3",
    [row.user_id, row.paypal_subscription_id, row.created_at]
  );
  for (const o of olds) {
    try {
      await paypal('POST', `/v1/billing/subscriptions/${o.paypal_subscription_id}/cancel`, { reason: `Switched to Craftora ${row.plan_key} (${row.billing_interval})` });
      await query("UPDATE subscriptions SET status = 'CANCELLED', cancelled_at = now(), updated_at = now() WHERE id = $1", [o.id]);
    } catch (e) {
      await notify('billing', 'Could not cancel an old subscription', `${o.paypal_subscription_id}: ${e.message}. Cancel it in PayPal to avoid double billing.`);
    }
  }
}

// Fetch a subscription from PayPal, save it, and update the user's plan.
export async function syncSubscription(paypalId) {
  if (!/^I-[A-Z0-9]{6,40}$/.test(paypalId || '')) throw new Error('Invalid subscription id');
  const sub = await paypal('GET', `/v1/billing/subscriptions/${paypalId}`);
  const row = await saveSubscription(sub);
  const ent = await applyEntitlement(row);
  await cancelReplaced(row);
  return { row, ent };
}

// Can this user start a new subscription for this plan?
export async function checkCanSubscribe(userId, planKey) {
  const plans = await getPlans();
  if (!plans[planKey] || planKey === 'free') return { ok: false, error: 'Unknown plan.' };
  const u = await queryOne('SELECT plan, plan_expires_at, plan_source FROM users WHERE id = $1', [userId]);
  const cur = effectivePlanKey(u, plans);
  const curRank = plans[cur]?.rank || 0;
  const wantRank = plans[planKey].rank || 0;
  if (cur !== 'free' && !u.plan_expires_at && curRank >= wantRank) {
    return { ok: false, error: `You already have lifetime ${plans[cur].name}. No subscription needed.` };
  }
  const active = await queryOne("SELECT * FROM subscriptions WHERE user_id = $1 AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1", [userId]);
  if (active && (plans[active.plan_key]?.rank || 0) >= wantRank) {
    return { ok: false, error: `You already have an active ${plans[active.plan_key]?.name || active.plan_key} subscription. To change it, cancel it in Billing first. Your plan stays active until the end of the period you paid for.` };
  }
  if (!active && cur !== 'free' && (curRank > wantRank || (curRank === wantRank && u.plan_source !== 'paypal'))) {
    return { ok: false, error: `Your ${plans[cur].name} plan is already active until ${new Date(u.plan_expires_at).toDateString()}. You can subscribe to ${plans[planKey].name} after it ends${curRank === wantRank && planKey !== 'business' ? ', or upgrade to Business now' : ''}.` };
  }
  return { ok: true, upgradeFrom: active || null };
}

// Billing summary for the account page.
export async function userBilling(userId) {
  const plans = await getPlans();
  const u = await queryOne('SELECT plan, plan_expires_at, plan_source FROM users WHERE id = $1', [userId]);
  const key = effectivePlanKey(u, plans);
  const subs = await query(
    "SELECT paypal_subscription_id, plan_key, billing_interval, price_cents, status, paid_through, last_payment_at, cancelled_at, created_at, mode FROM subscriptions WHERE user_id = $1 AND status <> 'APPROVAL_PENDING' ORDER BY created_at DESC LIMIT 10",
    [userId]
  );
  let orders = [];
  try {
    orders = await query(
      "SELECT o.paypal_order_id, o.product_key, p.name AS product_name, o.amount_cents, o.payment_source, o.fulfilled_at FROM billing_orders o LEFT JOIN billing_products p ON p.key = o.product_key WHERE o.user_id = $1 AND o.status = 'COMPLETED' ORDER BY o.fulfilled_at DESC LIMIT 10",
      [userId]
    );
  } catch { orders = []; }
  return {
    orders,
    plan: { key, name: plans[key]?.name || 'Free', expiresAt: key === 'free' ? null : u?.plan_expires_at || null, lifetime: key !== 'free' && !u?.plan_expires_at, source: u?.plan_source || null },
    subscriptions: subs,
  };
}

// Nightly safety net: re-check subscriptions that are about to renew or are stuck waiting.
export async function syncDueSubscriptions(limit = 50) {
  const rows = await query(
    `SELECT paypal_subscription_id FROM subscriptions
      WHERE mode = $1 AND (
        (status = 'ACTIVE' AND (paid_through IS NULL OR paid_through < now() + interval '2 days'))
        OR (status IN ('APPROVAL_PENDING', 'APPROVED') AND created_at > now() - interval '3 days')
      )
      ORDER BY updated_at LIMIT $2`,
    [paypalMode(), limit]
  );
  let synced = 0, failed = 0;
  for (const r of rows) {
    try { await syncSubscription(r.paypal_subscription_id); synced++; } catch { failed++; }
  }
  return { checked: rows.length, synced, failed };
}
