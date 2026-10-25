import { currentUser } from '../../../../lib/current-user';
import { query, queryOne } from '../../../../lib/db';
import { paypalConfigured } from '../../../../lib/paypal';
import { checkCanBuy, createOnceOrder, createCryptoOrder, createUsdcCheckout } from '../../../../lib/billing-once';
import { coinbaseConfigured } from '../../../../lib/coinbase';
import { checkPromo, discountCents, recordRedemption } from '../../../../lib/promo';

export const dynamic = 'force-dynamic';
const j = (data, status = 200) => Response.json(data, { status });

// Create a one-time PayPal order (used by the PayPal, card, Apple Pay, and Google Pay buttons).
export async function POST(req) {
  const user = await currentUser();
  if (!user) return j({ ok: false, error: 'Please sign in first.', needLogin: true }, 401);
  let b = {};
  try { b = await req.json(); } catch {}
  const usdc = b.method === 'usdc';
  if (usdc ? !coinbaseConfigured() : !paypalConfigured()) return j({ ok: false, error: 'Payments are not available right now.' }, 503);
  const base = await queryOne('SELECT * FROM billing_products WHERE key = $1 AND active', [String(b.product || '')]);
  if (!base) return j({ ok: false, error: 'This option is not available.' }, 404);
  let promo = null, off = 0;
  if (b.code) {
    const pc = await checkPromo(b.code, user.id);
    if (!pc.ok) return j({ ok: false, error: pc.error, promoError: true }, 400);
    off = discountCents(base.price_cents, base.months, pc.promo);
    if (off > 0) promo = pc.promo;
  }
  const product = { ...base, price_cents: base.price_cents - off };
  // Remember the code on the order and count it once the payment completes.
  const tag = async (orderId) => {
    if (!promo || !orderId) return;
    await query('UPDATE billing_orders SET promo_code = $2, discount_cents = $3 WHERE paypal_order_id = $1', [orderId, promo.code, off]).catch(() => {});
    await recordRedemption({ code: promo.code, userId: user.id, kind: 'order', ref: orderId, baseCents: base.price_cents, discountCents: off });
  };
  const can = await checkCanBuy(user.id, product);
  if (!can.ok) return j({ ok: false, error: can.error }, 409);
  const recent = await queryOne("SELECT count(*)::int AS n FROM billing_orders WHERE user_id = $1 AND status = 'CREATED' AND created_at > now() - interval '1 hour'", [user.id]);
  if ((recent?.n || 0) >= 15) return j({ ok: false, error: 'Too many checkout attempts. Please wait a few minutes.' }, 429);
  if (usdc) {
    try {
      const r = await createUsdcCheckout(user, product);
      await tag(r.id);
      return j({ ok: true, id: r.id, ref: r.ref, redirect: r.redirect });
    } catch (e) {
      console.error('usdc checkout failed:', e.message);
      return j({ ok: false, error: 'USDC payments are not available right now. Please use another option.' }, 502);
    }
  }
  if (b.method === 'crypto') {
    if (process.env.PAYPAL_CRYPTO !== 'on') return j({ ok: false, error: 'Crypto payments are not available yet.' }, 404);
    const clean = (v) => String(v || '').replace(/[^\p{L}\p{M}' .-]/gu, '').trim().slice(0, 60);
    const first = clean(b.firstName), last = clean(b.lastName);
    if (!first || !last) return j({ ok: false, error: 'Please enter your first and last name.' }, 400);
    try {
      const r = await createCryptoOrder(user, product, { first, last });
      await tag(r.id);
      return j({ ok: true, id: r.id, redirect: r.redirect });
    } catch (e) {
      console.error('crypto order failed:', e.message);
      return j({ ok: false, error: 'Crypto payments are not available right now. Please use another option.' }, 502);
    }
  }
  try {
    const id = await createOnceOrder(user, product);
    await tag(id);
    return j({ ok: true, id });
  } catch (e) {
    console.error('order create failed:', e.message);
    return j({ ok: false, error: 'Could not start checkout. Please try again.' }, 502);
  }
}
