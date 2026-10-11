import { query, queryOne } from '../../../../lib/db';
import { verifyWebhook, paypalMode } from '../../../../lib/paypal';
import { syncSubscription, notify, money } from '../../../../lib/billing';

export const dynamic = 'force-dynamic';

const toCents = (v) => Math.round(Number(v || 0) * 100);

async function recordPayment({ txnId, subId, kind, amount, currency, status }) {
  if (!txnId) return;
  const sub = subId ? await queryOne('SELECT user_id FROM subscriptions WHERE paypal_subscription_id = $1', [subId]) : null;
  await query(
    `INSERT INTO billing_payments (user_id, paypal_subscription_id, paypal_txn_id, kind, amount_cents, currency, status, mode)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (paypal_txn_id) DO UPDATE SET status = EXCLUDED.status`,
    [sub?.user_id || null, subId || null, txnId, kind, toCents(amount), currency || 'USD', status || null, paypalMode()]
  );
}

async function handle(ev) {
  const t = ev.event_type || '';
  const r = ev.resource || {};

  if (t.startsWith('BILLING.SUBSCRIPTION.')) {
    if (!r.id) return;
    const { row } = await syncSubscription(r.id);
    if (t === 'BILLING.SUBSCRIPTION.ACTIVATED') await notify('billing', 'New subscription', `${row.payer_email || 'A customer'} subscribed to ${row.plan_key} (${row.billing_interval}) for ${money(row.price_cents)}.`);
    if (t === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED') await notify('billing', 'Subscription payment failed', `${row.payer_email || row.paypal_subscription_id}: ${row.plan_key} renewal failed. PayPal will retry.`);
    if (t === 'BILLING.SUBSCRIPTION.SUSPENDED') await notify('billing', 'Subscription suspended', `${row.payer_email || row.paypal_subscription_id}: ${row.plan_key} suspended after failed payments.`);
    return;
  }

  if (t === 'PAYMENT.SALE.COMPLETED') {
    const subId = r.billing_agreement_id || null;
    await recordPayment({ txnId: r.id, subId, kind: 'payment', amount: r.amount?.total, currency: r.amount?.currency, status: r.state });
    if (subId) await syncSubscription(subId);
    return;
  }

  if (t === 'PAYMENT.SALE.REFUNDED' || t === 'PAYMENT.SALE.REVERSED') {
    await recordPayment({ txnId: r.id, subId: r.billing_agreement_id || null, kind: 'refund', amount: r.amount?.total, currency: r.amount?.currency, status: r.state || t });
    await notify('billing', t.endsWith('REVERSED') ? 'Payment reversed' : 'Payment refunded', `${money(toCents(r.amount?.total))} for sale ${r.sale_id || r.id}. Check if the customer's plan should be removed (Users, set plan).`);
    return;
  }

  if (t === 'PAYMENT.CAPTURE.COMPLETED') {
    await recordPayment({ txnId: r.id, subId: null, kind: 'payment', amount: r.amount?.value, currency: r.amount?.currency_code, status: r.status });
    return;
  }

  if (t === 'PAYMENT.CAPTURE.REFUNDED' || t === 'PAYMENT.CAPTURE.REVERSED') {
    await recordPayment({ txnId: r.id, subId: null, kind: 'refund', amount: r.amount?.value, currency: r.amount?.currency_code, status: r.status || t });
    await notify('billing', 'Payment refunded', `${money(toCents(r.amount?.value))} refunded (${r.id}).`);
    return;
  }

  if (t.startsWith('CUSTOMER.DISPUTE.')) {
    const amt = r.dispute_amount ? money(toCents(r.dispute_amount.value)) : '';
    await notify('billing', `PayPal dispute: ${t.replace('CUSTOMER.DISPUTE.', '').toLowerCase()}`, `${amt} ${r.reason || ''} (${r.dispute_id || r.id || ''}). Respond in PayPal Resolution Center.`.trim());
  }
  // Everything else is stored in billing_events and ignored.
}

export async function POST(req) {
  const raw = await req.text();
  if (!(await verifyWebhook(req.headers, raw))) return Response.json({ ok: false }, { status: 400 });

  let ev;
  try { ev = JSON.parse(raw); } catch { return Response.json({ ok: false }, { status: 400 }); }
  if (!ev?.id) return Response.json({ ok: false }, { status: 400 });

  const resId = ev.resource?.id || null;
  const ins = await queryOne(
    `INSERT INTO billing_events (event_id, event_type, resource_id, mode, payload) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (event_id) DO NOTHING RETURNING id`,
    [ev.id, ev.event_type || 'unknown', resId, paypalMode(), ev]
  );
  if (!ins) {
    const prev = await queryOne('SELECT processed FROM billing_events WHERE event_id = $1', [ev.id]);
    if (prev?.processed) return Response.json({ ok: true, duplicate: true });
  }

  try {
    await handle(ev);
    await query('UPDATE billing_events SET processed = true, error = NULL WHERE event_id = $1', [ev.id]);
    return Response.json({ ok: true });
  } catch (e) {
    console.error('webhook handling failed:', ev.event_type, e.message);
    await query('UPDATE billing_events SET error = $2 WHERE event_id = $1', [ev.id, String(e.message).slice(0, 500)]);
    // Not ours (for example a plan created outside Craftora): no point in PayPal retrying.
    if (e.status === 404 || /^(Unknown PayPal plan|Invalid subscription id)/.test(e.message)) return Response.json({ ok: true, ignored: true });
    return Response.json({ ok: false }, { status: 500 }); // PayPal will retry later
  }
}
