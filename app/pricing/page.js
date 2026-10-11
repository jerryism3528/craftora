import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PricingPlans from '../../components/PricingPlans';
import OneTimeCheckout from '../../components/OneTimeCheckout';
import { activeProducts } from '../../lib/billing-once';
import { paypalMode } from '../../lib/paypal';
import { query } from '../../lib/db';
import { getPlans, planForUser } from '../../lib/plans';
import { priceTable } from '../../lib/billing';
import { currentUser } from '../../lib/current-user';
import { tools } from '../../lib/tools';
import { SITE, COMPANY } from '../../lib/company';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pricing: Free Online Tools, Pro and Business Plans',
  description: 'Craftora is free to use. Upgrade to Pro ($5/month) or Business ($15/month) for higher daily limits on SEO audits, email verification, and e-signatures. Cancel any time.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Craftora Pricing: Free, Pro and Business',
    description: 'Every browser tool is free. Pro and Business plans raise your daily limits on server tools.',
    url: `${SITE}/pricing`,
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }],
  },
};

const LABELS = {
  'seo-site-audit': 'Full-site SEO audits',
  'document-signer': 'Documents sent for signature',
  'email-verifier': 'Single email verifications',
  'bulk-email-verifier': 'Bulk email lists',
  'word-to-pdf': 'Word to PDF conversions',
};
const SHORT = {
  'seo-site-audit': 'full-site SEO audits',
  'document-signer': 'documents sent for signature',
  'email-verifier': 'email verifications',
  'bulk-email-verifier': 'bulk email lists',
  'word-to-pdf': 'Word to PDF conversions',
};
const ORDER = ['seo-site-audit', 'document-signer', 'email-verifier', 'bulk-email-verifier', 'word-to-pdf'];
const idx = (slug) => { const i = ORDER.indexOf(slug); return i < 0 ? 99 : i; };

function limitFor(plan, slug, base) {
  if (!plan || plan.key === 'free') return base;
  const o = plan.tool_overrides?.[slug];
  if (o !== undefined && o !== null && o !== '') return Number(o);
  return Math.round(base * (plan.multiplier || 1));
}

