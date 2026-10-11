import { currentUser } from '../../../../lib/current-user';
import { queryOne } from '../../../../lib/db';
import { paypal } from '../../../../lib/paypal';
import { syncSubscription, notify } from '../../../../lib/billing';

export const dynamic = 'force-dynamic';
const j = (data, status = 200) => Response.json(data, { status });

// Cancel the user's own subscription. Access continues until the end of the paid period.
export async function POST(req) {
  const user = await currentUser();
  if (!user) return j({ ok: false, error: 'Please sign in first.', needLogin: true }, 401);
  let b = {};
  try { b = await req.json(); } catch {}
  const id = String(b.subscriptionId || '');
  const row = await queryOne('SELECT * FROM subscriptions WHERE paypal_subscription_id = $1 AND user_id = $2', [id, user.id]);
  if (!row) return j({ ok: false, error: 'Subscription not found.' }, 404);
  if (!['ACTIVE', 'SUSPENDED'].includes(row.status)) return j({ ok: false, error: 'This subscription is not active.' }, 409);
  const reason = String(b.reason || '').replace(/[^\w\s.,!?'-]/g, '').slice(0, 120) || 'Cancelled by customer on craftora.dev';
  try {
    await paypal('POST', `/v1/billing/subscriptions/${id}/cancel`, { reason });
    const { row: after } = await syncSubscription(id);
    await notify('billing', 'Subscription cancelled', `${user.email} cancelled ${after.plan_key} (${after.billing_interval}). Reason: ${reason}`);
    return j({ ok: true, status: after.status, paidThrough: after.paid_through });
  } catch (e) {
    console.error('cancel failed:', e.message);
    return j({ ok: false, error: 'Could not cancel right now. Please try again, or cancel from your PayPal account (Settings, Payments, Automatic payments).' }, 502);
  }
}
