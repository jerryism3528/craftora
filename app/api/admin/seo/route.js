import { query, queryOne } from '../../../../lib/db';
import { requireAdmin, logAction, ok, bad, forbid, readJson, pageArgs } from '../../../../lib/admin';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  if (!(await requireAdmin())) return forbid();
  const url = new URL(req.url);
  const { page, limit, offset } = pageArgs(url, 40);
  const status = url.searchParams.get('status') || '';
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const args = [];
  const where = ['TRUE'];
  if (status) { args.push(status); where.push(`a.status = $${args.length}`); }
  if (q) { args.push(`%${q}%`); where.push(`(lower(a.site) LIKE $${args.length} OR lower(COALESCE(u.email, '')) LIKE $${args.length})`); }
  const w = where.join(' AND ');
  const total = await queryOne(`SELECT count(*)::int AS n FROM seo_audits a LEFT JOIN users u ON u.id::text = a.user_id WHERE ${w}`, args);
  args.push(limit, offset);
  const rows = await query(`SELECT a.id, a.site, a.start_url, a.status, a.score, a.pages, a.error, a.is_public, a.created_at, a.finished_at, u.email,
      EXTRACT(EPOCH FROM (COALESCE(a.finished_at, now()) - a.created_at))::int AS seconds,
      a.summary
    FROM seo_audits a LEFT JOIN users u ON u.id::text = a.user_id WHERE ${w}
    ORDER BY a.created_at DESC LIMIT $${args.length - 1} OFFSET $${args.length}`, args);
  const counts = await query('SELECT status, count(*)::int AS n FROM seo_audits GROUP BY status');
  const topSites = await query(`SELECT site, count(*)::int AS n, round(avg(score))::int AS avg_score FROM seo_audits WHERE status = 'done' GROUP BY site ORDER BY n DESC LIMIT 8`);
  return ok({ rows, total: total.n, page, pages: Math.max(1, Math.ceil(total.n / limit)), counts, topSites });
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return forbid();
  const b = await readJson(req);
  const id = String(b.id || '');
  if (!id) return bad('Missing id.');
  if (b.action === 'delete') {
    const r = await queryOne('DELETE FROM seo_audits WHERE id = $1 RETURNING site', [id]);
    if (!r) return bad('Audit not found.');
    await logAction(admin.id, 'delete_audit', r.site, { id });
    return ok({ message: 'Audit deleted.' });
  }
  if (b.action === 'stop') {
    const r = await queryOne("UPDATE seo_audits SET status = 'failed', error = 'Stopped by admin', finished_at = now() WHERE id = $1 AND status = 'running' RETURNING site", [id]);
    if (!r) return bad('Audit is not running.');
    await logAction(admin.id, 'stop_audit', r.site, { id });
    return ok({ message: 'Audit stopped.' });
  }
  if (b.action === 'unpublish') {
    await query('UPDATE seo_audits SET is_public = false WHERE id = $1', [id]);
    await logAction(admin.id, 'unpublish_audit', id);
    return ok({ message: 'Share link turned off.' });
  }
  return bad('Unknown action.');
}
