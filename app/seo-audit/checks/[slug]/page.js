import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Wrench, Search, Globe, ChevronRight, Lightbulb } from 'lucide-react';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import { CATEGORIES, CHECKS } from '../../../../lib/seo-checks';
import { GUIDES, guideBySlug } from '../../../../lib/seo-guides';
import { getTool } from '../../../../lib/tools';

const SITE = 'https://craftora.dev';
const SEV = {
  critical: { label: 'Critical issue', cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' },
  warning: { label: 'Warning', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  notice: { label: 'Notice', cls: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800' },
};

export function generateStaticParams() {
  return Object.values(GUIDES).map((g) => ({ slug: g.slug }));
}

function metaDescription(g) {
  const first = g.what.split(/(?<=\.)\s/)[0];
  const d = `${first} Learn why it matters and how to fix it step by step.`;
  if (d.length <= 160) return d;
  return first.length <= 160 ? first : first.slice(0, 157) + '...';
}

export function generateMetadata({ params }) {
  const g = guideBySlug(params.slug);
  if (!g) return {};
  return {
    title: `${g.name}: How to Fix It`,
    description: metaDescription(g),
    alternates: { canonical: `/seo-audit/checks/${g.slug}` },
    openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }],  title: `${g.name}: How to Fix It | Craftora`, description: metaDescription(g), url: `${SITE}/seo-audit/checks/${g.slug}`, type: 'article' },
  };
}

export default function GuidePage({ params }) {
  const g = guideBySlug(params.slug);
  if (!g) notFound();
  const check = CHECKS[g.id];
  const sev = SEV[check.severity];
  const tools = (check.tools || []).map((s) => getTool(s)).filter((t) => t && t.status === 'live');
  const related = Object.entries(CHECKS).filter(([id, c]) => c.category === check.category && id !== g.id).slice(0, 6).map(([id]) => ({ id, ...GUIDES[id] }));
  const url = `${SITE}/seo-audit/checks/${g.slug}`;

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'SEO Audit', item: `${SITE}/seo-audit` },
        { '@type': 'ListItem', position: 3, name: 'SEO Checklist', item: `${SITE}/seo-audit/checks` },
        { '@type': 'ListItem', position: 4, name: g.name, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `How to fix: ${g.name}`,
      description: g.what,
      step: g.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: g.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ];

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <nav className="flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-600">Home</Link><ChevronRight className="w-3.5 h-3.5" />
          <Link href="/seo-audit" className="hover:text-indigo-600">SEO Audit</Link><ChevronRight className="w-3.5 h-3.5" />
          <Link href="/seo-audit/checks" className="hover:text-indigo-600">SEO Checklist</Link><ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 dark:text-slate-200">{g.name}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_300px] gap-10">
          <article className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${sev.cls}`}>{sev.label}</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">{CATEGORIES[check.category]}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-3">{g.name}: How to Fix It</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mt-4">{g.what}</p>

            <div className="mt-6 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-4 flex gap-3">
              <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-indigo-900 dark:text-indigo-100"><span className="font-semibold">Quick fix: </span>{check.fix}</p>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10">Why it matters for SEO</h2>
            <p className="text-slate-700 dark:text-slate-300 mt-3 leading-relaxed">{g.why}</p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10">How to fix it</h2>
            <ol className="mt-4 space-y-3">
              {g.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-slate-700 dark:text-slate-300 pt-0.5">{s}</span>
                </li>
              ))}
            </ol>

            {g.example && (
              <>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10">Example</h2>
                <pre className="mt-3 rounded-xl bg-slate-900 text-slate-100 text-sm p-4 overflow-x-auto whitespace-pre-wrap"><code>{g.example}</code></pre>
              </>
            )}

            {tools.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10">Free tools to fix it</h2>
                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  {tools.map((t) => (
                    <Link key={t.slug} href={`/${t.slug}`} className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:border-indigo-400 dark:hover:border-indigo-500">
                      <Wrench className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <div><div className="font-semibold text-slate-900 dark:text-white">{t.name}</div><div className="text-sm text-slate-600 dark:text-slate-300">{t.description}</div></div>
                    </Link>
                  ))}
                </div>
              </>
            )}

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10">Frequently asked questions</h2>
            <div className="mt-4 space-y-3">
              {g.faqs.map(([q, a]) => (
                <details key={q} className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4" open>
                  <summary className="font-semibold text-slate-900 dark:text-white cursor-pointer">{q}</summary>
                  <p className="text-slate-700 dark:text-slate-300 mt-2">{a}</p>
                </details>
              ))}
            </div>

            <div className="mt-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white">
              <div className="text-xl font-bold">Does your website have this issue?</div>
              <p className="text-indigo-100 mt-1">Run a free SEO audit to check this and 40+ other issues in seconds.</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <Link href="/seo-audit" className="px-4 py-2 rounded-lg bg-white text-indigo-700 font-semibold hover:bg-indigo-50">Audit a page</Link>
                <Link href="/account/seo" className="px-4 py-2 rounded-lg border border-white/50 font-semibold hover:bg-white/10">Audit my whole site</Link>
              </div>
            </div>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-24 self-start">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><Search className="w-4 h-4 text-indigo-500" /> Free SEO Audit</div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Check any page for this issue and get an SEO score out of 100.</p>
              <Link href="/seo-audit" className="block text-center mt-3 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">Run audit</Link>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <div className="font-semibold text-slate-900 dark:text-white">Related {CATEGORIES[check.category].toLowerCase()} checks</div>
              <ul className="mt-2 space-y-1.5">
                {related.map((r) => (
                  <li key={r.id}><Link href={`/seo-audit/checks/${r.slug}`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">{r.name}</Link></li>
                ))}
              </ul>
              <Link href="/seo-audit/checks" className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600"><Globe className="w-4 h-4" /> Full SEO checklist</Link>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
