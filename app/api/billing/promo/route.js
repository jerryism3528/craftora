import { currentUser, clientIp } from '../../../../lib/current-user';
import { checkPromo, promoText } from '../../../../lib/promo';
import { hit } from '../../../../lib/iplimit';

export const dynamic = 'force-dynamic';
const j = (data, status = 200) => Response.json(data, { status });

// Check a launch code before checkout. The discount itself is always worked out again on the server at checkout.
export async function GET(req) {
  const ip = clientIp(req) || 'x';
  if (!hit(`promo:${ip}`, 30, 10 * 60_000).ok) return j({ ok: false, error: 'Too many tries. Please wait a few minutes.' }, 429);
  const code = new URL(req.url).searchParams.get('code') || '';
  const user = await currentUser().catch(() => null);
  const r = await checkPromo(code, user?.id || null);
  if (!r.ok) return j({ ok: false, error: r.error });
  return j({ ok: true, ...r.promo, text: promoText(r.promo) });
}
