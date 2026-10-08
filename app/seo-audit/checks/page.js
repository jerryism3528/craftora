import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { CATEGORIES, CHECKS } from '../../../lib/seo-checks';
import { GUIDES } from '../../../lib/seo-guides';

const COUNT = Object.keys(CHECKS).length;
const SITE = 'https://craftora.dev';

export const metadata = {
  title: `SEO Audit Checklist: ${COUNT} Checks and How to Fix Them`,
  description: `The complete SEO checklist used by the Craftora SEO audit tool. ${COUNT} checks for meta tags, content, technical SEO, links, and site structure, each with a step-by-step fix guide.`,
  alternates: { canonical: '/seo-audit/checks' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: `SEO Audit Checklist: ${COUNT} Checks and How to Fix Them | Craftora`,
    description: 'Every SEO issue explained, with why it matters and exactly how to fix it.',
    url: `${SITE}/seo-audit/checks`,
    type: 'article',
  },
};

const SEV = {
  critical: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  notice: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
};
const ORDER = ['meta', 'content', 'technical', 'links', 'site', 'keyword'];

export default function ChecklistPage() {
  const groups = ORDER.filter((c) => CATEGORIES[c]).map((cat) => ({
    cat,
    items: Object.entries(CHECKS).filter(([, c]) => c.category === cat).map(([id, c]) => ({ id, ...c, guide: GUIDES[id] })),
  }));
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'SEO Audit', item: `${SITE}/seo-audit` },
        { '@type': 'ListItem', position: 3, name: 'SEO Checklist', item: `${SITE}/seo-audit/checks` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'SEO Audit Checklist',
      numberOfItems: COUNT,
      itemListElement: Object.entries(GUIDES).map(([, g], i) => ({ '@type': 'ListItem', position: i + 1, name: g.name, url: `${SITE}/seo-audit/checks/${g.slug}` })),
    },
  ];

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <nav className="text-sm text-slate-500 dark:text-slate-400 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-600">Home</Link> <span className="mx-1">/</span>
          <Link href="/seo-audit" className="hover:text-indigo-600">SEO Audit</Link> <span className="mx-1">/</span>
          <span className="text-slate-700 dark:text-slate-200">SEO Checklist</span>
        </nav>
        <p className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">SEO Guides</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">SEO Audit Checklist: {COUNT} Checks and How to Fix Them</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mt-3 max-w-3xl">
          These are the exact checks the Craftora SEO audit runs on your pages. Each one has a guide that explains what the issue is, why it matters for rankings, and how to fix it step by step.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link href="/seo-audit" className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Audit a page for free</Link>
          <Link href="/account/seo" className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800">Audit your whole website</Link>
        </div>

        <div className="mt-10 space-y-10">
          {groups.map((g) => (
            <section key={g.cat}>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{CATEGORIES[g.cat]} <span className="text-slate-400 font-normal text-base">({g.items.length})</span></h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {g.items.map((c) => (
                  <Link key={c.id} href={`/seo-audit/checks/${c.guide.slug}`} className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:border-indigo-400 dark:hover:border-indigo-500 transition">
                    <span className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${SEV[c.severity]}`}>{c.severity}</span>
                    <div className="font-semibold text-slate-900 dark:text-white mt-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{c.guide.name}</div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{c.fix}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
