import { requireAdmin, ok, bad, forbid } from '../../../../../lib/admin';
import { savePhoto, photoUrl } from '../../../../../lib/wall';

export const dynamic = 'force-dynamic';

// Upload a photo or logo for a wall entry. Returns the stored name to save with the entry.
export async function POST(req) {
  if (!(await requireAdmin())) return forbid();
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') return bad('No file uploaded.');
    const name = await savePhoto(Buffer.from(await file.arrayBuffer()));
    return ok({ photo: name, url: photoUrl(name) });
  } catch (e) {
    return bad(e.message || 'Upload failed.');
  }
}
