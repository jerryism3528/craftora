import fs from 'fs/promises';
import path from 'path';
import { queryOne } from '../../../../lib/db';
import { IMG_DIR, MIME } from '../../../../lib/images';

export const dynamic = 'force-dynamic';

function notFound() {
  return new Response('Image not found', { status: 404 });
}

export async function GET(req, { params }) {
  const file = params.file;
  if (!/^[A-Za-z0-9]{4,40}\.(jpg|png|webp|gif)$/.test(file)) return notFound();
  const code = file.split('.')[0];
  const row = await queryOne('SELECT file FROM images WHERE code = $1 AND NOT removed AND expires_at > now()', [code]);
  if (!row || row.file !== file) return notFound();
  try {
    const data = await fs.readFile(path.join(IMG_DIR, file));
    return new Response(data, {
      headers: {
        'Content-Type': MIME[file.split('.').pop()],
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (e) {
    return notFound();
  }
}
