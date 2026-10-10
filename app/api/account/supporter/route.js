import { auth } from '../../../../auth';
import { query, queryOne } from '../../../../lib/db';
import { cleanName } from '../../../../lib/supporters';
import { savePhoto, deletePhoto, photoUrl, linkWallEntry } from '../../../../lib/wall';

export const dynamic = 'force-dynamic';

async function entry() {
  const s = await auth();
  if (!s?.user?.id) return { user: null, entry: null };
  const u = await queryOne('SELECT id, email FROM users WHERE id = $1', [s.user.id]);
  if (!u) return { user: null, entry: null };
  let e = await queryOne('SELECT * FROM wall_entries WHERE user_id = $1', [u.id]);
  if (!e) { await linkWallEntry(u.id, u.email); e = await queryOne('SELECT * FROM wall_entries WHERE user_id = $1', [u.id]); }
  return { user: u, entry: e };
}

function view(e) {
  return { signedIn: true, isSupporter: true, name: e.name, show: e.visible, photo: photoUrl(e.photo), pendingPhoto: !!e.pending_photo };
}

// GET: the signed-in backer's wall listing.
export async function GET() {
  const { user, entry: e } = await entry();
  if (!user) return Response.json({ signedIn: false });
  if (!e) return Response.json({ signedIn: true, isSupporter: false });
  return Response.json(view(e));
}

// POST: JSON { name, show, removePhoto } or multipart with a "photo" file (waits for admin approval).
export async function POST(req) {
  const { user, entry: e } = await entry();
  if (!user) return Response.json({ error: 'Please sign in.' }, { status: 401 });
  if (!e) return Response.json({ error: 'Only supporters are listed on the wall.' }, { status: 403 });

  if ((req.headers.get('content-type') || '').includes('multipart/form-data')) {
    try {
      const form = await req.formData();
      const file = form.get('photo');
      if (!file || typeof file === 'string') return Response.json({ error: 'No photo uploaded.' }, { status: 400 });
      const name = await savePhoto(Buffer.from(await file.arrayBuffer()));
      await deletePhoto(e.pending_photo);
      await query('UPDATE wall_entries SET pending_photo = $2, updated_at = now() WHERE id = $1', [e.id, name]);
      await query("INSERT INTO admin_notifications (type, title, body, target_type, target_id) VALUES ('wall_photo', 'New supporter photo to review', $1, 'wall', $2)", [`${e.name} uploaded a photo for the supporters wall.`, e.id]).catch(() => {});
      return Response.json({ ok: true, ...view({ ...e, pending_photo: name }) });
    } catch (err) {
      return Response.json({ error: err.message || 'Upload failed.' }, { status: 400 });
    }
  }

  let b = {};
  try { b = await req.json(); } catch {}
  if (b.removePhoto) {
    await deletePhoto(e.photo); await deletePhoto(e.pending_photo);
    await query('UPDATE wall_entries SET photo = NULL, pending_photo = NULL, updated_at = now() WHERE id = $1', [e.id]);
    return Response.json({ ok: true, ...view({ ...e, photo: null, pending_photo: null }) });
  }
  const name = cleanName(b.name);
  if (name.length < 2) return Response.json({ error: 'Use at least 2 characters.' }, { status: 400 });
  const show = b.show !== false;
  await query('UPDATE wall_entries SET name = $2, visible = $3, updated_at = now() WHERE id = $1', [e.id, name, show]);
  return Response.json({ ok: true, ...view({ ...e, name, visible: show }) });
}
