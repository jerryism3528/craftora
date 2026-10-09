import fs from 'fs/promises';
import path from 'path';
import { queryOne } from '../../../../../lib/db';
import { requireAdmin, forbid, IMAGES_DIR } from '../../../../../lib/admin';

export const dynamic = 'force-dynamic';

// Admin-only preview of an uploaded image, including removed ones.
export async function GET(req) {
  if (!(await requireAdmin())) return forbid();
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!Number.isFinite(id)) return new Response('Bad id', { status: 400 });
  const img = await queryOne('SELECT file, mime FROM images WHERE id = $1', [id]);
  if (!img) return new Response('Not found', { status: 404 });
  const rel = String(img.file).replace(/^\/+/, '');
  const full = path.resolve(IMAGES_DIR, rel);
  if (!full.startsWith(path.resolve(IMAGES_DIR) + path.sep)) return new Response('Bad path', { status: 400 });
  try {
    const buf = await fs.readFile(full);
    return new Response(buf, { headers: { 'Content-Type': /^image\/(png|jpeg|webp|gif)$/.test(img.mime) ? img.mime : 'application/octet-stream', 'Cache-Control': 'private, max-age=300', 'X-Content-Type-Options': 'nosniff' } });
  } catch {
    return new Response('File missing', { status: 404 });
  }
}
