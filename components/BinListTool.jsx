'use client';

import { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';

export default function BinListTool() {
  const [summary, setSummary] = useState(null);
  const [view, setView] = useState('summary'); // 'summary' | 'list'
  const [drill, setDrill] = useState({ mode: '', value: '' });
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadSummary(); }, []);

  async function loadSummary() {
    setLoading(true);
    try {
      const res = await fetch('/api/tools/bin-list', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'summary' }),
      });
      const data = await res.json();
      if (data.ok) setSummary(data);
      else setError(data.error);
    } catch (e) { setError('Could not load data.'); }
    setLoading(false);
  }

  async function openList(mode, value, toPage = 1) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tools/bin-list', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, value, page: toPage }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error); setLoading(false); return; }
      setResults(data.results);
      setPage(data.page);
      setHasMore(data.hasMore);
      setDrill({ mode, value });
      setView('list');
    } catch (e) { setError('Network error.'); }
    setLoading(false);
  }

  function downloadCsv() {
    if (!results.length) return;
    const rows = [['BIN', 'Brand', 'Type', 'Bank', 'Country']];
    results.forEach((r) => rows.push([r.bin, r.brand, r.type, r.bank, r.country]));
    const csv = rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `bin-list-${drill.value}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (view === 'list') {
    return (
      <div>
        <button onClick={() => { setView('summary'); setError(''); }} className="text-sm font-semibold brand-text inline-flex items-center gap-1 mb-4"><Lucide.ArrowLeft className="w-4 h-4" /> Back to all BINs</button>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h2 className="font-extrabold text-xl" style={{ color: 'var(--ink)' }}>{drill.mode === 'brand' ? drill.value : drill.value} BINs</h2>
          {results.length > 0 && <button onClick={downloadCsv} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}><Lucide.Download className="w-4 h-4" /> Export page</button>}
        </div>

        {error && <div className="rounded-xl px-4 py-3 text-sm mb-4" style={{ background: 'var(--surface-soft)', color: '#c98a13' }}>{error}</div>}
        {loading ? (
          <div className="border surface rounded-xl p-8 text-center muted"><Lucide.Loader2 className="w-5 h-5 animate-spin inline" /></div>
        ) : (
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
                <button onClick={() => openList(drill.mode, drill.value, page - 1)} disabled={page <= 1} className="rounded-lg px-4 py-2 text-sm font-semibold border surface disabled:opacity-40" style={{ color: 'var(--ink)' }}>Previous</button>
                <span className="muted text-sm">Page {page}</span>
                <button onClick={() => openList(drill.mode, drill.value, page + 1)} disabled={!hasMore} className="rounded-lg px-4 py-2 text-sm font-semibold border surface disabled:opacity-40" style={{ color: 'var(--ink)' }}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      {error && <div className="rounded-xl px-4 py-3 text-sm mb-4" style={{ background: 'var(--surface-soft)', color: '#c98a13' }}>{error}</div>}
      {loading || !summary ? (
        <div className="border surface rounded-xl p-8 text-center muted"><Lucide.Loader2 className="w-5 h-5 animate-spin inline" /> Loading BIN directory...</div>
      ) : (
        <div>
          <section className="mb-8">
            <h2 className="font-extrabold text-xl mb-1" style={{ color: 'var(--ink)' }}>Browse BINs by card network</h2>
            <p className="muted text-sm mb-4">Click a network to see its BIN list.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {summary.brands.map((b) => (
                <button key={b.raw} onClick={() => openList('brand', b.raw)} className="border surface rounded-xl p-4 text-left" style={{ background: 'var(--surface)' }}>
                  <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{b.name}</p>
                  <p className="muted text-xs mt-0.5">{b.count.toLocaleString()} BINs</p>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-extrabold text-xl mb-1" style={{ color: 'var(--ink)' }}>Browse BINs by country</h2>
            <p className="muted text-sm mb-4">Click a country to see its BIN list.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {summary.countries.map((c) => (
                <button key={c.name} onClick={() => openList('country', c.name)} className="border surface rounded-xl p-4 text-left" style={{ background: 'var(--surface)' }}>
                  <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{c.name}</p>
                  <p className="muted text-xs mt-0.5">{c.count.toLocaleString()} BINs</p>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      <p className="muted text-xs mt-8">BIN data is from a public database and covers major issuers worldwide. For looking up a specific card, use the Card Validator. To search by bank name, use BIN Search.</p>
    </div>
  );
}
