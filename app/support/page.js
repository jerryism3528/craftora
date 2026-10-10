import Link from 'next/link';
import { Rocket, Coffee, HandHeart, Crown, Share2, MessageSquare, Heart, ArrowRight, Check } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { SITE, COMPANY, FUNDING } from '../../lib/company';

export const metadata = {
  title: 'Support Craftora: Help Keep Free Online Tools Free',
  description: 'Support Craftora, the free and privacy-first online tools suite. Back our campaign for lifetime perks, become a monthly supporter, or make a one-time donation.',
  alternates: { canonical: '/support' },
  openGraph: {
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }],
    title: 'Support Craftora',
    description: 'Help keep Craftora free, fast, and private for everyone.',
    url: `${SITE}/support`,
    type: 'website',
  },
};

const OPTIONS = [
  {
    key: 'kickstarter', icon: Rocket, tone: 'from-indigo-600 to-violet-600', title: 'Back the campaign', platform: 'Kickstarter',
    blurb: 'Pledge once and get lifetime perks while the campaign runs.',
    perks: ['Lifetime Pro or Business plan', 'Higher limits, no ads, more storage', 'Your name on the Founding Supporters wall'],
    cta: 'Back on Kickstarter', soon: 'Campaign launching soon',
  },
  {
    key: 'kofi', icon: Coffee, tone: 'from-teal-600 to-emerald-600', title: 'Support monthly', platform: 'Ko-fi',
    blurb: 'A small monthly membership that keeps the servers running.',
    perks: ['Pro features while you are a member', 'Your name on the Founding Supporters wall', 'Cancel any time'],
    cta: 'Join on Ko-fi', soon: 'Memberships coming soon',
  },
  {
    key: 'gofundme', icon: HandHeart, tone: 'from-pink-600 to-rose-600', title: 'Make a donation', platform: 'GoFundMe',
    blurb: 'A one-time gift to help keep every tool free for everyone.',
    perks: ['Goes straight to hosting and development', 'Any amount helps'],
    note: 'Donations are gifts and do not include any rewards.',
    cta: 'Donate on GoFundMe', soon: 'Donations coming soon',
  },
];

const FAQS = [
  ['Is Craftora still free if I do not pay?', 'Yes. Every tool stays free to use. Supporters get extras like higher daily limits and no ads, and help us keep the free version running for everyone.'],
  ['Who receives the money?', `Craftora is owned and operated by ${COMPANY.legalName}, a ${COMPANY.state} company. All support goes to hosting, development, and growing Craftora.`],
  ['Are contributions tax-deductible?', `No. ${COMPANY.legalName} is a for-profit company, so contributions are not tax-deductible.`],
  ['How do campaign rewards reach my account?', 'Sign up on craftora.dev with the same email you used to back us. Your plan and your place on the Founding Supporters wall are added to your account automatically.'],
];

export default function SupportPage() {
  const schema = [
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE }, { '@type': 'ListItem', position: 2, name: 'Support', item: `${SITE}/support` }] },
  ];
  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <nav className="text-sm text-slate-500 dark:text-slate-400 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-600">Home</Link> <span className="mx-1">/</span>
          <span className="text-slate-700 dark:text-slate-200">Support</span>
        </nav>
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex w-14 h-14 rounded-2xl items-center justify-center bg-pink-100 dark:bg-pink-950/50"><Heart className="w-7 h-7 text-pink-500 fill-pink-500" /></span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-4">Support Craftora</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mt-4">Craftora gives everyone free, private online tools with no watermarks and no signup walls. Pick the way of helping that suits you.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {OPTIONS.map((o) => {
            const url = FUNDING[o.key];
            const Icon = o.icon;
            return (
              <section key={o.key} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden flex flex-col" aria-labelledby={`opt-${o.key}`}>
                <div className={`bg-gradient-to-br ${o.tone} p-5 text-white`}>
                  <Icon className="w-7 h-7" />
                  <h2 id={`opt-${o.key}`} className="text-xl font-extrabold mt-3">{o.title}</h2>
                  <p className="text-sm text-white/85 mt-1">{o.blurb}</p>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200 flex-1">
                    {o.perks.map((p) => <li key={p} className="flex gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{p}</li>)}
                  </ul>
                  {o.note && <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">{o.note}</p>}
                  {url ? (
                    <a href={url} target="_blank" rel="noopener" className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-4 py-3 hover:opacity-90">{o.cta} <ArrowRight className="w-4 h-4" /></a>
                  ) : (
                    <span className="mt-5 inline-flex items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-semibold px-4 py-3">{o.soon}</span>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <Crown className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <p className="text-sm text-slate-700 dark:text-slate-200 flex-1"><strong className="text-slate-900 dark:text-white">Prefer a regular subscription?</strong> Pro and Business plans with monthly or yearly billing are coming soon, right here on craftora.dev.</p>
        </div>

        <section className="mt-12" aria-labelledby="free-ways">
          <h2 id="free-ways" className="text-2xl font-extrabold text-slate-900 dark:text-white text-center">Free ways to help</h2>
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            {[
              [Share2, 'Share a tool', 'Tell a friend or post your favorite Craftora tool. Word of mouth is how small tools grow.'],
              [MessageSquare, 'Send feedback', <>Found a bug or want a new tool? Email <a href={`mailto:${COMPANY.supportEmail}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{COMPANY.supportEmail}</a>.</>],
              [Heart, 'Meet our supporters', <>See the people keeping Craftora free on the <Link href="/supporters" className="text-indigo-600 dark:text-indigo-400 hover:underline">Founding Supporters wall</Link>.</>],
            ].map(([Icon, t, d]) => (
              <div key={t} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
                <Icon className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 dark:text-white mt-2">{t}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 max-w-3xl mx-auto" aria-labelledby="faq">
          <h2 id="faq" className="text-2xl font-extrabold text-slate-900 dark:text-white text-center">Questions</h2>
          <div className="mt-5 space-y-3">
            {FAQS.map(([q, a]) => (
              <details key={q} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                <summary className="font-semibold text-slate-900 dark:text-white cursor-pointer">{q}</summary>
                <p className="text-slate-700 dark:text-slate-300 mt-2">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
