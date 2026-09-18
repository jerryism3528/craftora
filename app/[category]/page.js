import Link from 'next/link';
import { notFound } from 'next/navigation';
import * as Lucide from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { categories, tools, getCategoryBySlug, getToolsByCategory } from '../../lib/tools';

const SITE_URL = 'https://craftora.dev';

// Pre-build all 10 category pages at deploy time (fast + SEO-friendly).
export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

// Per-page SEO: unique title, description, canonical, and social tags.
export function generateMetadata({ params }) {
  const cat = getCategoryBySlug(params.category);
  if (!cat) return {};
  const title = `${cat.name}: Free Online ${cat.name}`;
  const description = cat.description;
  return {
    title,
    description,
    alternates: { canonical: `/${cat.slug}` },
    openGraph: {
      title: `${title} | Craftora`,
      description,
      url: `${SITE_URL}/${cat.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Craftora`,
      description,
    },
  };
}

function Icon({ name, className }) {
  const Cmp = Lucide[name] || Lucide.Wrench;
  return <Cmp className={className} />;
}

// Short FAQ per category, with competitor mentions for SEO.
const CATEGORY_FAQS = {
  pdf: [
    ['Are these PDF tools free?', 'Yes. Every Craftora PDF tool is free with no watermarks and no daily limits, unlike the paid tiers on iLovePDF and Smallpdf.'],
    ['Do my PDF files get uploaded?', 'Most Craftora PDF tools run right in your browser, so your files never leave your device. That is more private than tools that upload every file to a server.'],
    ['Can I use these on mobile?', 'Yes. Every PDF tool works in modern mobile browsers on Android and iPhone.'],
  ],
  image: [
    ['Are these image tools free?', 'Yes. Compress, resize, crop, and convert images for free with no watermarks added to your files.'],
    ['Will compressing reduce image quality?', 'Craftora aims for the smallest file size while keeping images looking sharp. You can preview the result before saving.'],
    ['Do you support WebP and PNG?', 'Yes. You can convert between JPG, PNG, WebP, and GIF formats in the browser.'],
  ],
  convert: [
    ['What files can I convert?', 'Craftora converts documents, images, audio, and video across a wide range of common formats.'],
    ['Is converting files safe?', 'Browser-based conversions stay on your device. For larger server conversions, files are deleted automatically within one hour.'],
    ['Is it really free?', 'Yes, the converters are free to use with no watermarks.'],
  ],
  seo: [
    ['Are these SEO tools free?', 'Yes. Audit pages, generate meta tags and schema, and preview snippets for free.'],
    ['Is this a good alternative to paid SEO tools?', 'For on-page checks and quick fixes, Craftora covers the essentials without a subscription like Ahrefs or Semrush.'],
    ['Do I need an account?', 'A free account is only needed for the SEO Audit tool that saves your reports. The generators need no signup.'],
  ],
  email: [
    ['How does the email verifier work?', 'It checks an email address for valid format, a working mail server, and deliverability, so you can clean your list before sending.'],
    ['Is there a daily limit?', 'Single checks are capped at 100 per day and bulk runs at 50 per batch, per free account, to keep the service fast and fair.'],
    ['Do I need an account?', 'Yes, the email tools need a free account since they process and save results for you.'],
  ],
  text: [
    ['Are these text tools free?', 'Yes. Count words, change case, compare text, and clean formatting, all free with no signup.'],
    ['Do the text tools work offline in the browser?', 'Yes. Text tools run entirely in your browser, so your text is never uploaded.'],
    ['Can I use them on mobile?', 'Yes, every text tool is mobile-friendly.'],
  ],
  developer: [
    ['Are these developer tools free?', 'Yes. Format JSON, encode Base64, generate hashes, UUIDs, QR codes, and more for free.'],
    ['Is my data sent to a server?', 'No. Developer tools run in your browser, so your code and data stay on your device.'],
    ['Do I need to sign up?', 'No signup is needed for the developer tools.'],
  ],
  security: [
    ['Are these password tools safe?', 'Yes. Passwords are generated in your browser and never sent anywhere or stored.'],
    ['Are they free?', 'Yes, all security tools are free with no signup.'],
    ['Can I choose password length and symbols?', 'Yes, you can set length and character types when generating a password.'],
  ],
  business: [
    ['Is the invoice generator free?', 'Yes. Create and download professional PDF invoices for free with no watermark.'],
    ['Do I need an account?', 'No account is needed to make and download an invoice.'],
    ['Can I add my logo and details?', 'Yes, you can add your business details and download a clean PDF ready to send.'],
  ],
  media: [
    ['Is transcription free?', 'Yes, basic audio and video transcription is free, with a free account for saving longer transcripts.'],
    ['What can the tools handle?', 'You can transcribe common audio and video files to text quickly.'],
    ['Is my media kept?', 'Uploaded media for server tools is deleted automatically within one hour and never shared.'],
  ],
};

export default function CategoryPage({ params }) {
  const cat = getCategoryBySlug(params.category);
  if (!cat) notFound();

  const catTools = getToolsByCategory(cat.key);
  const faqs = CATEGORY_FAQS[cat.key] || [];

  // Structured data: breadcrumb + FAQ (helps rich results).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: cat.name, item: `${SITE_URL}/${cat.slug}` },
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

      <main className="editorial-width px-4 sm:px-7 py-12 sm:py-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm muted mb-9">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="px-2">/</span>
          <span>{cat.name}</span>
        </nav>

        <p className="brand-text text-xs font-extrabold tracking-[.16em] uppercase mb-3">Tool category</p>
        <h1 className="font-extrabold tracking-tight text-4xl" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>
          {cat.name}
        </h1>
        <p className="muted max-w-3xl leading-7 mt-5 text-lg">{cat.description}</p>

        {/* Tool grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-12">
          {catTools.map((t) => {
            const inner = (
              <>
                <span className="tool-icon"><Icon name={t.icon} className="w-5 h-5" /></span>
                <span className="flex items-center gap-2 mt-5">
                  <strong className="block text-sm" style={{ color: 'var(--ink)' }}>{t.name}</strong>
                  {t.status !== 'live' && (
                    <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md" style={{ background: 'var(--surface-soft)', color: 'var(--muted)' }}>Soon</span>
                  )}
                </span>
                <span className="block muted text-xs leading-5 mt-1.5">{t.description}</span>
              </>
            );
            return t.status === 'live' ? (
              <Link key={t.slug} href={`/${t.slug}`} className={`tool-card category-${t.category}`}>{inner}</Link>
            ) : (
              <div key={t.slug} className={`tool-card category-${t.category}`} style={{ opacity: 0.85 }}>{inner}</div>
            );
          })}
        </div>

        {/* FAQ */}
        {faqs.length > 0 && (
          <section className="max-w-3xl mt-20 section-rule pt-12">
            <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>{cat.name} FAQ</h2>
            <div className="space-y-3 mt-6">
              {faqs.map(([q, a], i) => (
                <article key={i} className="border surface rounded-2xl p-5">
                  <h3 className="font-bold" style={{ color: 'var(--ink)' }}>{q}</h3>
                  <p className="muted text-sm leading-6 mt-2">{a}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
