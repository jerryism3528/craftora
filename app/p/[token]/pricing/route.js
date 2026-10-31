import { clickTarget } from '../../../../lib/outreach';

export const dynamic = 'force-dynamic';

// Short link used in outreach emails: counts the click, then opens pricing with the launch code applied.
export async function GET(req, { params }) {
  let to = 'https://craftora.dev/pricing';
  try { to = await clickTarget(params.token, 'pricing', req.headers.get('user-agent') || ''); } catch {}
  return Response.redirect(to, 302);
}
