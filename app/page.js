'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import * as Lucide from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { categories, tools } from '../lib/tools';

function Icon({ name, className }) {
  const Cmp = Lucide[name] || Lucide.Wrench;
  return <Cmp className={className} />;
}

const POPULAR = ['Merge PDF', 'Compress Image', 'Email Verifier', 'SEO Audit', 'JSON Formatter', 'Invoice Generator'];

const FAQS = [
  [
    'Is Craftora really free?',
    'Yes. Every tool on Craftora is free to use, with no signup for the browser-based tools, no watermarks, and no forced upgrades. Sites like iLovePDF and Smallpdf put daily limits and watermarks behind a paid plan. Craftora keeps the core tools genuinely free.',
  ],
  [
    'Craftora vs iLovePDF and Smallpdf, what is the difference?',
    'iLovePDF and Smallpdf upload your files to their servers to process them. Craftora runs most tools (PDF, image, text, and developer tools) directly in your browser, so your files never leave your device. That makes Craftora faster and more private for everyday tasks, with no page count caps.',
  ],
  [
    'Is Craftora a good TinyWow alternative?',
    'Yes. Like TinyWow, Craftora bundles many everyday tools in one place. The difference is privacy: Craftora processes files in your browser where possible instead of uploading them, and the interface stays clean with no clutter or ads getting in the way.',
  ],
  [
    'Are my files private and safe?',
    'For browser-based tools, your files are processed on your own device and are never uploaded to a server. For the few tools that need a server (like large file conversion), files are deleted automatically within one hour and never sold or shared.',
  ],
  [
    'Do I need to create an account?',
    'No account is needed for the browser-based tools. Just open a tool and use it. A free account is only needed for data tools that save your results, such as the Email Verifier and SEO Audit.',
  ],
  [
    'Which browsers does Craftora support?',
    'Craftora works in current versions of Chrome, Edge, Firefox, and Safari on desktop, tablet, and mobile.',
  ],
];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div>
      <Header />

      <main>
        {/* Hero */}
        <section className="editorial-width px-4 sm:px-7 py-10 sm:py-16">
          <div className="soft-surface rounded-[28px] p-7 sm:p-10 lg:p-12">
            <div className="inline-flex px-3 py-1.5 rounded-full text-sm font-bold mb-6" style={{ background: 'var(--surface)', color: 'var(--brand)' }}>
              craftora.dev
            </div>
            <h1 className="font-extrabold tracking-tight leading-tight max-w-3xl text-4xl sm:text-5xl" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>
              Free online tools that just work
            </h1>
            <p className="muted text-base sm:text-lg leading-8 max-w-2xl mt-5">
              Privacy-first tools with no signup, no watermarks, and fast browser-based processing where possible. Merge PDFs, compress images, convert files, verify emails, and more.
            </p>
            <div className="mt-8 max-w-2xl">
              <div className="surface border rounded-2xl p-2 flex gap-2 shadow-sm">
                <Lucide.Search className="w-5 h-5 mt-3 ml-3 muted shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent outline-none py-3"
                  style={{ color: 'var(--ink)' }}
                  type="search"
                  placeholder="Search 100+ free tools"
                  aria-label="Search all tools"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="muted text-sm py-1 mr-1 font-semibold">Popular:</span>
              {POPULAR.map((p) => (
                <button
                  key={p}
                  onClick={() => setQuery(p)}
                  className="border surface rounded-full px-3 py-1.5 text-sm font-semibold"
                  style={{ color: 'var(--ink)' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results (when searching) OR full library */}
        <section className="editorial-width px-4 sm:px-7 pb-4">
          {results ? (
            <div>
              <p className="muted text-sm mb-6">{results.length} tool{results.length === 1 ? '' : 's'} found</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.map((t) => (
                  <ToolCard key={t.slug} tool={t} />
                ))}
              </div>
            </div>
          ) : (
            categories.map((cat) => {
              const catTools = tools.filter((t) => t.category === cat.key);
              if (!catTools.length) return null;
              return (
                <section key={cat.key} id={cat.slug} className="mb-14 pt-10 section-rule">
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div>
                      <p className="brand-text text-xs font-extrabold tracking-[.14em] uppercase mb-2">Category</p>
                      <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>{cat.name}</h2>
                      <p className="muted text-sm mt-2 max-w-2xl">{cat.description}</p>
                    </div>
                    <Link href={`/${cat.slug}`} className="text-sm font-bold brand-text shrink-0">
                      View all
                    </Link>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {catTools.map((t) => (
                      <ToolCard key={t.slug} tool={t} />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </section>

        {/* Why Craftora */}
        <section className="section-rule" style={{ background: 'var(--surface)' }}>
          <div className="editorial-width px-4 sm:px-7 py-16">
            <div className="max-w-2xl mb-10">
              <p className="brand-text text-xs font-extrabold tracking-[.16em] uppercase mb-3">The Craftora standard</p>
              <h2 className="font-extrabold text-3xl" style={{ color: 'var(--ink)' }}>Why Craftora</h2>
              <p className="muted mt-3">Free online tools designed around clarity, privacy, and trust.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                ['Shield', 'Private by design', 'Files are processed in your browser where possible, so they never leave your device.'],
                ['HeartHandshake', 'Completely free', 'Use the tools you need with no watermarks and no daily paywall like iLovePDF or Smallpdf.'],
                ['MonitorSmartphone', 'Works on any device', 'A clean, fast experience across desktop, tablet, and mobile browsers.'],
                ['CircleCheckBig', 'No accounts or limits', 'Open a browser tool and start right away, no signup needed.'],
              ].map(([icon, title, text]) => (
                <article key={title} className="border surface rounded-2xl p-6">
                  <Icon name={icon} className="brand-text w-6 h-6 mb-5" />
                  <h3 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>{title}</h3>
                  <p className="muted text-sm leading-6 mt-2">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="editorial-width max-w-4xl px-4 sm:px-7 py-16">
          <div className="mb-8">
            <p className="brand-text text-xs font-extrabold tracking-[.16em] uppercase mb-3">Helpful answers</p>
            <h2 className="font-extrabold text-3xl" style={{ color: 'var(--ink)' }}>Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map(([q, a], i) => (
              <article key={i} className="border surface rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-5 text-left flex justify-between gap-4 font-bold"
                  style={{ color: 'var(--ink)' }}
                  aria-expanded={openFaq === i}
                >
                  <span>{q}</span>
                  <Lucide.Plus className={`shrink-0 w-5 h-5 transition-transform ${openFaq === i ? 'rotate-45' : ''}`} />
                </button>
                {openFaq === i && <div className="muted text-sm leading-6 px-5 pb-5">{a}</div>}
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ToolCard({ tool }) {
  const catClass = `category-${tool.category}`;
  const inner = (
    <>
      <span className="tool-icon">
        <Icon name={tool.icon} className="w-5 h-5" />
      </span>
      <span className="flex items-center gap-2 mt-5">
        <strong className="block text-sm" style={{ color: 'var(--ink)' }}>{tool.name}</strong>
        {tool.status !== 'live' && (
          <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md" style={{ background: 'var(--surface-soft)', color: 'var(--muted)' }}>Soon</span>
        )}
      </span>
      <span className="block muted text-xs leading-5 mt-1.5">{tool.description}</span>
    </>
  );

  if (tool.status === 'live') {
    return (
      <Link href={`/${tool.slug}`} className={`tool-card ${catClass}`}>
        {inner}
      </Link>
    );
  }
  return <div className={`tool-card ${catClass}`} style={{ opacity: 0.85 }}>{inner}</div>;
}
