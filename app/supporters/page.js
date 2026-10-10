import Link from 'next/link';
import { Heart, Crown, Sparkles, ExternalLink, Gift } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SupporterSelf from '../../components/SupporterSelf';
import { getWall, GROUPS } from '../../lib/supporters';
import { SITE, COMPANY } from '../../lib/company';

export const dynamic = 'force-dynamic';

const MIN_INDEX = 10; // keep the page out of Google until it has real content

export async function generateMetadata() {
  const { total } = await getWall();
  return {
    title: 'Founding Supporters: The People Who Keep Craftora Free',
    description: total
      ? `Meet the ${total} founding supporters and sponsors who back Craftora, the free, privacy-first online tools suite. Thank you for keeping our tools free for everyone.`
      : 'Craftora is free for everyone thanks to its supporters. Become one of the first founding supporters.',
    alternates: { canonical: '/supporters' },
    robots: total >= MIN_INDEX ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }],
      title: 'Craftora Founding Supporters',
      description: 'The people and companies who keep Craftora free.',
      url: `${SITE}/supporters`,
      type: 'website',
    },
  };
}

const STYLE = {
  business: { icon: Crown, chip: 'border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-100', iconCls: 'text-teal-600 dark:text-teal-400', size: 'text-base px-4 py-3' },
  pro: { icon: Sparkles, chip: 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100', iconCls: 'text-indigo-600 dark:text-indigo-400', size: 'text-sm px-3.5 py-2.5' },
  supporters: { icon: Heart, chip: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100', iconCls: 'text-pink-500', size: 'text-sm px-3 py-2' },
};

function JoinCta({ compact = false }) {
  return (
    <div className={`rounded-2xl text-white ${compact ? 'p-6' : 'p-8 sm:p-10'}`} style={{ background: 'linear-gradient(135deg, #3430a8 0%, #4f46e5 55%, #0d9488 100%)' }}>
      <div className="flex items-center gap-2 text-indigo-100 text-xs font-bold uppercase tracking-widest"><Gift className="w-4 h-4" /> Become a founding supporter</div>
      <h2 className={`${compact ? 'text-xl' : 'text-2xl sm:text-3xl'} font-extrabold mt-2`}>Help keep Craftora free for everyone</h2>
      <p className="text-indigo-100 mt-2 max-w-2xl">Every supporter helps pay for servers and new tools, so Craftora stays free, fast, and private for everyone.</p>
      <div className="flex flex-wrap gap-3 mt-5">
        <Link href="/support" className="inline-flex items-center gap-2 rounded-xl bg-white text-indigo-700 font-bold px-5 py-3 hover:bg-indigo-50"><Heart className="w-4 h-4" /> Support Craftora</Link>
      </div>
    </div>
  );
}

function Face({ p, size = 'w-7 h-7', text = 'text-[10px]', ring = '' }) {
  if (p.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={p.photo} alt="" width={64} height={64} loading="lazy" className={`${size} rounded-full object-cover shrink-0 ${ring}`} />;
  }
  const ini = p.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return <span aria-hidden="true" className={`${size} ${text} rounded-full bg-white/70 dark:bg-slate-900/60 font-bold flex items-center justify-center shrink-0 ${ring}`}>{ini}</span>;
}

export default async function SupportersPage() {
  const { groups, total } = await getWall();
  const sponsors = groups.sponsors;
  const schema = [
    { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Craftora Founding Supporters', url: `${SITE}/supporters`, publisher: { '@id': `${SITE}/#organization` } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE }, { '@type': 'ListItem', position: 2, name: 'Supporters', item: `${SITE}/supporters` }] },
  ];

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <nav className="text-sm text-slate-500 dark:text-slate-400 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-600">Home</Link> <span className="mx-1">/</span>
          <span className="text-slate-700 dark:text-slate-200">Supporters</span>
        </nav>

        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex w-14 h-14 rounded-2xl items-center justify-center bg-pink-100 dark:bg-pink-950/50"><Heart className="w-7 h-7 text-pink-500 fill-pink-500" /></span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-4">Founding Supporters</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mt-4">
            Craftora is free for everyone because these people believed in it early. Every tool, every update, and every server bill is backed by the names on this page. Thank you.
          </p>
          {total > 0 && (
            <div className="inline-flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-sm">
              <span><strong className="text-xl text-slate-900 dark:text-white">{total}</strong> <span className="text-slate-500 dark:text-slate-400">{total === 1 ? 'supporter' : 'supporters'}</span></span>
              {sponsors.length > 0 && <span><strong className="text-xl text-slate-900 dark:text-white">{sponsors.length}</strong> <span className="text-slate-500 dark:text-slate-400">{sponsors.length === 1 ? 'sponsor' : 'sponsors'}</span></span>}
              {groups.business.length + groups.pro.length > 0 && <span><strong className="text-xl text-slate-900 dark:text-white">{groups.business.length + groups.pro.length}</strong> <span className="text-slate-500 dark:text-slate-400">lifetime {groups.business.length + groups.pro.length === 1 ? 'backer' : 'backers'}</span></span>}
            </div>
          )}
        </div>

        <div className="mt-10"><SupporterSelf /></div>

        {total === 0 ? (
          <div className="mt-10 space-y-8">
            <JoinCta />
            <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-10 text-center">
              <Heart className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="font-bold text-slate-900 dark:text-white mt-3">This wall is waiting for its first names.</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Founding supporters are listed here forever, in the order they joined.</p>
            </div>
          </div>
        ) : (
          <div className="mt-12 space-y-14">
            {sponsors.length > 0 && (
              <section aria-labelledby="g-sponsors">
                <h2 id="g-sponsors" className="text-2xl font-extrabold text-slate-900 dark:text-white text-center">Sponsors</h2>
                <p className="text-slate-500 dark:text-slate-400 text-center mt-1">Companies that made Craftora possible.</p>
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  {sponsors.map((s, i) => {
                    const inner = (
                      <>
                        {s.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.logo} alt={`${s.name} logo`} className="h-14 max-w-[180px] object-contain mx-auto" loading="lazy" />
                        ) : (
                          <span className="h-14 flex items-center justify-center text-2xl font-extrabold text-slate-900 dark:text-white">{s.name}</span>
                        )}
                        {s.logo && <span className="block mt-3 font-semibold text-slate-900 dark:text-white">{s.name}</span>}
                        {s.url && <span className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 mt-1">Visit <ExternalLink className="w-3 h-3" /></span>}
                      </>
                    );
                    const cls = 'block w-full sm:w-72 rounded-2xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 p-6 text-center hover:border-amber-400 transition';
                    return s.url
                      ? <a key={i} href={s.url} target="_blank" rel="sponsored noopener" className={cls}>{inner}</a>
                      : <div key={i} className={cls}>{inner}</div>;
                  })}
                </div>
              </section>
            )}

            {GROUPS.filter((g) => g.key !== 'sponsors' && groups[g.key].length).map((g) => {
              const st = STYLE[g.key];
              const Icon = st.icon;
              return (
                <section key={g.key} aria-labelledby={`g-${g.key}`}>
                  <h2 id={`g-${g.key}`} className="text-2xl font-extrabold text-slate-900 dark:text-white text-center flex items-center justify-center gap-2"><Icon className={`w-5 h-5 ${st.iconCls}`} />{g.title}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-center mt-1">{g.blurb} <span className="font-semibold">{groups[g.key].length}</span></p>
                  <ul className="flex flex-wrap justify-center gap-2.5 mt-6">
                    {groups[g.key].map((p, i) => g.key === 'business' ? (
                      <li key={i} className={`rounded-2xl border ${st.chip} px-5 py-4 flex flex-col items-center gap-2 w-40`} title={`Supporter since ${new Date(p.since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}>
                        <Face p={p} size="w-16 h-16" text="text-lg" ring="ring-2 ring-teal-300 dark:ring-teal-700" />
                        <span className="font-semibold text-center leading-tight">{p.name}</span>
                      </li>
                    ) : (
                      <li key={i} className={`rounded-full border font-semibold ${st.chip} pl-1.5 pr-3.5 py-1.5 flex items-center gap-2 ${g.key === 'pro' ? 'text-sm' : 'text-sm'}`} title={`Supporter since ${new Date(p.since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}>
                        <Face p={p} size={g.key === 'pro' ? 'w-8 h-8' : 'w-7 h-7'} />
                        {p.name}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}

            <JoinCta compact />
          </div>
        )}

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-12">
          Want to support Craftora in another way? Share your favorite tool, or email <a href={`mailto:${COMPANY.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{COMPANY.email}</a>. Learn more <Link href="/about" className="text-indigo-600 dark:text-indigo-400 hover:underline">about Craftora</Link>.
        </p>
      </main>
      <Footer />
    </>
  );
}
