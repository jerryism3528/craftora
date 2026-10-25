import { currentUser } from '../../../../lib/current-user';
import { query, queryOne } from '../../../../lib/db';
import { paypal, paypalMode, paypalConfigured } from '../../../../lib/paypal';
import { checkCanSubscribe, saveSubscription } from '../../../../lib/billing';
import { SITE } from '../../../../lib/company';
import { checkPromo, promoPaypalPlan, recordRedemption, subscriptionPromoPrice } from '../../../../lib/promo';

export const dynamic = 'force-dynamic';
const j = (data, status = 200) => Response.json(data, { status });

// Start a PayPal subscription and return the PayPal approval link.
export async function POST(req) {
  const user = await currentUser();
  if (!user) return j({ ok: false, error: 'Please sign in first.', needLogin: true }, 401);
  if (!paypalConfigured()) return j({ ok: false, error: 'Payments are not available right now. Please try again later.' }, 503);

  let b = {};
  try { b = await req.json(); } catch {}
  const planKey = String(b.plan || '');
  const interval = b.interval === 'year' ? 'year' : 'month';

  const bp = await queryOne('SELECT * FROM billing_plans WHERE mode = $1 AND plan_key = $2 AND billing_interval = $3 AND active', [paypalMode(), planKey, interval]);
  if (!bp?.paypal_plan_id) return j({ ok: false, error: 'This plan is not available yet. Please try again later.' }, 503);

  const can = await checkCanSubscribe(user.id, planKey);
  if (!can.ok) return j({ ok: false, error: can.error }, 409);

  let promo = null, planId = bp.paypal_plan_id;
  if (b.code) {
    const pc = await checkPromo(b.code, user.id);
    if (!pc.ok) return j({ ok: false, error: pc.error, promoError: true }, 400);
    promo = pc.promo;
  }

  const recent = await queryOne("SELECT count(*)::int AS n FROM subscriptions WHERE user_id = $1 AND status = 'APPROVAL_PENDING' AND created_at > now() - interval '1 hour'", [user.id]);
  if ((recent?.n || 0) >= 10) return j({ ok: false, error: 'Too many checkout attempts. Please wait a few minutes and try again.' }, 429);

  try {
    if (promo) planId = (await promoPaypalPlan(bp, promo)).paypal_plan_id;
    const sub = await paypal('POST', '/v1/billing/subscriptions', {
      plan_id: planId,
      custom_id: user.id,
      subscriber: user.email ? { email_address: user.email } : undefined,
      application_context: {
        brand_name: 'Craftora',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${SITE}/billing/return`,
        cancel_url: `${SITE}/pricing?checkout=cancelled`,
      },
    });
    await saveSubscription(sub);
    if (promo) {
      const pp = subscriptionPromoPrice(bp.price_cents, interval, promo);
      await query('UPDATE subscriptions SET promo_code = $2 WHERE paypal_subscription_id = $1', [sub.id, promo.code]);
      await recordRedemption({ code: promo.code, userId: user.id, kind: 'subscription', ref: sub.id, baseCents: bp.price_cents * pp.cycles, discountCents: (bp.price_cents - pp.cents) * pp.cycles });
    }
    const approve = (sub.links || []).find((l) => l.rel === 'approve')?.href;
    if (!approve) throw new Error('PayPal did not return an approval link.');
    return j({ ok: true, id: sub.id, approveUrl: approve });
  } catch (e) {
    console.error('subscribe failed:', e.message);
    await query("INSERT INTO admin_notifications (type, title, body, target_type) VALUES ('billing', 'Checkout failed', $1, 'billing')", [`${user.email}: ${e.message}`]).catch(() => {});
    return j({ ok: false, error: 'Could not start checkout with PayPal. Please try again in a minute.' }, 502);
  }
}
