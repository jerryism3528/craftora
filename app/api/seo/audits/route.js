import { currentUser, clientIp } from '../../../../lib/current-user';
import { checkToolAccess, recordUsage } from '../../../../lib/limits';
import { query } from '../../../../lib/db';
import { startSiteAudit, cleanupStale, progressFor } from '../../../../lib/seo-jobs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TOOL = 'seo-site-audit';
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function GET() {
  const user = await currentUser();
  if (!user) return json({ error: 'Please sign in.', needLogin: true }, 401);
  const rows = await query(
    'SELECT id, site, start_url, status, score, pages, summary, error, is_public, created_at, finished_at, (report IS NOT NULL) AS has_report FROM seo_audits WHERE user_id = $1 ORDER BY created_at DESC LIMIT 300',
    [user.id]
  );
  const list = rows.rows || rows;
  for (const r of list) {
    await cleanupStale(r);
    if (r.status === 'running') r.progress = progressFor(r.id);
  }
  const access = await checkToolAccess(user.id, TOOL);
  return json({ audits: list, remaining: access.remaining ?? 0, dailyLimit: access.dailyLimit ?? 0, isAdmin: !!access.isAdmin });
}

export async function POST(req) {
  const user = await currentUser();
  if (!user) return json({ error: 'Please sign in to run a full-site audit.', needLogin: true }, 401);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request.' }, 400); }

  const access = await checkToolAccess(user.id, TOOL);
  if (!access.allowed) return json({ error: access.reason }, 429);

  try {
    const started = await startSiteAudit(user.id, body?.url);
    await recordUsage(user.id, clientIp(req), TOOL, 1);
    return json({ ok: true, ...started });
  } catch (e) {
    return json({ error: e.message || 'Could not start the audit.' }, 400);
  }
}
