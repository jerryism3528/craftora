import { currentUser } from '../../../../lib/current-user';
import { queryOne } from '../../../../lib/db';
import { paypalConfigured } from '../../../../lib/paypal';
import { checkCanBuy, createOnceOrder, createCryptoOrder } from '../../../../lib/billing-once';

export const dynamic = 'force-dynamic';
const j = (data, status = 200) => Response.json(data, { status });

// Create a one-time PayPal order (used by the PayPal, card, Apple Pay, and Google Pay buttons).
export async function POST(req) {
  const user = await currentUser();
  if (!user) return j({ ok: false, error: 'Please sign in first.', needLogin: true }, 401);
  if (!paypalConfigured()) return j({ ok: false, error: 'Payments are not available right now.' }, 503);
  let b = {};
  try { b = await req.json(); } catch {}
  const product = await queryOne('SELECT * FROM billing_products WHERE key = $1 AND active', [String(b.product || '')]);
  if (!product) return j({ ok: false, error: 'This option is not available.' }, 404);
  const can = await checkCanBuy(user.id, product);
  if (!can.ok) return j({ ok: false, error: can.error }, 409);
  const recent = await queryOne("SELECT count(*)::int AS n FROM billing_orders WHERE user_id = $1 AND status = 'CREATED' AND created_at > now() - interval '1 hour'", [user.id]);
  if ((recent?.n || 0) >= 15) return j({ ok: false, error: 'Too many checkout attempts. Please wait a few minutes.' }, 429);
  if (b.method === 'crypto') {
    if (process.env.PAYPAL_CRYPTO !== 'on') return j({ ok: false, error: 'Crypto payments are not available yet.' }, 404);
    const clean = (v) => String(v || '').replace(/[^\p{L}\p{M}' .-]/gu, '').trim().slice(0, 60);
    const first = clean(b.firstName), last = clean(b.lastName);
    if (!first || !last) return j({ ok: false, error: 'Please enter your first and last name.' }, 400);
    try {
      const r = await createCryptoOrder(user, product, { first, last });
      return j({ ok: true, id: r.id, redirect: r.redirect });
    } catch (e) {
      console.error('crypto order failed:', e.message);
      return j({ ok: false, error: 'Crypto payments are not available right now. Please use another option.' }, 502);
    }
  }
  try {
    const id = await createOnceOrder(user, product);
    return j({ ok: true, id });
  } catch (e) {
    console.error('order create failed:', e.message);
    return j({ ok: false, error: 'Could not start checkout. Please try again.' }, 502);
  }
}
