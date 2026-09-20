import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { posts, getPost } from '../../../lib/posts';
import { getTool } from '../../../lib/tools';

const SITE_URL = 'https://craftora.dev';

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const post = getPost(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/insights/${post.slug}` },
    openGraph: {
      title: `${post.title} | Craftora`,
      description: post.description,
      url: `${SITE_URL}/insights/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

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

export default function ArticlePage({ params }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const related = (post.related || []).map((slug) => getTool(slug)).filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: 'Craftora' },
    mainEntityOfPage: `${SITE_URL}/insights/${post.slug}`,
  };

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
          <span>{post.title}</span>
        </nav>

        <p className="muted text-sm mb-3">
          {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · {post.author}
        </p>
        <h1 className="font-extrabold tracking-tight text-4xl leading-tight" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          {post.title}
        </h1>

        <article className="mt-8">
          {post.body.map((block, i) => <Block key={i} block={block} />)}
        </article>

        {related.length > 0 && (
          <section className="mt-14 section-rule pt-10">
            <h2 className="font-extrabold text-xl mb-5" style={{ color: 'var(--ink)' }}>Free tools mentioned in this guide</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((t) => (
                <Link key={t.slug} href={`/${t.slug}`} className={`tool-card category-${t.category}`}>
                  <strong className="block text-sm" style={{ color: 'var(--ink)' }}>{t.name}</strong>
                  <span className="block muted text-xs leading-5 mt-1.5">{t.description}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12">
          <Link href="/insights" className="brand-text text-sm font-bold">← Back to all guides</Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
