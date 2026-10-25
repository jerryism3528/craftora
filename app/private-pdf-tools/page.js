import Link from 'next/link';
import * as Lucide from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { tools } from '../../lib/tools';
import { LIMITED_BROWSER_TOOLS } from '../../lib/browser-limits';

const SITE_URL = 'https://craftora.dev';
const TITLE = 'Private PDF Tools: Edit PDFs Without Uploading Them';
const DESCRIPTION =
  'Merge, split, compress, protect, watermark and sign PDFs without uploading them. Craftora PDF and image tools run in your browser, so confidential client files never leave your computer.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/private-pdf-tools' },
  openGraph: {
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }],
    title: `${TITLE} | Craftora`,
    description: DESCRIPTION,
    url: `${SITE_URL}/private-pdf-tools`,
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: `${TITLE} | Craftora`, description: DESCRIPTION },
};

function Icon({ name, className }) {
  const Cmp = Lucide[name] || Lucide.Wrench;
  return <Cmp className={className} />;
}

const WHO = [
  ['Scale', 'Law firms', 'Contracts, case files, court filings and client IDs.'],
  ['Calculator', 'Accounting and tax firms', 'Tax returns, bank statements, payroll and receipts.'],
  ['Users', 'HR and recruiting', 'Resumes, offer letters, ID scans and employment contracts.'],
  ['Home', 'Real estate and insurance', 'Purchase contracts, disclosures, IDs and claims.'],
];

const STEPS = [
  ['You open a tool', 'The page loads the PDF engine into your browser, the same way any web page loads.'],
  ['You pick your file', 'The file is read on your own computer. It is not sent to Craftora or anyone else.'],
  ['Your browser does the work', 'Merging, compressing or signing happens on your device, then you save the result.'],
];

const FAQS = [
  ['Are my files uploaded when I use these tools?', 'No. Every tool on this page runs in your web browser, so the file is read and processed on your own computer and never sent to a server. To count your free daily uses, Craftora only receives the tool name, the number of files and their sizes, never the file itself.'],
  ['How can I check that nothing is uploaded?', 'Open your browser developer tools (press F12), go to the Network tab, and run a tool. You will see the page asking Craftora to count one use, but no request that carries your file.'],
  ['Why does it matter for confidential documents?', 'Most free PDF websites upload your file to their servers to process it. For contracts, tax records, resumes or client IDs, that means confidential data sits on a third party server you do not control. With Craftora the file stays on your device.'],
  ['Are these tools free?', 'Yes. Each tool can be used 3 times a day without an account and 5 times a day with a free account, with files up to 25 MB. Pro removes the daily limit and allows files up to 200 MB, Business up to 500 MB.'],
  ['Which Craftora tools do upload files?', 'Converting to or from Word, Excel and PowerPoint, PDF OCR, ebook conversion, video and audio conversion, and transcription run on our server because browsers cannot do them well. Those files are processed and sent straight back, and they are not kept. The Document Signer stores documents so other people can sign them.'],
  ['Do the tools work on Mac, Windows and phones?', 'Yes. They work in any modern browser, including Chrome, Edge, Safari and Firefox, on desktop and mobile.'],
];

export default function PrivatePdfToolsPage() {
  const list = LIMITED_BROWSER_TOOLS.map((s) => tools.find((t) => t.slug === s)).filter((t) => t && t.status === 'live');
  const pdf = list.filter((t) => t.category === 'pdf');
  const image = list.filter((t) => t.category !== 'pdf');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: TITLE,
        description: DESCRIPTION,
        url: `${SITE_URL}/private-pdf-tools`,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: list.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, url: `${SITE_URL}/${t.slug}` })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Private PDF tools', item: `${SITE_URL}/private-pdf-tools` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  };

  const grid = (items) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
      {items.map((t) => (
        <Link key={t.slug} href={`/${t.slug}`} className={`tool-card category-${t.category}`}>
          <span className="tool-icon"><Icon name={t.icon} className="w-5 h-5" /></span>
          <strong className="block text-sm mt-5" style={{ color: 'var(--ink)' }}>{t.name}</strong>
          <span className="block muted text-xs leading-5 mt-1.5">{t.description}</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold mt-3" style={{ color: '#187c6f' }}><Lucide.ShieldCheck className="w-3.5 h-3.5" />Stays in your browser</span>
        </Link>
      ))}
    </div>
  );

  return (
    <div>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="editorial-width px-4 sm:px-7 py-12 sm:py-16">
        <nav aria-label="Breadcrumb" className="text-sm muted mb-9">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="px-2">/</span>
          <span>Private PDF tools</span>
        </nav>

        <p className="brand-text text-xs font-extrabold tracking-[.16em] uppercase mb-3">Your files never leave your browser</p>
        <h1 className="font-extrabold tracking-tight text-4xl max-w-3xl" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>Private PDF tools for confidential documents</h1>
        <p className="muted max-w-3xl leading-7 mt-5 text-lg">
          Most free PDF sites upload your file to their servers before they merge or compress anything. Craftora&apos;s PDF and image tools work inside your browser instead, so contracts, tax records, resumes and client IDs stay on your own computer.
        </p>
        <div className="flex flex-wrap gap-3 mt-7">
          <Link href="/merge-pdf" className="rounded-xl px-5 py-3 text-sm font-bold" style={{ background: 'var(--brand)', color: '#fff' }}>Try Merge PDF</Link>
          <Link href="/pricing" className="rounded-xl px-5 py-3 text-sm font-bold border surface" style={{ color: 'var(--ink)' }}>Plans for teams</Link>
        </div>

        <section className="mt-16">
          <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>PDF tools that never upload your file</h2>
          {grid(pdf)}
        </section>

        <section className="mt-14">
          <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>Image tools that never upload your file</h2>
          <p className="muted text-sm mt-2 max-w-3xl">Useful for scanned IDs, receipts and signatures before they go into a PDF.</p>
          {grid(image)}
        </section>

        <section className="mt-16 section-rule pt-14">
          <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8 mt-8">
            {STEPS.map(([h, p], i) => (
              <div key={h}>
                <span className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{ background: i === 0 ? '#3430a8' : i === 1 ? '#7652d4' : '#187c6f' }}>{i + 1}</span>
                <h3 className="font-bold text-lg mt-4" style={{ color: 'var(--ink)' }}>{h}</h3>
                <p className="muted text-sm mt-2 leading-6">{p}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 section-rule pt-14">
          <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>Built for teams that handle client files</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {WHO.map(([icon, h, p]) => (
              <div key={h} className="border surface rounded-2xl p-5">
                <Icon name={icon} className="w-5 h-5 brand-text" />
                <h3 className="font-bold mt-3" style={{ color: 'var(--ink)' }}>{h}</h3>
                <p className="muted text-sm mt-1.5 leading-6">{p}</p>
              </div>
            ))}
          </div>
          <p className="muted text-sm mt-6 max-w-3xl leading-6">
            Free to use every day. Pro and Business remove the daily limits and raise the file size to 200 MB and 500 MB, for less than most PDF subscriptions. <Link href="/pricing" className="brand-text font-semibold hover:underline">See plans</Link>
          </p>
        </section>

        <section className="max-w-3xl mt-16 section-rule pt-12">
          <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>Private PDF tools FAQ</h2>
          <div className="space-y-3 mt-6">
            {FAQS.map(([q, a]) => (
              <article key={q} className="border surface rounded-2xl p-5">
                <h3 className="font-bold" style={{ color: 'var(--ink)' }}>{q}</h3>
                <p className="muted text-sm leading-6 mt-2">{a}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
