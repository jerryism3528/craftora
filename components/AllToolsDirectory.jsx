'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import * as Lucide from 'lucide-react';
import { categories, tools } from '../lib/tools';

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

// Renders the full directory on the server (so Google sees every tool link),
// then adds search and filters in the browser.
export default function AllToolsDirectory() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  // Pick up ?q= from the header search without useSearchParams,
  // which would turn the whole page into a client-only "Loading" shell.
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get('q');
      if (q) setQuery(q);
    } catch {}
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((t) => {
      const matchCat = filter === 'All' || t.category === filter;
      const matchQuery = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [query, filter]);

  return (
    <>
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

      <div className="flex flex-wrap gap-2 mt-5">
        {['All', ...categories.map((c) => c.key)].map((key) => {
          const label = key === 'All' ? 'All' : categories.find((c) => c.key === key).name;
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={active}
              className="border surface rounded-full px-3 py-1.5 text-sm font-semibold"
              style={active ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className="muted text-sm mt-7" aria-live="polite">{visible.length} tool{visible.length === 1 ? '' : 's'} found</p>

      <div className="mt-6">
        {categories.map((cat) => {
          const subset = visible.filter((t) => t.category === cat.key);
          if (!subset.length) return null;
          return (
            <section key={cat.key} id={cat.slug} className="mb-14 pt-8 section-rule" aria-labelledby={`h-${cat.key}`}>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 id={`h-${cat.key}`} className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>{cat.name}</h2>
                  <p className="muted text-sm mt-2 max-w-2xl">{cat.tagline}</p>
                </div>
                {cat.slug && (
                  <Link href={`/${cat.slug}`} className="brand-text text-sm font-bold hover:underline">
                    All {cat.name} <span aria-hidden="true">&rarr;</span>
                  </Link>
                )}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {subset.map((t) => <ToolCard key={t.slug} tool={t} />)}
              </div>
            </section>
          );
        })}
        {visible.length === 0 && <p className="muted mt-10">No tools match your search. Try a different term.</p>}
      </div>
    </>
  );
}
