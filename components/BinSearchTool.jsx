'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import * as Lucide from 'lucide-react';

const BRANDS = ['Visa', 'Mastercard', 'Maestro', 'Discover', 'American Express', 'Diners Club', 'JCB', 'China Union Pay'];
const COUNTRIES = ['United States', 'China', 'Russia', 'Canada', 'Denmark', 'United Kingdom', 'France', 'India', 'Brazil', 'Japan', 'Spain', 'Germany', 'Italy', 'Australia', 'Ukraine', 'South Korea', 'Poland', 'Mexico', 'Argentina', 'Turkey', 'Hong Kong', 'Norway', 'Colombia', 'Taiwan', 'Venezuela'];
const TYPES = ['Credit', 'Debit'];

export default function BinSearchTool() {
  const { data: session, status } = useSession();
  const [bank, setBank] = useState('');
  const [country, setCountry] = useState('');
  const [brand, setBrand] = useState('');
  const [type, setType] = useState('');
  const [results, setResults] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(null);
  const [error, setError] = useState('');

  async function search(toPage = 1) {
    setError('');
    if (!bank.trim() && !country && !brand && !type) { setError('Enter a bank name or pick a country, brand, or card type.'); return; }
    setRunning(true);
    try {
      const res = await fetch('/api/tools/bin-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bank, country, brand, type, page: toPage }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error);
        setRunning(false);
        if (data.needLogin) setResults(null);
        return;
      }
      setResults(data.results);
      setPage(data.page);
      setTotal(data.totalApprox);
      setHasMore(data.hasMore);
      if (typeof data.remaining === 'number') setRemaining(data.remaining);
    } catch (e) {
      setError('Network error.');
    }
    setRunning(false);
  }

  function downloadCsv() {
    if (!results?.length) return;
    const rows = [['BIN', 'Brand', 'Type', 'Bank', 'Country']];
    results.forEach((r) => rows.push([r.bin, r.brand, r.type, r.bank, r.country]));
    const csv = rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'craftora-bin-search.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (status === 'loading') {
    return <div className="border surface rounded-2xl p-8 text-center muted" style={{ background: 'var(--surface)' }}>Loading...</div>;
  }
  if (!session?.user) {
    return (
      <div className="border surface rounded-2xl p-8 text-center" style={{ background: 'var(--surface)' }}>
        <Lucide.Lock className="w-8 h-8 mx-auto mb-4 brand-text" />
        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>Sign in to search BINs</h3>
        <p className="muted text-sm mb-5 max-w-md mx-auto">A free account lets you search our database of over 340,000 BINs by bank, country, brand, or card type, up to 200 searches per day.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="rounded-xl px-5 py-2.5 font-bold text-sm" style={{ background: 'var(--brand)', color: '#fff' }}>Sign in</Link>
          <Link href="/signup" className="rounded-xl px-5 py-2.5 font-semibold text-sm border surface" style={{ color: 'var(--ink)' }}>Create account</Link>
        </div>
      </div>
    );
  }

  const inputCls = 'w-full rounded-lg border surface px-3 py-2.5 text-sm bg-transparent';

  return (
    <div>
      <div className="flex items-center justify-end mb-2">
        {remaining !== null && <span className="muted text-sm">{remaining >= 999999 ? 'Unlimited (admin)' : `${remaining} searches left today`}</span>}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="lg:col-span-1">
          <label className="block text-xs font-semibold mb-1.5 muted uppercase tracking-wide">Bank name</label>
          <input value={bank} onChange={(e) => setBank(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') search(1); }} placeholder="e.g. Chase" className={inputCls} style={{ color: 'var(--ink)' }} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5 muted uppercase tracking-wide">Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }}>
            <option value="">Any</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5 muted uppercase tracking-wide">Brand</label>
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }}>
            <option value="">Any</option>
            {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5 muted uppercase tracking-wide">Card type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }}>
            <option value="">Any</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => search(1)} disabled={running} className="rounded-xl px-6 py-3 font-bold text-sm inline-flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
          {running ? <><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Searching...</> : <><Lucide.Search className="w-4 h-4" /> Search BINs</>}
        </button>
        {results?.length > 0 && (
          <button onClick={downloadCsv} className="rounded-xl px-5 py-3 font-semibold text-sm border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}>
            <Lucide.Download className="w-4 h-4" /> Export page
          </button>
        )}
      </div>

      {error && <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#c98a13' }}>{error}</div>}

      {results && (
        <div className="mt-8">
          <p className="muted text-sm mb-3">
            {total === 0 ? 'No BINs found. Try a broader search.' : `Showing ${results.length} result${results.length === 1 ? '' : 's'}${total >= 5000 ? ' (5000+ matches, narrow your search)' : ` of about ${total}`}.`}
          </p>
          {results.length > 0 && (
            <>
              <div className="border surface rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'var(--surface-soft)' }}>
                      <th className="text-left font-bold px-4 py-2.5" style={{ color: 'var(--ink)' }}>BIN</th>
                      <th className="text-left font-bold px-4 py-2.5" style={{ color: 'var(--ink)' }}>Brand</th>
                      <th className="text-left font-bold px-4 py-2.5" style={{ color: 'var(--ink)' }}>Type</th>
                      <th className="text-left font-bold px-4 py-2.5" style={{ color: 'var(--ink)' }}>Bank</th>
                      <th className="text-left font-bold px-4 py-2.5" style={{ color: 'var(--ink)' }}>Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i} className="border-t surface">
                        <td className="px-4 py-2.5 font-mono" style={{ color: 'var(--ink)' }}>{r.bin}</td>
                        <td className="px-4 py-2.5" style={{ color: 'var(--ink)' }}>{r.brand || '-'}</td>
                        <td className="px-4 py-2.5" style={{ color: 'var(--ink)' }}>{r.type || '-'}</td>
                        <td className="px-4 py-2.5" style={{ color: 'var(--ink)' }}>{r.bank || '-'}</td>
                        <td className="px-4 py-2.5" style={{ color: 'var(--ink)' }}>{r.country || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(page > 1 || hasMore) && (
                <div className="flex items-center gap-3 mt-4">
                  <button onClick={() => search(page - 1)} disabled={page <= 1 || running} className="rounded-lg px-4 py-2 text-sm font-semibold border surface disabled:opacity-40" style={{ color: 'var(--ink)' }}>Previous</button>
                  <span className="muted text-sm">Page {page}</span>
                  <button onClick={() => search(page + 1)} disabled={!hasMore || running} className="rounded-lg px-4 py-2 text-sm font-semibold border surface disabled:opacity-40" style={{ color: 'var(--ink)' }}>Next</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <p className="muted text-xs mt-6">BIN data is from a public database. Use for development and verification only. BINs are not linked to any individual cardholder.</p>
    </div>
  );
}
