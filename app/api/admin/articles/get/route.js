import { auth } from '../../../../../auth';
import { queryOne } from '../../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) {
    return Response.json({ ok: false, error: 'Forbidden.' }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ ok: false, error: 'Missing id.' }, { status: 400 });

  const article = await queryOne('SELECT id, slug, title, excerpt, body, author, cover_image, published, meta_title, meta_description, image_alt, focus_keyword, published_at FROM articles WHERE id = $1', [id]);
  if (!article) return Response.json({ ok: false, error: 'Not found.' }, { status: 404 });

  return Response.json({ ok: true, article });
}
