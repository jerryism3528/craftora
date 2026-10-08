import { currentUser } from '../../../../../lib/current-user';
import { query } from '../../../../../lib/db';
import { getAuditRow, progressFor, compareWithPrevious } from '../../../../../lib/seo-jobs';
import { getTool } from '../../../../../lib/tools';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function GET(_req, { params }) {
  const row = await getAuditRow(params.id);
  if (!row) return json({ error: 'Report not found.' }, 404);
  const user = await currentUser();
  const isOwner = !!user && user.id === row.user_id;
  if (!isOwner && !row.is_public) return json({ error: 'This report is private.' }, user ? 403 : 401);

  if (row.report) {
    for (const c of row.report.checks) {
      c.tools = (c.tools || []).map((slug) => getTool(slug)).filter((t) => t && t.status === 'live').map((t) => ({ slug: t.slug, name: t.name }));
    }
  }
  const compare = isOwner ? await compareWithPrevious(row) : null;
  return json({
    id: row.id,
    site: row.site,
    startUrl: row.start_url,
    status: row.status,
    score: row.score,
    error: row.error,
    isPublic: row.is_public,
    createdAt: row.created_at,
    finishedAt: row.finished_at,
    progress: row.status === 'running' ? progressFor(row.id) : null,
    report: row.report,
    compare,
    isOwner,
  });
}

export async function PATCH(req, { params }) {
  const user = await currentUser();
  if (!user) return json({ error: 'Please sign in.' }, 401);
  const row = await getAuditRow(params.id);
  if (!row || row.user_id !== user.id) return json({ error: 'Report not found.' }, 404);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  await query('UPDATE seo_audits SET is_public = $2 WHERE id = $1', [row.id, !!body?.isPublic]);
  return json({ ok: true, isPublic: !!body?.isPublic });
}

export async function DELETE(_req, { params }) {
  const user = await currentUser();
  if (!user) return json({ error: 'Please sign in.' }, 401);
  const row = await getAuditRow(params.id);
  if (!row || row.user_id !== user.id) return json({ error: 'Report not found.' }, 404);
  if (row.status === 'running') return json({ error: 'Wait for the audit to finish before deleting it.' }, 400);
  await query('DELETE FROM seo_audits WHERE id = $1', [row.id]);
  return json({ ok: true });
}
