import { query, queryOne } from './db';
import { paypal, paypalMode } from './paypal';

// Launch codes: a percent off the first N months, on subscriptions and one-time plans.

export const normCode = (c) => String(c || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);

// Discount in cents for a price that covers `months` months (null = lifetime, never discounted).
export function discountCents(priceCents, months, promo) {
  if (!promo || !months || !priceCents) return 0;
  const covered = Math.min(months, promo.months);
  return Math.round((priceCents * covered / months) * promo.percent / 100);
}

export async function findPromo(code) {
  const c = normCode(code);
  if (!c) return null;
  try {
    return await queryOne(
      `SELECT p.*, (SELECT count(*)::int FROM promo_redemptions r WHERE r.code = p.code AND r.status = 'paid') AS used
         FROM promo_codes p WHERE p.code = $1`,
      [c]
    );
  } catch { return null; }
}

// Is this code usable right now (by this user, when signed in)? Returns { ok, promo } or { ok: false, error }.
export async function checkPromo(code, userId = null) {
  const p = await findPromo(code);
  if (!p || !p.active) return { ok: false, error: 'This code is not valid.' };
  if (p.expires_at && new Date(p.expires_at) <= new Date()) return { ok: false, error: 'This code has expired.' };
  if (p.max_uses && p.used >= p.max_uses) return { ok: false, error: 'This code has reached its limit.' };
  if (userId) {
    const prev = await queryOne("SELECT code FROM promo_redemptions WHERE user_id = $1 AND status = 'paid' LIMIT 1", [userId]);
    if (prev) return { ok: false, error: 'Your account has already used a launch code.' };
  }
  return { ok: true, promo: { code: p.code, percent: p.percent, months: p.months } };
}

export const promoText = (p) => `${p.percent}% off your first ${p.months === 1 ? 'month' : `${p.months} months`}`;

// A PayPal plan that bills the discounted price first, then the normal price. Created once per price.
export async function promoPaypalPlan(bp, promo) {
  const mode = paypalMode();
  const found = await queryOne(
    `SELECT * FROM billing_promo_plans WHERE mode = $1 AND plan_key = $2 AND billing_interval = $3 AND percent = $4 AND promo_months = $5 AND base_cents = $6 AND paypal_plan_id IS NOT NULL`,
    [mode, bp.plan_key, bp.billing_interval, promo.percent, promo.months, bp.price_cents]
  );
  if (found) return found;
  if (!bp.paypal_product_id) throw new Error('PayPal product missing. Create the plans in admin Billing first.');
  const yearly = bp.billing_interval === 'year';
  const trialCycles = yearly ? 1 : promo.months;
  const trialCents = yearly
    ? bp.price_cents - discountCents(bp.price_cents, 12, promo)
    : bp.price_cents - discountCents(bp.price_cents, 1, { ...promo, months: 1 });
  const unit = yearly ? 'YEAR' : 'MONTH';
  const name = `Craftora ${bp.plan_key === 'business' ? 'Business' : 'Pro'} (${yearly ? 'Yearly' : 'Monthly'}, ${promo.percent}% off first ${promo.months} months)`;
  const plan = await paypal('POST', '/v1/billing/plans', {
    product_id: bp.paypal_product_id,
    name: name.slice(0, 127),
    description: `${yearly ? 'First year' : `First ${promo.months} months`} at a launch discount, then the normal price. Cancel any time.`,
    status: 'ACTIVE',
    billing_cycles: [
      {
        frequency: { interval_unit: unit, interval_count: 1 },
        tenure_type: 'TRIAL',
        sequence: 1,
        total_cycles: trialCycles,
        pricing_scheme: { fixed_price: { value: (trialCents / 100).toFixed(2), currency_code: bp.currency || 'USD' } },
      },
      {
        frequency: { interval_unit: unit, interval_count: 1 },
        tenure_type: 'REGULAR',
        sequence: 2,
        total_cycles: 0,
        pricing_scheme: { fixed_price: { value: (bp.price_cents / 100).toFixed(2), currency_code: bp.currency || 'USD' } },
      },
    ],
    payment_preferences: { auto_bill_outstanding: true, setup_fee_failure_action: 'CONTINUE', payment_failure_threshold: 2 },
  }, { requestId: `craftora-promo-${mode}-${bp.plan_key}-${bp.billing_interval}-${bp.price_cents}-${promo.percent}-${promo.months}` });
  return queryOne(
    `INSERT INTO billing_promo_plans (mode, plan_key, billing_interval, percent, promo_months, base_cents, trial_cents, trial_cycles, paypal_plan_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (paypal_plan_id) DO UPDATE SET trial_cents = EXCLUDED.trial_cents RETURNING *`,
    [mode, bp.plan_key, bp.billing_interval, promo.percent, promo.months, bp.price_cents, trialCents, trialCycles, plan.id]
  );
}

// What the subscriber pays during the discounted period (for display and records).
export function subscriptionPromoPrice(baseCents, interval, promo) {
  if (interval === 'year') return { cents: baseCents - discountCents(baseCents, 12, promo), cycles: 1 };
  return { cents: baseCents - discountCents(baseCents, 1, { ...promo, months: 1 }), cycles: promo.months };
}

export async function recordRedemption({ code, userId, kind, ref, baseCents, discountCents: off }) {
  await query(
    `INSERT INTO promo_redemptions (code, user_id, kind, ref, base_cents, discount_cents)
     VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (ref) DO NOTHING`,
    [code, userId, kind, ref, baseCents, off]
  ).catch((e) => console.error('promo redemption failed:', e.message));
}

// Called when the subscription becomes active or the one-time order is paid.
export async function markPromoPaid(ref) {
  if (!ref) return;
  await query("UPDATE promo_redemptions SET status = 'paid', paid_at = now() WHERE ref = $1 AND status <> 'paid'", [ref]).catch(() => {});
}
