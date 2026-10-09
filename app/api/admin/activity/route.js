import { query } from '../../../../lib/db';
import { requireAdmin, ok, forbid, pageArgs } from '../../../../lib/admin';

export const dynamic = 'force-dynamic';

// GET ?type=usage|admin&tool=&q=&page=
export async function GET(req) {
  if (!(await requireAdmin())) return forbid();
  const url = new URL(req.url);
  const type = url.searchParams.get('type') || 'usage';
  const tool = url.searchParams.get('tool') || '';
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const { page, limit, offset } = pageArgs(url, 100);

  if (type === 'admin') {
    const args = [];
    const where = ['TRUE'];
    if (q) { args.push(`%${q}%`); where.push(`(lower(l.action) LIKE $1 OR lower(COALESCE(l.target, '')) LIKE $1 OR lower(COALESCE(a.email, '')) LIKE $1)`); }
    args.push(limit, offset);
    const logs = await query(`SELECT l.id, l.action, l.target, l.detail, l.created_at, a.email AS admin_email
      FROM admin_log l LEFT JOIN users a ON a.id = l.admin_id WHERE ${where.join(' AND ')}
      ORDER BY l.created_at DESC LIMIT $${args.length - 1} OFFSET $${args.length}`, args);
    return ok({ logs, page });
  }

  const args = [];
  const where = ['TRUE'];
  if (tool) { args.push(tool); where.push(`ul.tool_slug = $${args.length}`); }
  if (q) { args.push(`%${q}%`); where.push(`(lower(COALESCE(u.email, '')) LIKE $${args.length} OR COALESCE(ul.ip, '') LIKE $${args.length})`); }
  args.push(limit, offset);
  const logs = await query(`
    SELECT ul.tool_slug, ul.amount, ul.ip, ul.created_at, u.email, u.id AS user_id
    FROM usage_log ul
    LEFT JOIN users u ON u.id = ul.user_id
    WHERE ${where.join(' AND ')}
    ORDER BY ul.created_at DESC
    LIMIT $${args.length - 1} OFFSET $${args.length}
  `, args);
  return ok({ logs, page });
}
