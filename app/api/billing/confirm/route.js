import { currentUser } from '../../../../lib/current-user';
import { queryOne } from '../../../../lib/db';
import { syncSubscription } from '../../../../lib/billing';
import { planForUser } from '../../../../lib/plans';

export const dynamic = 'force-dynamic';
const j = (data, status = 200) => Response.json(data, { status });

// Called by /billing/return after PayPal sends the buyer back.
export async function POST(req) {
  const user = await currentUser();
  if (!user) return j({ ok: false, error: 'Please sign in first.', needLogin: true }, 401);
  let b = {};
  try { b = await req.json(); } catch {}
  const id = String(b.subscriptionId || '');
  const mine = await queryOne('SELECT user_id FROM subscriptions WHERE paypal_subscription_id = $1', [id]);
  if (!mine || mine.user_id !== user.id) return j({ ok: false, error: 'Subscription not found for this account.' }, 404);
  try {
    const { row } = await syncSubscription(id);
    const plan = await planForUser(user.id);
    return j({ ok: true, status: row.status, planKey: row.plan_key, interval: row.billing_interval, plan: { key: plan.key, name: plan.name, expiresAt: plan.expiresAt } });
  } catch (e) {
    console.error('confirm failed:', e.message);
    return j({ ok: false, error: 'We could not confirm your subscription yet. If you completed payment, it will appear in a few minutes.' }, 502);
  }
}
