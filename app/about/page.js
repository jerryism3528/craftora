import Link from 'next/link';
import { ShieldCheck, Zap, Gift, Lock, Mail, MapPin, Building2, Instagram, Twitter, FileSignature, Gauge, FileText, Network, MailCheck, Image as ImageIcon } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { SITE, COMPANY, OWNER, twitterUrl, instagramUrl, ORG_ID, ownerSchema } from '../../lib/company';

export const metadata = {
  title: 'About Craftora: Free Online Tools by GE Promo Hub LLC',
  description: 'Craftora is a free, privacy-first online tools suite for PDFs, images, SEO, e-signatures, and more. Owned and operated by GE Promo Hub LLC in Winter Haven, Florida.',
  alternates: { canonical: '/about' },
  openGraph: {
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }],
    title: 'About Craftora | Free Online Tools That Just Work',
    description: 'Who we are, what we believe, and how to reach the team behind Craftora.',
    url: `${SITE}/about`,
    type: 'website',
  },
  twitter: { card: 'summary_large_image', site: `@${COMPANY.twitter}`, creator: `@${COMPANY.twitter}` },
};

const VALUES = [
  [Gift, 'Free for everyone', 'Every tool on Craftora is free to use. No watermarks, no trial timers, and no credit card.'],
  [Lock, 'Private by design', 'Most tools run in your browser, so your files never leave your device. Files sent to our servers are deleted within one hour.'],
  [Zap, 'Fast and simple', 'Open a tool, drop a file, get the result. Most tools need no signup at all.'],
  [ShieldCheck, 'Honest and secure', 'We do not sell or share your data. Accounts are protected, and signed documents can be verified by anyone.'],
];

const TOOLS = [
  ['/seo-audit', Gauge, 'SEO Audit', 'Find and fix SEO issues on any page'],
  ['/document-signer', FileSignature, 'Document Signer', 'Send PDFs for e-signature'],
  ['/sitemap-generator', Network, 'Sitemap Generator', 'Crawl a site and build sitemap.xml'],
  ['/email-verifier', MailCheck, 'Email Verifier', 'Check if an email address is real'],
  ['/merge-pdf', FileText, 'Merge PDF', 'Combine PDFs in your browser'],
  ['/compress-image', ImageIcon, 'Compress Image', 'Shrink images without losing quality'],
];

const FAQS = [
  ['Who owns Craftora?', `Craftora is owned and operated by ${COMPANY.legalName}, a ${COMPANY.state} limited liability company led by ${OWNER.name}.`],
  ['Is Craftora really free?', 'Yes. All tools are free to use. Some server tools, like the full-site SEO audit and the document signer, need a free account and have fair daily limits to keep the service fast for everyone.'],
  ['Where are my files processed?', 'Most tools process files directly in your browser, so the file never reaches our servers. Tools that need a server delete uploaded files within one hour.'],
  ['How do I contact Craftora?', `Email ${COMPANY.supportEmail} for help with a tool, or ${COMPANY.email} for business and partnership inquiries.`],
];

function Avatar() {
  if (OWNER.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={OWNER.photo} alt={`${OWNER.name}, ${OWNER.title} of Craftora`} width={160} height={160} className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover shadow-lg" />;
  }
  const initials = OWNER.name.split(' ').map((w) => w[0]).join('');
  return (
    <div role="img" aria-label={`${OWNER.name}, ${OWNER.title} of Craftora`} className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl shadow-lg flex items-center justify-center text-4xl sm:text-5xl font-extrabold text-white" style={{ background: 'linear-gradient(135deg, #3430a8 0%, #14b8a6 100%)' }}>
      {initials}
    </div>
  );
}

