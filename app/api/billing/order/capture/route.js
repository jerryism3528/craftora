import { currentUser } from '../../../../../lib/current-user';
import { queryOne } from '../../../../../lib/db';
import { captureOnceOrder } from '../../../../../lib/billing-once';
import { planForUser } from '../../../../../lib/plans';

export const dynamic = 'force-dynamic';
const j = (data, status = 200) => Response.json(data, { status });

// Capture a one-time order after the buyer approved it, then add the plan.
export async function POST(req) {
  const user = await currentUser();
  if (!user) return j({ ok: false, error: 'Please sign in first.', needLogin: true }, 401);
  let b = {};
  try { b = await req.json(); } catch {}
  const orderId = String(b.orderId || '');
  const row = await queryOne('SELECT user_id FROM billing_orders WHERE paypal_order_id = $1', [orderId]);
  if (!row || row.user_id !== user.id) return j({ ok: false, error: 'Order not found for this account.' }, 404);
  try {
    const r = await captureOnceOrder(orderId);
    if (!r.ok) return j({ ok: false, error: r.error, pending: !!r.pending }, r.pending ? 202 : 402);
    const plan = await planForUser(user.id);
    return j({ ok: true, plan: { key: plan.key, name: plan.name, expiresAt: plan.expiresAt, lifetime: plan.lifetime } });
  } catch (e) {
    console.error('capture failed:', e.message);
    const declined = /DECLINED|INSTRUMENT|UNPROCESSABLE/i.test(JSON.stringify(e.paypal || {}));
    return j({ ok: false, error: declined ? 'Your payment was declined. Please try another card or payment method.' : 'Could not complete the payment. You were not charged. Please try again.' }, 402);
  }
}
