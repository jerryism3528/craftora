import { query, queryOne } from '../../../../lib/db';
import { requireAdmin, logAction, ok, bad, forbid, readJson, pageArgs } from '../../../../lib/admin';

export const dynamic = 'force-dynamic';

const IMAGE_TYPES = ['image', 'images', 'img'];
const LINK_TYPES = ['link', 'links', 'short_link', 'short_links', 'url', 'shortlink'];

// GET ?type=reports|images|links&status=&q=&page=
export async function GET(req) {
  if (!(await requireAdmin())) return forbid();
  const url = new URL(req.url);
  const type = url.searchParams.get('type') || 'reports';
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const status = url.searchParams.get('status') || '';
  const { page, limit, offset } = pageArgs(url, 40);

  if (type === 'reports') {
    const st = status || 'open';
    const rows = await query(`SELECT r.* FROM reports r WHERE ($1 = 'all' OR r.status = $1) ORDER BY r.created_at DESC LIMIT $2 OFFSET $3`, [st, limit, offset]);
    const imgIds = rows.filter((r) => IMAGE_TYPES.includes(r.target_type)).map((r) => r.target_id);
    const linkIds = rows.filter((r) => LINK_TYPES.includes(r.target_type)).map((r) => r.target_id);
    const imgs = imgIds.length ? await query('SELECT id, code, original_name, removed, views, user_id, created_at FROM images WHERE id = ANY($1)', [imgIds]) : [];
    const links = linkIds.length ? await query('SELECT id, code, url, disabled, clicks, user_id, created_at FROM short_links WHERE id = ANY($1)', [linkIds]) : [];
    const im = Object.fromEntries(imgs.map((x) => [String(x.id), x]));
    const lm = Object.fromEntries(links.map((x) => [String(x.id), x]));
    const counts = await query('SELECT status, count(*)::int AS n FROM reports GROUP BY status');
    return ok({ rows: rows.map((r) => ({ ...r, image: IMAGE_TYPES.includes(r.target_type) ? im[String(r.target_id)] || null : null, link: LINK_TYPES.includes(r.target_type) ? lm[String(r.target_id)] || null : null })), counts });
  }

  if (type === 'images') {
    const args = [];
    const where = [status === 'removed' ? 'i.removed' : status === 'all' ? 'TRUE' : 'NOT i.removed'];
    if (q) { args.push(`%${q}%`); where.push(`(lower(i.code) LIKE $${args.length} OR lower(COALESCE(i.original_name, '')) LIKE $${args.length} OR lower(COALESCE(u.email, '')) LIKE $${args.length})`); }
    args.push(limit, offset);
    const rows = await query(`SELECT i.id, i.code, i.original_name, i.mime, i.width, i.height, i.size_bytes, i.views, i.removed, i.created_at, i.expires_at, i.user_id, u.email
      FROM images i LEFT JOIN users u ON u.id::text = i.user_id WHERE ${where.join(' AND ')}
      ORDER BY i.created_at DESC LIMIT $${args.length - 1} OFFSET $${args.length}`, args);
    return ok({ rows });
  }

  if (type === 'links') {
    const args = [];
    const where = [status === 'disabled' ? 'l.disabled' : status === 'all' ? 'TRUE' : 'NOT l.disabled'];
    if (q) { args.push(`%${q}%`); where.push(`(lower(l.code) LIKE $${args.length} OR lower(l.url) LIKE $${args.length} OR lower(COALESCE(u.email, '')) LIKE $${args.length})`); }
    args.push(limit, offset);
    const rows = await query(`SELECT l.id, l.code, l.url, l.clicks, l.disabled, l.created_at, l.last_click_at, l.expires_at, l.user_id, u.email
      FROM short_links l LEFT JOIN users u ON u.id::text = l.user_id WHERE ${where.join(' AND ')}
      ORDER BY l.created_at DESC LIMIT $${args.length - 1} OFFSET $${args.length}`, args);
    return ok({ rows });
  }
  return bad('Unknown type.');
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return forbid();
  const b = await readJson(req);
  const id = Number(b.id);
  if (!Number.isFinite(id)) return bad('Missing id.');

  switch (b.action) {
    case 'resolve_report':
    case 'dismiss_report': {
      const st = b.action === 'resolve_report' ? 'resolved' : 'dismissed';
      const r = await queryOne('UPDATE reports SET status = $2 WHERE id = $1 RETURNING target_type, target_id', [id, st]);
      if (!r) return bad('Report not found.');
      await logAction(admin.id, b.action, `report:${id}`);
      return ok({ message: `Report ${st}.` });
    }
    case 'remove_image':
    case 'restore_image': {
      const removed = b.action === 'remove_image';
      const r = await queryOne('UPDATE images SET removed = $2 WHERE id = $1 RETURNING code', [id, removed]);
      if (!r) return bad('Image not found.');
      if (removed) await query("UPDATE reports SET status = 'resolved' WHERE status = 'open' AND target_id = $1 AND target_type = ANY($2)", [id, IMAGE_TYPES]);
      await logAction(admin.id, b.action, `image:${r.code}`);
      return ok({ message: removed ? 'Image removed.' : 'Image restored.' });
    }
    case 'disable_link':
    case 'enable_link': {
      const disabled = b.action === 'disable_link';
      const r = await queryOne('UPDATE short_links SET disabled = $2 WHERE id = $1 RETURNING code', [id, disabled]);
      if (!r) return bad('Link not found.');
      if (disabled) await query("UPDATE reports SET status = 'resolved' WHERE status = 'open' AND target_id = $1 AND target_type = ANY($2)", [id, LINK_TYPES]);
      await logAction(admin.id, b.action, `link:${r.code}`);
      return ok({ message: disabled ? 'Link disabled.' : 'Link enabled.' });
    }
    default:
      return bad('Unknown action.');
  }
}
