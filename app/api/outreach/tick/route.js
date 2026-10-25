import { outreachAuthorized } from '../../../../lib/outreach-auth';
import { tick } from '../../../../lib/outreach';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// Called by n8n every few minutes. Sends at most one email per inbox per call.
export async function POST(req) {
  if (!outreachAuthorized(req)) return Response.json({ ok: false, error: 'Forbidden.' }, { status: 403 });
  try {
    return Response.json(await tick());
  } catch (e) {
    console.error('outreach tick failed:', e.message);
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
