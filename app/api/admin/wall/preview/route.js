import fs from 'fs/promises';
import path from 'path';
import { queryOne } from '../../../../../lib/db';
import { requireAdmin, forbid } from '../../../../../lib/admin';
import { WALL_DIR } from '../../../../../lib/wall';

export const dynamic = 'force-dynamic';

const TYPES = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

// Admin-only preview of a photo waiting for approval.
export async function GET(req) {
  if (!(await requireAdmin())) return forbid();
  const id = Number(new URL(req.url).searchParams.get('id'));
  const e = Number.isFinite(id) ? await queryOne('SELECT pending_photo FROM wall_entries WHERE id = $1', [id]) : null;
  const m = /^[a-f0-9]{24}\.(jpg|png|webp)$/.exec(e?.pending_photo || '');
  if (!m) return new Response('Not found', { status: 404 });
  try {
    const buf = await fs.readFile(path.join(WALL_DIR, e.pending_photo));
    return new Response(buf, { headers: { 'Content-Type': TYPES[m[1]], 'Cache-Control': 'private, no-store' } });
  } catch { return new Response('Not found', { status: 404 }); }
}
