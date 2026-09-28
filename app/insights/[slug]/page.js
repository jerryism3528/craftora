import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { getPost } from '../../../lib/posts';
import { getTool } from '../../../lib/tools';
import { queryOne } from '../../../lib/db';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://craftora.dev';

// Load an article from the database, or fall back to the code-based posts.
async function loadArticle(slug) {
  try {
    const row = await queryOne(
      'SELECT slug, title, excerpt, body, author, cover_image, image_alt, meta_title, meta_description, published, published_at, updated_at FROM articles WHERE slug = $1',
      [slug]
    );
    if (row && row.published) {
      return {
        source: 'db',
        slug: row.slug,
        title: row.title,
        metaTitle: row.meta_title || row.title,
        description: row.meta_description || row.excerpt || '',
        html: typeof row.body === 'string' ? row.body : '',
        author: row.author || 'Craftora',
        coverImage: row.cover_image || null,
        imageAlt: row.image_alt || '',
        date: row.published_at || row.updated_at,
        modified: row.updated_at,
      };
    }
  } catch (e) {
    console.error('article db load error:', e);
  }
  // Fallback: legacy code post.
  const post = getPost(slug);
  if (post) return { source: 'code', ...post };
  return null;
}

export async function generateMetadata({ params }) {
  const a = await loadArticle(params.slug);
  if (!a) return {};
  const title = a.metaTitle || a.title;
  const description = a.description || '';
  return {
    title,
    description,
    alternates: { canonical: `/insights/${a.slug}` },
    openGraph: {
      title: `${title} | Craftora`,
      description,
      url: `${SITE_URL}/insights/${a.slug}`,
      type: 'article',
      publishedTime: a.date ? new Date(a.date).toISOString() : undefined,
      modifiedTime: a.modified ? new Date(a.modified).toISOString() : undefined,
      authors: [a.author],
      images: a.coverImage ? [{ url: `${SITE_URL}${a.coverImage}` }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: a.coverImage ? [`${SITE_URL}${a.coverImage}`] : undefined,
    },
  };
}

// Legacy block renderer (for the 3 old code posts only).
function Block({ block }) {
  if (block.h2) return <h2 className="font-extrabold text-2xl mt-10 mb-4" style={{ color: 'var(--ink)' }}>{block.h2}</h2>;
  if (block.p) return <p className="muted leading-8 mb-5">{block.p}</p>;
  if (block.ul) return (
    <ul className="space-y-2 mb-5 muted leading-7">
      {block.ul.map((item, i) => <li key={i} className="flex gap-2"><span className="brand-text">•</span><span>{item}</span></li>)}
    </ul>
  );
  if (block.tool) {
    const t = getTool(block.tool);
    if (!t) return null;
    return (
      <Link href={`/${t.slug}`} className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-sm my-4" style={{ background: 'var(--brand)', color: '#fff' }}>
        {block.label || t.name} →
      </Link>
    );
  }
  return null;
}

export default async function ArticlePage({ params }) {
  const a = await loadArticle(params.slug);
  if (!a) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    datePublished: a.date ? new Date(a.date).toISOString() : undefined,
    dateModified: a.modified ? new Date(a.modified).toISOString() : (a.date ? new Date(a.date).toISOString() : undefined),
    author: { '@type': 'Person', name: a.author },
    publisher: { '@type': 'Organization', name: 'Craftora', url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/insights/${a.slug}`,
    ...(a.coverImage ? { image: `${SITE_URL}${a.coverImage}` } : {}),
  };

  const dateStr = a.date
    ? new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <div>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="editorial-width max-w-3xl px-4 sm:px-7 py-12 sm:py-16">
        <nav aria-label="Breadcrumb" className="text-sm muted mb-9">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="px-2">/</span>
          <Link href="/insights" className="hover:underline">Insights</Link>
          <span className="px-2">/</span>
          <span>{a.title}</span>
        </nav>

        <p className="muted text-sm mb-3">{dateStr}{dateStr && ' · '}{a.author}</p>
        <h1 className="font-extrabold tracking-tight text-4xl leading-tight" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          {a.title}
        </h1>

        {a.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.coverImage} alt={a.imageAlt || a.title} className="w-full rounded-2xl mt-8 border surface" />
        )}

        {a.source === 'db' ? (
          <article className="article-body mt-8" dangerouslySetInnerHTML={{ __html: a.html }} />
        ) : (
          <article className="mt-8">
            {a.body.map((block, i) => <Block key={i} block={block} />)}
          </article>
        )}

        <div className="mt-12">
          <Link href="/insights" className="brand-text text-sm font-bold">← Back to all guides</Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
