'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as Lucide from 'lucide-react';
import { categories } from '../lib/tools';

const DONATE_URL = 'https://www.gofundme.com/';

export default function Header() {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [query, setQuery] = useState('');
  const catRef = useRef(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    function onClick(e) {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function toggleTheme() {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('craftora-theme', next ? 'dark' : 'light'); } catch (e) {}
    setDark(next);
  }

  function submitSearch(e) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/all-tools?q=${encodeURIComponent(q)}` : '/all-tools');
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b surface" style={{ background: 'var(--surface)' }}>
      <div className="editorial-width px-4 sm:px-7 h-14 flex items-center gap-3">
        <Link href="/" className="font-extrabold tracking-tight text-lg shrink-0" style={{ color: 'var(--ink)' }}>Craftora</Link>
        <nav className="hidden lg:flex items-center gap-1 ml-4">
          <Link href="/all-tools" className="px-3 py-1.5 text-sm font-semibold rounded-lg hover:soft-surface" style={{ color: 'var(--ink)' }}>All Tools</Link>
          <div className="relative" ref={catRef}>
            <button onClick={() => setCatOpen((v) => !v)} className="px-3 py-1.5 text-sm font-semibold rounded-lg inline-flex items-center gap-1" style={{ color: 'var(--ink)' }} aria-expanded={catOpen} aria-haspopup="true">
              Categories
              <Lucide.ChevronDown className={`w-4 h-4 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
            </button>
            {catOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-2xl border surface shadow-card p-2 grid gap-0.5" style={{ background: 'var(--surface)' }}>
                {categories.map((c) => (
                  <Link key={c.key} href={`/${c.slug}`} onClick={() => setCatOpen(false)} className="px-3 py-2 rounded-lg text-sm font-semibold hover:soft-surface" style={{ color: 'var(--ink)' }}>
                    {c.name}
                    <span className="block text-xs font-normal muted mt-0.5">{c.tagline}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
 <Link href="/insights" className="px-3 py-1.5 text-sm font-semibold rounded-lg hover:soft-surface" style={{ color: 'var(--ink)' }}>Insights</Link>
 <Link href="/about" className="px-3 py-1.5 text-sm font-semibold rounded-lg hover:soft-surface" style={{ color: 'var(--ink)' }}>About</Link>
        </nav>
        <form onSubmit={submitSearch} className="ml-auto hidden md:block w-full max-w-xs">
          <div className="relative">
            <Lucide.Search className="absolute left-3 top-2.5 w-4 h-4 muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-lg border surface pl-9 pr-3 py-1.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} placeholder="Search tools" aria-label="Search tools" />
          </div>
        </form>
        <a href={DONATE_URL} target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold shrink-0" style={{ background: 'var(--brand)', color: '#ffffff' }}>
          <Lucide.Heart className="w-4 h-4" />
          Donate
        </a>
        <button onClick={toggleTheme} className="border surface rounded-lg w-9 h-9 inline-flex items-center justify-center shrink-0" style={{ color: 'var(--ink)' }} aria-label="Toggle dark mode">
          {dark ? <Lucide.Sun className="w-4 h-4" /> : <Lucide.Moon className="w-4 h-4" />}
        </button>
        <button onClick={() => setMobileOpen((v) => !v)} className="lg:hidden border surface rounded-lg w-9 h-9 inline-flex items-center justify-center shrink-0" style={{ color: 'var(--ink)' }} aria-label="Open menu" aria-expanded={mobileOpen}>
          {mobileOpen ? <Lucide.X className="w-4 h-4" /> : <Lucide.Menu className="w-4 h-4" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="lg:hidden border-t surface" style={{ background: 'var(--surface)' }}>
          <div className="editorial-width px-4 sm:px-7 py-4 space-y-4">
            <form onSubmit={submitSearch}>
              <div className="relative">
                <Lucide.Search className="absolute left-3 top-2.5 w-4 h-4 muted" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-lg border surface pl-9 pr-3 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} placeholder="Search tools" aria-label="Search tools" />
              </div>
            </form>
            <Link href="/all-tools" onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm font-semibold" style={{ color: 'var(--ink)' }}>All Tools</Link>
            <div>
              <p className="text-xs font-extrabold tracking-[.14em] uppercase brand-text mb-2">Categories</p>
              <div className="grid grid-cols-2 gap-1">
                {categories.map((c) => (
                  <Link key={c.key} href={`/${c.slug}`} onClick={() => setMobileOpen(false)} className="py-1.5 text-sm font-semibold" style={{ color: 'var(--ink)' }}>{c.name}</Link>
                ))}
              </div>
            </div>
            <Link href="/insights" onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm font-semibold" style={{ color: 'var(--ink)' }}>Insights</Link>
            <Link href="/about" onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm font-semibold" style={{ color: 'var(--ink)' }}>About</Link>
            <a href={DONATE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold" style={{ background: 'var(--brand)', color: '#ffffff' }}>
              <Lucide.Heart className="w-4 h-4" />
              Donate
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
