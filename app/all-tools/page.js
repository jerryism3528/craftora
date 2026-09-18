'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as Lucide from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { categories, tools } from '../../lib/tools';

function Icon({ name, className }) {
  const Cmp = Lucide[name] || Lucide.Wrench;
  return <Cmp className={className} />;
}

function ToolCard({ tool }) {
  const inner = (
    <>
      <span className="tool-icon"><Icon name={tool.icon} className="w-5 h-5" /></span>
      <span className="flex items-center gap-2 mt-5">
        <strong className="block text-sm" style={{ color: 'var(--ink)' }}>{tool.name}</strong>
        {tool.status !== 'live' && (
          <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md" style={{ background: 'var(--surface-soft)', color: 'var(--muted)' }}>Soon</span>
        )}
      </span>
      <span className="block muted text-xs leading-5 mt-1.5">{tool.description}</span>
    </>
  );
  return tool.status === 'live' ? (
    <Link href={`/${tool.slug}`} className={`tool-card category-${tool.category}`}>{inner}</Link>
  ) : (
    <div className={`tool-card category-${tool.category}`} style={{ opacity: 0.85 }}>{inner}</div>
  );
}

function AllToolsInner() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  // Pick up ?q= from the URL on load (from header search on other pages).
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((t) => {
      const matchCat = filter === 'All' || t.category === filter;
      const matchQuery =
        !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [query, filter]);

  return (
    <main className="editorial-width px-4 sm:px-7 py-12 sm:py-16">
      <nav aria-label="Breadcrumb" className="text-sm muted mb-9">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="px-2">/</span>
        <span>All Tools</span>
      </nav>

      <p className="brand-text text-xs font-extrabold tracking-[.16em] uppercase mb-3">Complete directory</p>
      <h1 className="font-extrabold tracking-tight text-4xl" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>All Tools</h1>
      <p className="muted mt-4 text-lg max-w-3xl">
        Browse every free Craftora tool for PDFs, images, file conversion, SEO, text, developers, and more. No signup, no watermarks.
      </p>

      {/* Search */}
      <div className="relative max-w-2xl mt-8">
        <Lucide.Search className="absolute left-4 top-4 w-5 h-5 muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border surface rounded-2xl pl-12 pr-4 py-4 shadow-sm bg-transparent"
          style={{ color: 'var(--ink)' }}
          type="search"
          placeholder="Search tools by name or purpose"
          aria-label="Search all tools"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mt-5">
        {['All', ...categories.map((c) => c.key)].map((key) => {
          const label = key === 'All' ? 'All' : categories.find((c) => c.key === key).name;
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="border surface rounded-full px-3 py-1.5 text-sm font-semibold"
              style={active ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className="muted text-sm mt-7">{visible.length} tool{visible.length === 1 ? '' : 's'} found</p>

      {/* Grouped results */}
      <div className="mt-6">
        {categories.map((cat) => {
          const subset = visible.filter((t) => t.category === cat.key);
          if (!subset.length) return null;
          return (
            <section key={cat.key} className="mb-14 pt-8 section-rule">
              <div className="mb-6">
                <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>{cat.name}</h2>
                <p className="muted text-sm mt-2 max-w-2xl">{cat.tagline}</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {subset.map((t) => <ToolCard key={t.slug} tool={t} />)}
              </div>
            </section>
          );
        })}
        {visible.length === 0 && (
          <p className="muted mt-10">No tools match your search. Try a different term.</p>
        )}
      </div>
    </main>
  );
}

export default function AllToolsPage() {
  return (
    <div>
      <Header />
      <Suspense fallback={<div className="editorial-width px-4 sm:px-7 py-16 muted">Loading tools...</div>}>
        <AllToolsInner />
      </Suspense>
      <Footer />
    </div>
  );
}
