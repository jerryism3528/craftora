import { auth } from '../../../../auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const ALLOWED = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
const MAX_BYTES = 3 * 1024 * 1024; // 3 MB

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) {
    return Response.json({ ok: false, error: 'Forbidden.' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') return bad('No file uploaded.');

    const ext = ALLOWED[file.type];
    if (!ext) return bad('Only JPG, PNG, WebP, and GIF images are allowed.');
    if (file.size > MAX_BYTES) return bad('Image must be under 3 MB.');

    const bytes = Buffer.from(await file.arrayBuffer());
    const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const dir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), bytes);

    return Response.json({ ok: true, url: `/uploads/${name}` });
  } catch (e) {
    console.error('upload error:', e);
    return Response.json({ ok: false, error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}

function bad(msg) { return Response.json({ ok: false, error: msg }, { status: 400 }); }
