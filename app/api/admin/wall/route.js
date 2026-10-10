import { query, queryOne } from '../../../../lib/db';
import { requireAdmin, logAction, ok, bad, forbid, readJson } from '../../../../lib/admin';
import { cleanName, safeUrl } from '../../../../lib/supporters';
import { LEVELS, adminRow, deletePhoto } from '../../../../lib/wall';

export const dynamic = 'force-dynamic';

// GET ?level=&q=&show=all|visible|hidden|photos
export async function GET(req) {
  if (!(await requireAdmin())) return forbid();
  const url = new URL(req.url);
  const level = url.searchParams.get('level') || '';
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const show = url.searchParams.get('show') || 'all';
  const args = [];
  const where = ['TRUE'];
  if (LEVELS.includes(level)) { args.push(level); where.push(`w.level = $${args.length}`); }
  if (q) { args.push(`%${q}%`); where.push(`(lower(w.name) LIKE $${args.length} OR lower(COALESCE(w.email, u.email, '')) LIKE $${args.length} OR lower(w.source) LIKE $${args.length})`); }
  if (show === 'visible') where.push('w.visible');
  if (show === 'hidden') where.push('NOT w.visible');
  if (show === 'photos') where.push('w.pending_photo IS NOT NULL');
  const rows = await query(`SELECT w.*, u.email AS account_email FROM wall_entries w LEFT JOIN users u ON u.id = w.user_id
    WHERE ${where.join(' AND ')} ORDER BY w.pinned DESC, w.created_at DESC, w.id DESC LIMIT 1000`, args);
  const counts = await query(`SELECT level, count(*)::int AS n, count(*) FILTER (WHERE visible)::int AS visible FROM wall_entries GROUP BY level`);
  const pending = await queryOne('SELECT count(*)::int AS n FROM wall_entries WHERE pending_photo IS NOT NULL');
  return ok({ rows: rows.map(adminRow), counts, pendingPhotos: pending.n });
}

function fields(b) {
  const name = cleanName(b.name);
  if (name.length < 2) throw new Error('Name needs at least 2 characters.');
  const level = LEVELS.includes(b.level) ? b.level : 'supporter';
  const url = b.url ? safeUrl(b.url) : '';
  if (b.url && !url) throw new Error('Website must start with http:// or https://');
  const photo = b.photo ? String(b.photo).trim() : '';
  if (photo && !/^[a-f0-9]{24}\.(jpg|png|webp)$/.test(photo) && !photo.startsWith('/')) throw new Error('Upload the photo with the Upload button.');
  return {
    name, level, url: url || null, photo: photo || null,
    source: String(b.source || '').slice(0, 40), note: String(b.note || '').slice(0, 500),
    visible: b.visible !== false, pinned: !!b.pinned,
  };
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return forbid();
  const b = await readJson(req);
  try {
    if (b.action === 'create') {
      const f = fields(b);
      const r = await queryOne(`INSERT INTO wall_entries (name, level, url, photo, source, note, visible, pinned) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [f.name, f.level, f.url, f.photo, f.source, f.note, f.visible, f.pinned]);
      await logAction(admin.id, 'wall_add', f.name, { id: r.id, level: f.level, source: f.source });
      return ok({ message: `${f.name} added to the wall.`, id: r.id });
    }

    const id = Number(b.id);
    if (!Number.isFinite(id)) return bad('Missing entry.');
    const cur = await queryOne('SELECT * FROM wall_entries WHERE id = $1', [id]);
    if (!cur) return bad('Entry not found.');

    if (b.action === 'update') {
      const f = fields(b);
      if (cur.photo && cur.photo !== f.photo) await deletePhoto(cur.photo);
      await query(`UPDATE wall_entries SET name=$2, level=$3, url=$4, photo=$5, source=$6, note=$7, visible=$8, pinned=$9, updated_at=now() WHERE id=$1`,
        [id, f.name, f.level, f.url, f.photo, f.source, f.note, f.visible, f.pinned]);
      await logAction(admin.id, 'wall_edit', f.name, { id });
      return ok({ message: 'Saved.' });
    }
    if (b.action === 'toggle') {
      await query('UPDATE wall_entries SET visible = NOT visible, updated_at = now() WHERE id = $1', [id]);
      return ok({ message: cur.visible ? 'Hidden from the wall.' : 'Shown on the wall.' });
    }
    if (b.action === 'approve_photo') {
      if (!cur.pending_photo) return bad('No photo waiting.');
      await deletePhoto(cur.photo);
      await query('UPDATE wall_entries SET photo = pending_photo, pending_photo = NULL, updated_at = now() WHERE id = $1', [id]);
      await logAction(admin.id, 'wall_photo_approve', cur.name, { id });
      return ok({ message: 'Photo approved.' });
    }
    if (b.action === 'reject_photo') {
      await deletePhoto(cur.pending_photo);
      await query('UPDATE wall_entries SET pending_photo = NULL, updated_at = now() WHERE id = $1', [id]);
      await logAction(admin.id, 'wall_photo_reject', cur.name, { id });
      return ok({ message: 'Photo rejected.' });
    }
    if (b.action === 'delete') {
      await deletePhoto(cur.photo); await deletePhoto(cur.pending_photo);
      await query('DELETE FROM wall_entries WHERE id = $1', [id]);
      if (cur.user_id) await query('UPDATE users SET is_supporter = false WHERE id = $1', [cur.user_id]);
      await logAction(admin.id, 'wall_delete', cur.name, { id });
      return ok({ message: `${cur.name} removed from the wall.` });
    }
    return bad('Unknown action.');
  } catch (e) {
    if (e.message && !e.code) return bad(e.message);
    console.error('admin wall:', e);
    return bad('Something went wrong.', 500);
  }
}