export default async function PricingPage() {
  const [plans, prices, user, products] = await Promise.all([getPlans(), priceTable(), currentUser().catch(() => null), activeProducts()]);
  let limitsRows = [];
  try { limitsRows = await query('SELECT tool_slug, daily_limit, batch_limit FROM tool_limits WHERE enabled'); } catch { limitsRows = []; }
  const rows = limitsRows
    .filter((r) => LABELS[r.tool_slug] || tools.find((t) => t.slug === r.tool_slug))
    .sort((a, b) => idx(a.tool_slug) - idx(b.tool_slug))
    .map((r) => ({
      slug: r.tool_slug,
      label: LABELS[r.tool_slug] || tools.find((t) => t.slug === r.tool_slug)?.name || r.tool_slug,
      short: SHORT[r.tool_slug] || LABELS[r.tool_slug] || tools.find((t) => t.slug === r.tool_slug)?.name || r.tool_slug,
      batch: r.batch_limit,
      free: r.daily_limit,
      pro: limitFor(plans.pro, r.tool_slug, r.daily_limit),
      business: limitFor(plans.business, r.tool_slug, r.daily_limit),
    }));
  const current = user ? await planForUser(user.id) : null;
  const browserTools = tools.filter((t) => t.status === 'live' && t.engine === 'browser').length;

  const pro = prices.pro || {};
  const biz = prices.business || {};
  const dollars = (c) => (Number(c || 0) / 100).toFixed(2);
  const FAQS = [
    ['Is Craftora still free?', `Yes. All ${browserTools}+ browser tools are free with no daily limits, and server tools like the SEO audit and Email Verifier have a free daily allowance. Paid plans only raise the limits.`],
    ['How do I pay?', 'Checkout is handled by PayPal. You can pay with your PayPal balance or a debit or credit card. We never see or store your card details.'],
    ['Can I cancel any time?', 'Yes. Cancel from your Billing page or from your PayPal account. Your plan stays active until the end of the period you already paid for, and you will not be charged again.'],
    ['Can I pay once instead of subscribing?', 'Yes. Choose Pro or Business for 1 year with a single payment. It does not renew, and we email you a week before it ends. You can pay with Apple Pay, Google Pay, PayPal, or a card.'],
    ['Do you offer refunds?', `If you are not happy, email ${COMPANY.supportEmail} within 7 days of your first payment or of a one-time purchase and we will refund it. Renewals are not refunded, but you can cancel before the next renewal date.`],
    ['Can I switch between Pro and Business?', 'Yes. Upgrading to Business starts right away and your Pro subscription is cancelled automatically. To move from Business to Pro, cancel Business, then subscribe to Pro when your paid period ends.'],
    ['Who is the seller?', `Craftora is operated by ${COMPANY.legalName}, a ${COMPANY.state} company. Payments show as Craftora or ${COMPANY.legalName} on your statement.`],
  ];

  const schema = [
    {
      '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Craftora', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', url: SITE,
      offers: [
        { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD' },
        pro.month && { '@type': 'Offer', name: 'Pro (monthly)', price: dollars(pro.month.cents), priceCurrency: 'USD' },
        pro.year && { '@type': 'Offer', name: 'Pro (yearly)', price: dollars(pro.year.cents), priceCurrency: 'USD' },
        biz.month && { '@type': 'Offer', name: 'Business (monthly)', price: dollars(biz.month.cents), priceCurrency: 'USD' },
        biz.year && { '@type': 'Offer', name: 'Business (yearly)', price: dollars(biz.year.cents), priceCurrency: 'USD' },
        ...products.map((p) => ({ '@type': 'Offer', name: `${p.name} (one-time)`, price: dollars(p.price_cents), priceCurrency: 'USD' })),
      ].filter(Boolean),
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE }, { '@type': 'ListItem', position: 2, name: 'Pricing', item: `${SITE}/pricing` }] },
  ];

  const planInfo = (k) => ({ key: k, name: plans[k]?.name || k, multiplier: plans[k]?.multiplier || 1, rank: plans[k]?.rank || 0 });

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <nav className="text-sm text-slate-500 dark:text-slate-400 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-600">Home</Link> <span className="mx-1">/</span>
          <span className="text-slate-700 dark:text-slate-200">Pricing</span>
        </nav>
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">Simple pricing. Free tools stay free.</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mt-4">Every browser tool is free forever. Upgrade only if you need more SEO audits, email checks, or e-signatures each day.</p>
        </div>

        <PricingPlans
          prices={prices}
          plans={{ free: planInfo('free'), pro: planInfo('pro'), business: planInfo('business') }}
          rows={rows}
          browserTools={browserTools}
          loggedIn={!!user}
          current={current ? { key: current.key, lifetime: current.lifetime, expiresAt: current.expiresAt } : null}
        />

        <OneTimeCheckout
          products={products.map((p) => ({ key: p.key, name: p.name, months: p.months, price_cents: p.price_cents }))}
          clientId={process.env.PAYPAL_CLIENT_ID || ''}
          mode={paypalMode()}
          loggedIn={!!user}
        />

        <section className="mt-14" aria-labelledby="compare">
          <h2 id="compare" className="text-2xl font-extrabold text-slate-900 dark:text-white text-center">Daily limits compared</h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 font-semibold">Per day</th>
                  <th className="py-3 px-4 font-semibold">Free</th>
                  <th className="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">Pro</th>
                  <th className="py-3 px-4 font-semibold text-teal-600 dark:text-teal-400">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-800 dark:text-slate-100">
                <tr>
                  <td className="py-3 px-4">{browserTools}+ browser tools (PDF, image, text, developer)</td>
                  <td className="py-3 px-4">Unlimited</td><td className="py-3 px-4">Unlimited</td><td className="py-3 px-4">Unlimited</td>
                </tr>
                {rows.map((r) => (
                  <tr key={r.slug}>
                    <td className="py-3 px-4">{r.label}{r.batch ? <span className="text-slate-500 dark:text-slate-400"> (up to {r.batch} emails each)</span> : null}</td>
                    <td className="py-3 px-4">{r.free.toLocaleString()}</td>
                    <td className="py-3 px-4 font-semibold">{r.pro.toLocaleString()}</td>
                    <td className="py-3 px-4 font-semibold">{r.business.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">Limits reset 24 hours after first use. Fair use applies to all plans.</p>
        </section>

        <section className="mt-14 max-w-3xl mx-auto" aria-labelledby="faq">
          <h2 id="faq" className="text-2xl font-extrabold text-slate-900 dark:text-white text-center">Questions</h2>
          <div className="mt-5 space-y-3">
            {FAQS.map(([q, a]) => (
              <details key={q} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                <summary className="font-semibold text-slate-900 dark:text-white cursor-pointer">{q}</summary>
                <p className="text-slate-700 dark:text-slate-300 mt-2">{a}</p>
              </details>
            ))}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-6">
            Prefer a one-time contribution? See other ways to <Link href="/support" className="text-indigo-600 dark:text-indigo-400 hover:underline">support Craftora</Link>. By subscribing you agree to our <Link href="/terms#billing" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms</Link>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
