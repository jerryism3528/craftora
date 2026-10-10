import fs from 'fs/promises';
import path from 'path';
import { WALL_DIR } from '../../../../lib/wall';

export const dynamic = 'force-dynamic';

const TYPES = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

// Public photos on the supporters wall. Only approved file names are linked from the page.
export async function GET(_req, { params }) {
  const m = /^([a-f0-9]{24})\.(jpg|png|webp)$/.exec(params.name || '');
  if (!m) return new Response('Not found', { status: 404 });
  try {
    const buf = await fs.readFile(path.join(WALL_DIR, params.name));
    return new Response(buf, { headers: { 'Content-Type': TYPES[m[2]], 'Cache-Control': 'public, max-age=86400, immutable', 'X-Content-Type-Options': 'nosniff' } });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
