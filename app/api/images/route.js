import fs from 'fs/promises';
import path from 'path';
import { auth } from '../../../auth';
import { checkToolAccess, recordUsage } from '../../../lib/limits';
import { query, queryOne } from '../../../lib/db';
import { IMG_DIR, MAX_BYTES, MAX_ACTIVE, newImageCode, processImage, imageUrls } from '../../../lib/images';

export const dynamic = 'force-dynamic';
const TOOL = 'image-to-url';

function err(message, status) {
  return Response.json({ ok: false, error: message }, { status });
}

async function userId() {
  const session = await auth();
  return session?.user?.id ? String(session.user.id) : null;
}

export async function POST(req) {
  const uid = await userId();
  if (!uid) return err('Please sign in to upload images.', 401);
  const access = await checkToolAccess(uid, TOOL);
  if (!access.allowed) return err(access.reason, 429);
  const isAdmin = access.remaining >= 999999;

  let form;
  try { form = await req.formData(); } catch (e) { return err('Invalid upload.', 400); }
  const files = form.getAll('files').filter((f) => f && typeof f !== 'string');
  if (!files.length) return err('Choose at least one image.', 400);

  const active = await queryOne('SELECT count(*)::int AS n FROM images WHERE user_id = $1 AND NOT removed AND expires_at > now()', [uid]);
  const slots = isAdmin ? files.length : MAX_ACTIVE - active.n;
  if (slots <= 0) return err(`You already have ${MAX_ACTIVE} images. Delete one to upload more.`, 429);

  const images = [];
  const errors = [];
  for (const f of files.slice(0, slots)) {
    if (f.size > MAX_BYTES) { errors.push(`${f.name}: larger than 6 MB`); continue; }
    const p = await processImage(Buffer.from(await f.arrayBuffer()));
    if (p.error) { errors.push(`${f.name}: ${p.error}`); continue; }

    let row = null;
    for (let i = 0; i < 5 && !row; i++) {
      const code = newImageCode();
      const file = `${code}.${p.ext}`;
      try {
        row = await queryOne(
          `INSERT INTO images (code, user_id, file, original_name, mime, width, height, size_bytes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, code, file, original_name, width, height, size_bytes, views, created_at, expires_at`,
          [code, uid, file, String(f.name || 'image').slice(0, 120), `image/${p.ext === 'jpg' ? 'jpeg' : p.ext}`, p.width, p.height, p.data.length]
        );
      } catch (e) {
        if (e.code !== '23505') { errors.push(`${f.name}: could not save`); break; }
      }
    }
    if (!row) continue;
    try {
      await fs.writeFile(path.join(IMG_DIR, row.file), p.data);
      images.push({ ...row, ...imageUrls(row) });
    } catch (e) {
      await query('DELETE FROM images WHERE id = $1', [row.id]);
      errors.push(`${f.name}: could not save`);
    }
  }

  if (images.length) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    await recordUsage(uid, ip, TOOL, images.length);
  }
  const skipped = files.length - Math.min(files.length, slots);
  if (skipped > 0) errors.push(`${skipped} image(s) skipped: the limit is ${MAX_ACTIVE} images per account.`);
  return Response.json({ ok: images.length > 0, images, errors, error: images.length ? undefined : (errors[0] || 'Upload failed.') }, { status: images.length ? 200 : 422 });
}

export async function GET() {
  const uid = await userId();
  if (!uid) return err('Please sign in.', 401);
  const rows = await query(
    `SELECT id, code, file, original_name, width, height, size_bytes, views, created_at, expires_at,
            GREATEST(0, ceil(extract(epoch FROM (expires_at - now())) / 86400))::int AS days_left
     FROM images WHERE user_id = $1 AND NOT removed AND expires_at > now() ORDER BY created_at DESC`,
    [uid]
  );
  return Response.json({ ok: true, max: MAX_ACTIVE, images: rows.map((r) => ({ ...r, ...imageUrls(r) })) });
}

export async function DELETE(req) {
  const uid = await userId();
  if (!uid) return err('Please sign in.', 401);
  const id = parseInt(req.nextUrl.searchParams.get('id'), 10);
  const row = await queryOne('UPDATE images SET removed = true WHERE id = $1 AND user_id = $2 AND NOT removed RETURNING file', [id, uid]);
  if (!row) return err('Image not found.', 404);
  await fs.unlink(path.join(IMG_DIR, row.file)).catch(() => {});
  return Response.json({ ok: true });
}
