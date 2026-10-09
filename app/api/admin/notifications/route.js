import { query } from '../../../../lib/db';
import { requireAdmin, ok, bad, forbid, readJson } from '../../../../lib/admin';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  if (!(await requireAdmin())) return forbid();
  const unreadOnly = new URL(req.url).searchParams.get('unread') === '1';
  const rows = await query(`SELECT * FROM admin_notifications ${unreadOnly ? 'WHERE NOT is_read' : ''} ORDER BY created_at DESC LIMIT 200`);
  const unread = (await query('SELECT count(*)::int AS n FROM admin_notifications WHERE NOT is_read'))[0].n;
  return ok({ rows, unread });
}

export async function POST(req) {
  if (!(await requireAdmin())) return forbid();
  const b = await readJson(req);
  if (b.action === 'read_all') { await query('UPDATE admin_notifications SET is_read = true WHERE NOT is_read'); return ok({ message: 'All marked as read.' }); }
  if (b.action === 'read') { await query('UPDATE admin_notifications SET is_read = true WHERE id = $1', [Number(b.id)]); return ok({}); }
  if (b.action === 'delete_read') { await query('DELETE FROM admin_notifications WHERE is_read'); return ok({ message: 'Read notifications cleared.' }); }
  return bad('Unknown action.');
}
