'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import * as Lucide from 'lucide-react';

const BATCH = 100;

export default function BinCheckerTool() {
  const { data: session, status } = useSession();
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(null);
  const [error, setError] = useState('');

  function parseBins(text) {
    return [...new Set(text.split(/[\s,;]+/).map((s) => s.replace(/\D/g, '').slice(0, 8)).filter((b) => b.length >= 6))];
  }

  async function check() {
    setError('');
    const bins = parseBins(input);
    if (bins.length === 0) { setError('Paste at least one BIN (the first 6 to 8 digits of a card).'); return; }

    setRunning(true);
    setResults([]);
    const collected = [];

    for (let i = 0; i < bins.length; i += BATCH) {
      const batch = bins.slice(i, i + BATCH);
      try {
        const res = await fetch('/api/tools/bin-check-bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bins: batch }),
        });
        const data = await res.json();
        if (!data.ok) {
          setError(data.error);
          if (data.needLogin) { setRunning(false); return; }
          break;
        }
        collected.push(...data.results);
        setResults([...collected]);
        if (typeof data.remaining === 'number') setRemaining(data.remaining);
        if (data.skipped > 0) { setError('You have reached your daily limit. Some BINs were not checked.'); break; }
      } catch (e) {
        setError('Network error.');
        break;
      }
    }
    setRunning(false);
  }

  function downloadCsv() {
    const rows = [['BIN', 'Brand', 'Type', 'Bank', 'Country', 'Category']];
    results.forEach((r) => rows.push([r.bin, r.brand || '', r.type || '', r.bank || '', r.country || '', r.category || '']));
    const csv = rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'craftora-bin-lookup.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const foundCount = results.filter((r) => r.found).length;

  if (status === 'loading') {
    return <div className="border surface rounded-2xl p-8 text-center muted" style={{ background: 'var(--surface)' }}>Loading...</div>;
  }
  if (!session?.user) {
    return (
      <div className="border surface rounded-2xl p-8 text-center" style={{ background: 'var(--surface)' }}>
        <Lucide.Lock className="w-8 h-8 mx-auto mb-4 brand-text" />
        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>Sign in for bulk BIN lookup</h3>
        <p className="muted text-sm mb-5 max-w-md mx-auto">A free account lets you look up to 200 BINs per day in batches. For a single card, use the Card Validator (no signup needed).</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="rounded-xl px-5 py-2.5 font-bold text-sm" style={{ background: 'var(--brand)', color: '#fff' }}>Sign in</Link>
          <Link href="/card-validator" className="rounded-xl px-5 py-2.5 font-semibold text-sm border surface" style={{ color: 'var(--ink)' }}>Single card lookup</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Paste BINs or card numbers (one per line, or comma-separated)</label>
        {remaining !== null && <span className="muted text-sm">{remaining >= 999999 ? 'Unlimited (admin)' : `${remaining} lookups left today`}</span>}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={7}
        placeholder={"411111\n510510\n371449\n453201"}
        className="w-full border surface rounded-xl p-4 text-sm bg-transparent font-mono"
        style={{ color: 'var(--ink)' }}
      />
      <p className="muted text-xs mt-2">Only the first 6 to 8 digits (the BIN) are used. Full card numbers are trimmed automatically. Processed in batches of {BATCH}.</p>

      <div className="flex gap-3 mt-4">
        <button onClick={check} disabled={running} className="rounded-xl px-6 py-3 font-bold text-sm inline-flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
          {running ? <><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Looking up...</> : <><Lucide.Search className="w-4 h-4" /> Look up BINs</>}
        </button>
        {results.length > 0 && (
          <button onClick={downloadCsv} className="rounded-xl px-5 py-3 font-semibold text-sm border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}>
            <Lucide.Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      {error && <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#c98a13' }}>{error}</div>}

      {results.length > 0 && (
        <div className="mt-8">
          <p className="muted text-sm mb-3">{foundCount} of {results.length} BINs found in the database.</p>
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
                    {r.found ? (
                      <>
                        <td className="px-4 py-2.5" style={{ color: 'var(--ink)' }}>{r.brand || '-'}</td>
                        <td className="px-4 py-2.5" style={{ color: 'var(--ink)' }}>{r.type || '-'}</td>
                        <td className="px-4 py-2.5" style={{ color: 'var(--ink)' }}>{r.bank || '-'}</td>
                        <td className="px-4 py-2.5" style={{ color: 'var(--ink)' }}>{r.country || '-'}</td>
                      </>
                    ) : (
                      <td className="px-4 py-2.5 muted" colSpan={4}>Not in database</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="muted text-xs mt-6">BIN data is from a public database and covers most major issuers. Some smaller or regional BINs may not be listed. This is for development and verification use only.</p>
    </div>
  );
}
