import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const TYPES = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif',
};

export async function GET(req, { params }) {
  const file = params.file || '';
  // Security: only allow a plain filename, no path traversal.
  if (!/^[a-zA-Z0-9._-]+$/.test(file) || file.includes('..')) {
    return new Response('Not found', { status: 404 });
  }
  const ext = path.extname(file).toLowerCase();
  const contentType = TYPES[ext];
  if (!contentType) return new Response('Not found', { status: 404 });

  try {
    const filePath = path.join(process.cwd(), 'public', 'uploads', file);
    const data = await readFile(filePath);
    return new Response(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e) {
    return new Response('Not found', { status: 404 });
  }
}