export default function AboutPage() {
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      '@id': `${SITE}/about#page`,
      url: `${SITE}/about`,
      name: 'About Craftora',
      about: { '@id': ORG_ID },
      mainEntity: { '@id': ORG_ID },
    },
    ownerSchema(),
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE }, { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE}/about` }] },
  ];
  const card = 'rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800';

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <nav className="text-sm text-slate-500 dark:text-slate-400 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-600">Home</Link> <span className="mx-1">/</span>
          <span className="text-slate-700 dark:text-slate-200">About</span>
        </nav>

        <p className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">About Craftora</p>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-2 max-w-3xl">Free online tools that just work.</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mt-4 max-w-3xl">
          Craftora is a free online tools suite for PDFs, images, file conversion, SEO, email verification, and e-signatures.
          We build tools that are fast, private, and simple enough to use in seconds, without signups, watermarks, or hidden fees.
          Craftora is a product of {COMPANY.legalName}, based in {COMPANY.city}, {COMPANY.state}.
        </p>

        <section className="mt-12" aria-labelledby="values">
          <h2 id="values" className="text-2xl font-bold text-slate-900 dark:text-white">What we believe</h2>
          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            {VALUES.map(([Icon, t, d]) => (
              <div key={t} className={`${card} p-5`}>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center"><Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
                <h3 className="font-bold text-slate-900 dark:text-white mt-3">{t}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="leadership">
          <h2 id="leadership" className="text-2xl font-bold text-slate-900 dark:text-white">Leadership</h2>
          <div id="maria-vindell" className={`${card} p-6 mt-5 flex flex-col sm:flex-row gap-6 items-start`}>
            <Avatar />
            <div className="min-w-0">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{OWNER.name}</h3>
              <p className="text-indigo-600 dark:text-indigo-400 font-semibold">{OWNER.title}, {COMPANY.legalName}</p>
              <p className="text-slate-700 dark:text-slate-300 mt-3 max-w-2xl">{OWNER.bio}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <a href={`mailto:${OWNER.email}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"><Mail className="w-4 h-4" /> {OWNER.email}</a>
                <a href={instagramUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"><Instagram className="w-4 h-4" /> @{OWNER.instagram}</a>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="tools">
          <h2 id="tools" className="text-2xl font-bold text-slate-900 dark:text-white">Popular tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
            {TOOLS.map(([href, Icon, name, sub]) => (
              <Link key={href} href={href} className={`${card} p-4 hover:border-indigo-400 flex items-start gap-3`}>
                <Icon className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <span><span className="block font-semibold text-slate-900 dark:text-white text-sm">{name}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{sub}</span></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="company">
          <h2 id="company" className="text-2xl font-bold text-slate-900 dark:text-white">Company details</h2>
          <div className={`${card} p-6 mt-5 grid sm:grid-cols-2 gap-5 text-sm`}>
            <div className="flex gap-3"><Building2 className="w-5 h-5 text-indigo-500 shrink-0" /><div><div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Legal entity</div><div className="text-slate-900 dark:text-white">{COMPANY.legalName}<br />{COMPANY.state} limited liability company</div></div></div>
            <div className="flex gap-3"><MapPin className="w-5 h-5 text-indigo-500 shrink-0" /><div><div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Address</div><address className="not-italic text-slate-900 dark:text-white">{COMPANY.street}<br />{COMPANY.city}, {COMPANY.region} {COMPANY.postal}<br />{COMPANY.countryName}</address></div></div>
            <div className="flex gap-3"><Mail className="w-5 h-5 text-indigo-500 shrink-0" /><div><div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email</div><div className="text-slate-900 dark:text-white">Support: <a href={`mailto:${COMPANY.supportEmail}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{COMPANY.supportEmail}</a><br />Business: <a href={`mailto:${COMPANY.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{COMPANY.email}</a></div></div></div>
            <div className="flex gap-3"><Twitter className="w-5 h-5 text-indigo-500 shrink-0" /><div><div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Follow us</div><a href={twitterUrl} target="_blank" rel="noopener" className="text-indigo-600 dark:text-indigo-400 hover:underline">X (Twitter) @{COMPANY.twitter}</a></div></div>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="faq">
          <h2 id="faq" className="text-2xl font-bold text-slate-900 dark:text-white">Frequently asked questions</h2>
          <div className="mt-4 space-y-3">
            {FAQS.map(([q, a]) => (
              <details key={q} className={`${card} p-4`}>
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
