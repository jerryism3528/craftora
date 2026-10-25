import { outreachAuthorized } from '../../../../lib/outreach-auth';
import { inbound } from '../../../../lib/outreach';

export const dynamic = 'force-dynamic';

// n8n forwards every new email from the four outreach inboxes here: replies, "no" answers and bounces.
export async function POST(req) {
  if (!outreachAuthorized(req)) return Response.json({ ok: false, error: 'Forbidden.' }, { status: 403 });
  let body = {};
  try { body = await req.json(); } catch { return Response.json({ ok: false, error: 'Send JSON.' }, { status: 400 }); }
  try {
    return Response.json(await inbound(body));
  } catch (e) {
    console.error('outreach inbound failed:', e.message);
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
