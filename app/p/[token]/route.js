import { clickTarget } from '../../../lib/outreach';

export const dynamic = 'force-dynamic';

// Short link used in outreach emails: counts the click, then opens the private tools page.
export async function GET(req, { params }) {
  let to = 'https://craftora.dev/private-pdf-tools';
  try { to = await clickTarget(params.token, '', req.headers.get('user-agent') || ''); } catch {}
  return Response.redirect(to, 302);
}
