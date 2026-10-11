import { query, queryOne } from '../../../../lib/db';
import { requireAdmin, logAction, ok, bad, forbid, readJson } from '../../../../lib/admin';
import { paypal, paypalMode, paypalConfigured } from '../../../../lib/paypal';
import { setupPaypalPlans, syncSubscription, syncDueSubscriptions } from '../../../../lib/billing';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  if (!(await requireAdmin())) return forbid();
  const mode = paypalMode();
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || '';
  const q = (url.searchParams.get('q') || '').trim();
  const params = [mode];
  let where = 's.mode = $1';
  if (status) { params.push(status); where += ` AND s.status = $${params.length}`; }
  else where += " AND s.status <> 'APPROVAL_PENDING'";
  if (q) { params.push(`%${q}%`); where += ` AND (u.email ILIKE $${params.length} OR s.payer_email ILIKE $${params.length} OR s.paypal_subscription_id ILIKE $${params.length})`; }

  const [plans, subs, payments, events, stats] = await Promise.all([
    query('SELECT * FROM billing_plans WHERE mode = $1 ORDER BY plan_key, billing_interval', [mode]),
    query(`SELECT s.*, u.email AS user_email, u.username FROM subscriptions s LEFT JOIN users u ON u.id = s.user_id WHERE ${where} ORDER BY s.created_at DESC LIMIT 200`, params),
    query('SELECT p.*, u.email AS user_email FROM billing_payments p LEFT JOIN users u ON u.id = p.user_id WHERE p.mode = $1 ORDER BY p.created_at DESC LIMIT 50', [mode]),
    query('SELECT id, event_id, event_type, resource_id, processed, error, received_at FROM billing_events WHERE mode = $1 ORDER BY received_at DESC LIMIT 50', [mode]),
    queryOne(`SELECT
        (SELECT count(*)::int FROM subscriptions WHERE mode = $1 AND status = 'ACTIVE') AS active,
        (SELECT COALESCE(sum(CASE WHEN billing_interval = 'year' THEN price_cents / 12.0 ELSE price_cents END), 0)::int FROM subscriptions WHERE mode = $1 AND status = 'ACTIVE') AS mrr_cents,
        (SELECT COALESCE(sum(amount_cents), 0)::int FROM billing_payments WHERE mode = $1 AND kind = 'payment' AND created_at > now() - interval '30 days') AS revenue30_cents,
        (SELECT COALESCE(sum(amount_cents), 0)::int FROM billing_payments WHERE mode = $1 AND kind = 'refund' AND created_at > now() - interval '30 days') AS refunds30_cents,
        (SELECT count(*)::int FROM subscriptions WHERE mode = $1 AND status = 'CANCELLED' AND cancelled_at > now() - interval '30 days') AS cancelled30,
        (SELECT count(*)::int FROM billing_events WHERE mode = $1 AND error IS NOT NULL AND NOT processed) AS event_errors`, [mode]),
  ]);
  return ok({
    mode,
    configured: paypalConfigured(),
    webhookSet: !!process.env.PAYPAL_WEBHOOK_ID,
    plans, subscriptions: subs, payments, events, stats,
  });
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return forbid();
  if (!paypalConfigured()) return bad('PayPal keys are missing in .env.');
  const b = await readJson(req);
  try {
    if (b.action === 'setup_plans') {
      const r = await setupPaypalPlans();
      await logAction(admin.id, 'billing_setup_plans', r.mode, r);
      return ok({ message: r.created.length ? `Created in PayPal (${r.mode}): ${r.created.join('; ')}` : `All plans already exist in PayPal (${r.mode}).`, result: r });
    }
    if (b.action === 'sync') {
      const { row } = await syncSubscription(String(b.id || ''));
      return ok({ message: `Synced: ${row.status}.` });
    }
    if (b.action === 'sync_due') {
      const r = await syncDueSubscriptions(200);
      return ok({ message: `Checked ${r.checked}, synced ${r.synced}, failed ${r.failed}.` });
    }
    if (b.action === 'cancel') {
      const id = String(b.id || '');
      await paypal('POST', `/v1/billing/subscriptions/${id}/cancel`, { reason: String(b.reason || 'Cancelled by Craftora support').slice(0, 120) });
      const { row } = await syncSubscription(id);
      await logAction(admin.id, 'billing_cancel', id, { status: row.status });
      return ok({ message: `Cancelled. The plan stays active until ${row.paid_through ? new Date(row.paid_through).toDateString() : 'now'}.` });
    }
    if (b.action === 'retry_event') {
      const ev = await queryOne('SELECT payload FROM billing_events WHERE id = $1', [Number(b.id)]);
      const subId = ev?.payload?.resource?.billing_agreement_id || ev?.payload?.resource?.id;
      if (!subId || !/^I-/.test(subId)) return bad('This event is not about a subscription.');
      await syncSubscription(subId);
      await query('UPDATE billing_events SET processed = true, error = NULL WHERE id = $1', [Number(b.id)]);
      return ok({ message: 'Event re-processed.' });
    }
    return bad('Unknown action.');
  } catch (e) {
    return bad(e.message || 'PayPal error.');
  }
}
