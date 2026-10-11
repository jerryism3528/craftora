import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import AllToolsDirectory from '../../components/AllToolsDirectory';
import { categories, tools } from '../../lib/tools';

const SITE = 'https://craftora.dev';
const LIVE = tools.filter((t) => t.status === 'live');
const COUNT = LIVE.length;

export const metadata = {
  title: `All ${COUNT}+ Free Online Tools: PDF, Image and SEO`,
  description: `Browse all ${COUNT}+ free Craftora tools in one place: merge and compress PDFs, convert and resize images, run SEO audits, format code, and more. No signup, no watermarks.`,
  alternates: { canonical: '/all-tools' },
  openGraph: {
    title: `All ${COUNT}+ Free Online Tools | Craftora`,
    description: 'Every free Craftora tool for PDFs, images, file conversion, SEO, text, and developers, in one searchable directory.',
    url: `${SITE}/all-tools`,
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }],
  },
};

export default function AllToolsPage() {
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${SITE}/all-tools#page`,
      url: `${SITE}/all-tools`,
      name: 'All Free Online Tools',
      description: metadata.description,
      isPartOf: { '@type': 'WebSite', name: 'Craftora', url: SITE },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: COUNT,
        itemListElement: LIVE.map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: t.name,
          url: `${SITE}/${t.slug}`,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'All Tools', item: `${SITE}/all-tools` },
      ],
    },
  ];

  return (
    <div>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="editorial-width px-4 sm:px-7 py-12 sm:py-16">
        <nav aria-label="Breadcrumb" className="text-sm muted mb-9">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="px-2">/</span>
          <span>All Tools</span>
        </nav>

        <p className="brand-text text-xs font-extrabold tracking-[.16em] uppercase mb-3">Complete directory</p>
        <h1 className="font-extrabold tracking-tight text-4xl" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>All Free Online Tools</h1>
        <p className="muted mt-4 text-lg max-w-3xl">
          Browse all {COUNT}+ free Craftora tools for PDFs, images, file conversion, SEO, text, developers, and more.
          Most tools run right in your browser, so your files stay private. No signup, no watermarks.
        </p>

        <nav aria-label="Tool categories" className="flex flex-wrap gap-x-4 gap-y-2 mt-6 text-sm">
          {categories.filter((c) => c.slug).map((c) => (
            <Link key={c.key} href={`/${c.slug}`} className="brand-text font-semibold hover:underline">{c.name}</Link>
          ))}
        </nav>

        <AllToolsDirectory />
      </main>
      <Footer />
    </div>
  );
}
