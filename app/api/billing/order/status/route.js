import { currentUser } from '../../../../../lib/current-user';
import { queryOne } from '../../../../../lib/db';
import { refreshOnceOrder } from '../../../../../lib/billing-once';
import { planForUser } from '../../../../../lib/plans';

export const dynamic = 'force-dynamic';
const j = (data, status = 200) => Response.json(data, { status });

// Status of a one-time order (crypto payments finish on PayPal's side).
export async function POST(req) {
  const user = await currentUser();
  if (!user) return j({ ok: false, error: 'Please sign in first.', needLogin: true }, 401);
  let b = {};
  try { b = await req.json(); } catch {}
  const orderId = String(b.orderId || '');
  const row = await queryOne('SELECT user_id, status FROM billing_orders WHERE paypal_order_id = $1', [orderId]);
  if (!row || row.user_id !== user.id) return j({ ok: false, error: 'Order not found for this account.' }, 404);
  try {
    const r = row.status === 'COMPLETED' ? { ok: true } : await refreshOnceOrder(orderId);
    if (!r.ok) return j({ ok: false, pending: !!r.pending, error: r.error });
    const plan = await planForUser(user.id);
    return j({ ok: true, plan: { key: plan.key, name: plan.name, expiresAt: plan.expiresAt, lifetime: plan.lifetime } });
  } catch (e) {
    console.error('order status failed:', e.message);
    return j({ ok: false, pending: true, error: 'We could not check your payment yet. Your plan will be added automatically once PayPal confirms it.' });
  }
}
