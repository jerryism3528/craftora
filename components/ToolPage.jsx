import Link from 'next/link';
import * as Lucide from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { getCategory, getRelatedTools } from '../lib/tools';

function Icon({ name, className }) {
  const Cmp = Lucide[name] || Lucide.Wrench;
  return <Cmp className={className} />;
}

const SITE_URL = 'https://craftora.dev';

export default function ToolPage({ tool, howItWorks = [], features = [], faqs = [], children }) {
  const category = getCategory(tool.category);
  const related = getRelatedTools(tool.slug, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: `${tool.name} - Craftora`,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any (web browser)',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description: tool.description,
        url: `${SITE_URL}/${tool.slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: category.name, item: `${SITE_URL}/${category.slug}` },
          { '@type': 'ListItem', position: 3, name: tool.name, item: `${SITE_URL}/${tool.slug}` },
        ],
      },
      faqs.length && {
        '@type': 'FAQPage',
        mainEntity: faqs.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ].filter(Boolean),
  };

  return (
    <div>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="editorial-width max-w-6xl px-4 sm:px-7 py-12 sm:py-16">
        <nav aria-label="Breadcrumb" className="text-sm muted mb-9">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="px-2">/</span>
          <Link href={`/${category.slug}`} className="hover:underline">{category.name}</Link>
          <span className="px-2">/</span>
          <span>{tool.name}</span>
        </nav>

        <div className="max-w-3xl">
          <p className="brand-text text-xs font-extrabold tracking-[.16em] uppercase mb-3">{category.name}</p>
          <h1 className="font-extrabold tracking-tight text-4xl" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>{tool.name}</h1>
          <p className="muted mt-4 text-lg leading-8">{tool.description}</p>
        </div>

        <div className="mt-10">{children}</div>

        {howItWorks.length > 0 && (
          <section className="mt-16 section-rule pt-14">
            <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>How it works</h2>
            <div className="grid sm:grid-cols-3 gap-8 mt-8">
              {howItWorks.map((step, i) => (
                <div key={i}>
                  <span className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{ background: i === 0 ? '#3430a8' : i === 1 ? '#7652d4' : '#187c6f' }}>{i + 1}</span>
                  <h3 className="font-bold text-lg mt-4" style={{ color: 'var(--ink)' }}>{step[0]}</h3>
                  <p className="muted text-sm mt-2 leading-6">{step[1]}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {(features.length > 0 || faqs.length > 0) && (
          <section className="grid md:grid-cols-2 gap-10 mt-16 section-rule pt-14">
            {features.length > 0 && (
              <div>
                <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>{tool.name} features</h2>
                <ul className="mt-5 space-y-3 muted text-sm">
                  {features.map((f, i) => (
                    <li key={i} className="flex gap-2"><Lucide.Check className="mint-text w-4 h-4 mt-0.5 shrink-0" /><span>{f}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {faqs.length > 0 && (
              <div>
                <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>{tool.name} FAQ</h2>
                <div className="space-y-3 mt-5">
                  {faqs.map(([q, a], i) => (
                    <article key={i} className="border surface rounded-2xl p-5">
                      <h3 className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{q}</h3>
                      <p className="muted text-sm leading-6 mt-2">{a}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-16 section-rule pt-14">
            <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>Related {category.name}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {related.map((t) => {
                const inner = (
                  <>
                    <span className="tool-icon"><Icon name={t.icon} className="w-5 h-5" /></span>
                    <span className="flex items-center gap-2 mt-5">
                      <strong className="block text-sm" style={{ color: 'var(--ink)' }}>{t.name}</strong>
                      {t.status !== 'live' && <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md" style={{ background: 'var(--surface-soft)', color: 'var(--muted)' }}>Soon</span>}
                    </span>
                    <span className="block muted text-xs leading-5 mt-1.5">{t.description}</span>
                  </>
                );
                return t.status === 'live'
                  ? <Link key={t.slug} href={`/${t.slug}`} className={`tool-card category-${t.category}`}>{inner}</Link>
                  : <div key={t.slug} className={`tool-card category-${t.category}`} style={{ opacity: 0.85 }}>{inner}</div>;
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
