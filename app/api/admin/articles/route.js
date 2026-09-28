import { auth } from '../../../../auth';
import { query, queryOne } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) return null;
  return session.user;
}

function slugify(text) {
  return String(text).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/[\s-]+/g, '-').replace(/^-+|-+$/g, '');
}

async function logAction(adminId, action, target) {
  await query('INSERT INTO admin_log (admin_id, action, target) VALUES ($1, $2, $3)', [adminId, action, target]);
}

// GET: list all articles (drafts + published).
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return forbid();
  const articles = await query('SELECT id, slug, title, excerpt, author, published, published_at, created_at, updated_at FROM articles ORDER BY updated_at DESC');
  return Response.json({ ok: true, articles });
}

// POST: create or update an article.
export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return forbid();

  try {
    const b = await req.json();
    const title = String(b.title || '').trim();
    if (!title) return bad('Title is required.');

    const bodyJson = JSON.stringify(typeof b.body === 'string' ? b.body : '');
    const metaTitle = (b.metaTitle || '').trim() || null;
    const metaDesc = (b.metaDescription || '').trim() || null;
    const imageAlt = (b.imageAlt || '').trim() || null;
    const focusKw = (b.focusKeyword || '').trim() || null;
    const excerpt = b.excerpt || '';
    const author = b.author || 'Craftora';
    const coverImage = b.coverImage || null;
    const published = !!b.published;
    // published_at: use provided date, else now on first publish.
    const publishedAt = b.publishedAt ? new Date(b.publishedAt) : null;

    if (b.id) {
      const existing = await queryOne('SELECT slug, published_at FROM articles WHERE id = $1', [b.id]);
      if (!existing) return bad('Article not found.');

      // Allow editing the slug (keyword-in-URL) if provided and unique.
      let slug = existing.slug;
      if (b.slug && slugify(b.slug) && slugify(b.slug) !== existing.slug) {
        let candidate = slugify(b.slug);
        const taken = await queryOne('SELECT id FROM articles WHERE slug = $1 AND id <> $2', [candidate, b.id]);
        if (taken) return bad('That URL slug is already used by another article.');
        slug = candidate;
      }

      // If publishing now and no date set yet, stamp it.
      let finalPublishedAt = publishedAt || existing.published_at;
      if (published && !finalPublishedAt) finalPublishedAt = new Date();

      await query(
        `UPDATE articles SET slug=$1, title=$2, excerpt=$3, body=$4, author=$5, cover_image=$6, published=$7,
         meta_title=$8, meta_description=$9, image_alt=$10, focus_keyword=$11, published_at=$12, updated_at=now()
         WHERE id=$13`,
        [slug, title, excerpt, bodyJson, author, coverImage, published, metaTitle, metaDesc, imageAlt, focusKw, finalPublishedAt, b.id]
      );
      await logAction(admin.id, 'update_article', slug);
      return Response.json({ ok: true, message: 'Article saved.', slug });
    } else {
      // New article: slug from provided slug or title.
      let baseSlug = slugify(b.slug || title) || 'post';
      let slug = baseSlug;
      let n = 2;
      while (await queryOne('SELECT id FROM articles WHERE slug = $1', [slug])) {
        slug = `${baseSlug}-${n++}`;
      }
      const finalPublishedAt = published ? (publishedAt || new Date()) : publishedAt;
      const created = await queryOne(
        `INSERT INTO articles (slug, title, excerpt, body, author, cover_image, published, meta_title, meta_description, image_alt, focus_keyword, published_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id, slug`,
        [slug, title, excerpt, bodyJson, author, coverImage, published, metaTitle, metaDesc, imageAlt, focusKw, finalPublishedAt]
      );
      await logAction(admin.id, 'create_article', created.slug);
      return Response.json({ ok: true, message: 'Article created.', id: created.id, slug: created.slug });
    }
  } catch (e) {
    console.error('admin articles error:', e);
    return Response.json({ ok: false, error: 'Something went wrong.' }, { status: 500 });
  }
}

// DELETE: remove an article.
export async function DELETE(req) {
  const admin = await requireAdmin();
  if (!admin) return forbid();
  try {
    const { id } = await req.json();
    if (!id) return bad('Missing article id.');
    const existing = await queryOne('SELECT slug FROM articles WHERE id = $1', [id]);
    if (!existing) return bad('Article not found.');
    await query('DELETE FROM articles WHERE id = $1', [id]);
    await logAction(admin.id, 'delete_article', existing.slug);
    return Response.json({ ok: true, message: 'Article deleted.' });
  } catch (e) {
    console.error('delete article error:', e);
    return Response.json({ ok: false, error: 'Something went wrong.' }, { status: 500 });
  }
}

function bad(msg) { return Response.json({ ok: false, error: msg }, { status: 400 }); }
function forbid() { return Response.json({ ok: false, error: 'Forbidden.' }, { status: 403 }); }
