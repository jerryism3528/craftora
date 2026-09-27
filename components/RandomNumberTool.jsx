'use client';

import { useState } from 'react';
import * as Lucide from 'lucide-react';

function secureInt(min, max) {
  const range = max - min + 1;
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return min + (arr[0] % range);
}

export default function RandomNumberTool() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [unique, setUnique] = useState(false);
  const [sort, setSort] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function generate() {
    setError('');
    setCopied(false);
    const lo = parseInt(min, 10);
    const hi = parseInt(max, 10);
    const n = Math.min(Math.max(parseInt(count, 10) || 1, 1), 1000);
    if (isNaN(lo) || isNaN(hi)) { setError('Enter valid numbers for the range.'); return; }
    if (lo > hi) { setError('The minimum cannot be greater than the maximum.'); return; }
    if (unique && n > hi - lo + 1) { setError(`Cannot pick ${n} unique numbers from a range of only ${hi - lo + 1}.`); return; }

    let list;
    if (unique) {
      const pool = [];
      for (let i = lo; i <= hi; i++) pool.push(i);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = secureInt(0, i);
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      list = pool.slice(0, n);
    } else {
      list = Array.from({ length: n }, () => secureInt(lo, hi));
    }
    if (sort) list.sort((a, b) => a - b);
    setResults(list);
  }

  function copyResults() {
    if (!results.length) return;
    navigator.clipboard.writeText(results.join(', ')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Minimum</label>
          <input type="number" value={min} onChange={(e) => setMin(e.target.value)} className="w-full rounded-xl border surface px-4 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Maximum</label>
          <input type="number" value={max} onChange={(e) => setMax(e.target.value)} className="w-full rounded-xl border surface px-4 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>How many</label>
          <input type="number" min="1" max="1000" value={count} onChange={(e) => setCount(e.target.value)} className="w-full rounded-xl border surface px-4 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
        </div>
      </div>

      <div className="flex flex-wrap gap-5 mt-4">
        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer" style={{ color: 'var(--ink)' }}>
          <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} /> No duplicates
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer" style={{ color: 'var(--ink)' }}>
          <input type="checkbox" checked={sort} onChange={(e) => setSort(e.target.checked)} /> Sort results
        </label>
      </div>

      <button onClick={generate} className="rounded-xl px-6 py-3 font-bold text-sm mt-5 inline-flex items-center gap-2" style={{ background: 'var(--brand)', color: '#fff' }}>
        <Lucide.Dice5 className="w-4 h-4" /> Generate
      </button>

      {error && <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#b3261e' }}>{error}</div>}

      {results.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{results.length} number{results.length === 1 ? '' : 's'}</span>
            <button onClick={copyResults} className="text-sm font-semibold brand-text inline-flex items-center gap-1">
              {copied ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>
          <div className="border surface rounded-xl p-5 flex flex-wrap gap-2" style={{ background: 'var(--surface)' }}>
            {results.map((n, i) => (
              <span key={i} className="rounded-lg px-3 py-1.5 text-sm font-mono font-bold" style={{ background: 'var(--surface-soft)', color: 'var(--brand)' }}>{n}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
