import { query } from '../../../../lib/db';
import { verifyCoinbaseWebhook, coinbaseConfigured } from '../../../../lib/coinbase';
import { refreshCoinbaseOrder } from '../../../../lib/billing-once';
import { notify } from '../../../../lib/billing';

export const dynamic = 'force-dynamic';

// Coinbase Business checkout events. We never trust the payload alone: every event re-reads the checkout from Coinbase.
export async function POST(req) {
  if (!coinbaseConfigured()) return new Response('not configured', { status: 503 });
  const raw = await req.text();
  if (!verifyCoinbaseWebhook(raw, req.headers)) return new Response('bad signature', { status: 400 });
  let ev = {};
  try { ev = JSON.parse(raw); } catch { return new Response('bad json', { status: 400 }); }
  const type = String(ev.eventType || '');
  const id = String(ev.id || '');
  const eventId = `cb_${id}_${type}_${ev.updatedAt || ''}`.slice(0, 200);
  try {
    await query(
      "INSERT INTO billing_events (event_id, event_type, resource_id, mode, payload) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (event_id) DO NOTHING",
      [eventId, type, id, process.env.COINBASE_MODE === 'live' ? 'live' : 'sandbox', raw]
    ).catch(() => {});
    if (type.startsWith('checkout.payment.')) {
      const r = await refreshCoinbaseOrder(id);
      if (!r.ok && !r.pending && r.error !== 'Order not found.' && type === 'checkout.payment.success') {
        await notify('billing', 'USDC payment needs review', `Checkout ${id}: ${r.error}`);
      }
    } else if (type.startsWith('checkout.refund.')) {
      await notify('billing', 'USDC refund update', `Checkout ${id}: ${type}`);
    }
    await query('UPDATE billing_events SET processed = true WHERE event_id = $1', [eventId]).catch(() => {});
  } catch (e) {
    console.error('coinbase webhook failed:', e.message);
    return new Response('retry', { status: 500 });
  }
  return new Response('ok');
}
