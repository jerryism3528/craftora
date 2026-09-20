import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getAllPosts } from '../../lib/posts';

const SITE_URL = 'https://craftora.dev';

export const metadata = {
  title: 'Insights: Free Online Tools Guides and Tips',
  description:
    'Craftora Insights: practical guides and tips on PDFs, images, file conversion, SEO, and more. Learn how to get everyday tasks done free, fast, and privately.',
  alternates: { canonical: '/insights' },
  openGraph: {
    title: 'Craftora Insights: Guides and Tips',
    description: 'Practical guides on PDFs, images, file conversion, SEO, and more. Free, fast, and private.',
    url: `${SITE_URL}/insights`,
    type: 'website',
  },
};

export default function InsightsPage() {
  const posts = getAllPosts();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Craftora Insights',
    url: `${SITE_URL}/insights`,
    description: 'Guides and tips on free online tools for PDFs, images, file conversion, and SEO.',
  };

  return (
    <div>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="editorial-width max-w-5xl px-4 sm:px-7 py-12 sm:py-16">
        <nav aria-label="Breadcrumb" className="text-sm muted mb-9">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="px-2">/</span>
          <span>Insights</span>
        </nav>

        <p className="brand-text text-xs font-extrabold tracking-[.16em] uppercase mb-3">Craftora Insights</p>
        <h1 className="font-extrabold tracking-tight text-4xl" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>
          Guides and tips for everyday tools
        </h1>
        <p className="muted mt-4 text-lg leading-8 max-w-3xl">
          Practical, no-nonsense guides on PDFs, images, file conversion, SEO, and more. Learn how to get everyday tasks done free, fast, and privately.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mt-12">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/insights/${post.slug}`}
              className="border surface rounded-2xl p-6 block transition-colors"
              style={{ background: 'var(--surface)' }}
            >
              <p className="muted text-xs mb-3">
                {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · {post.author}
              </p>
              <h2 className="font-bold text-xl leading-tight" style={{ color: 'var(--ink)' }}>{post.title}</h2>
              <p className="muted text-sm leading-6 mt-3">{post.excerpt}</p>
              <span className="brand-text text-sm font-bold inline-block mt-4">Read guide →</span>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="muted mt-10">New guides are coming soon.</p>
        )}
      </main>

      <Footer />
    </div>
  );
}

