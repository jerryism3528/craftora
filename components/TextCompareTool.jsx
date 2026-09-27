'use client';

import { useState } from 'react';
import * as Lucide from 'lucide-react';

// Line-based LCS diff, self-contained.
function diffLines(a, b) {
  const A = a.split('\n');
  const B = b.split('\n');
  const n = A.length, m = B.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push({ type: 'same', text: A[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ type: 'del', text: A[i] }); i++; }
    else { out.push({ type: 'add', text: B[j] }); j++; }
  }
  while (i < n) { out.push({ type: 'del', text: A[i] }); i++; }
  while (j < m) { out.push({ type: 'add', text: B[j] }); j++; }
  return out;
}

export default function TextCompareTool() {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [diff, setDiff] = useState(null);

  function compare() {
    if (!left && !right) { setDiff(null); return; }
    setDiff(diffLines(left, right));
  }

  function clearAll() {
    setLeft(''); setRight(''); setDiff(null);
  }

  const stats = diff ? {
    added: diff.filter((d) => d.type === 'add').length,
    removed: diff.filter((d) => d.type === 'del').length,
  } : null;

  return (
    <div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Original text</label>
          <textarea value={left} onChange={(e) => setLeft(e.target.value)} rows={10} placeholder="Paste the first version here" className="w-full border surface rounded-xl p-4 text-sm bg-transparent font-mono leading-6" style={{ color: 'var(--ink)' }} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Changed text</label>
          <textarea value={right} onChange={(e) => setRight(e.target.value)} rows={10} placeholder="Paste the second version here" className="w-full border surface rounded-xl p-4 text-sm bg-transparent font-mono leading-6" style={{ color: 'var(--ink)' }} />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={compare} className="rounded-xl px-6 py-2.5 font-bold text-sm inline-flex items-center gap-2" style={{ background: 'var(--brand)', color: '#fff' }}>
          <Lucide.GitCompare className="w-4 h-4" /> Compare
        </button>
        <button onClick={clearAll} className="rounded-xl px-4 py-2.5 font-semibold text-sm border surface" style={{ color: 'var(--ink)' }}>Clear</button>
      </div>

      {diff && (
        <div className="mt-6">
          <div className="flex gap-4 text-sm mb-3">
            <span className="font-semibold" style={{ color: 'var(--mint)' }}>+{stats.added} added</span>
            <span className="font-semibold" style={{ color: '#b3261e' }}>-{stats.removed} removed</span>
          </div>
          <div className="border surface rounded-xl overflow-hidden font-mono text-sm">
            {diff.map((d, i) => {
              const bg = d.type === 'add' ? 'rgba(24,124,111,0.12)' : d.type === 'del' ? 'rgba(179,38,30,0.10)' : 'transparent';
              const sign = d.type === 'add' ? '+' : d.type === 'del' ? '-' : ' ';
              const color = d.type === 'add' ? 'var(--mint)' : d.type === 'del' ? '#b3261e' : 'var(--ink)';
              return (
                <div key={i} className="flex gap-3 px-4 py-1" style={{ background: bg }}>
                  <span className="select-none shrink-0" style={{ color, opacity: 0.7 }}>{sign}</span>
                  <span className="whitespace-pre-wrap break-all" style={{ color: d.type === 'same' ? 'var(--ink)' : color }}>{d.text || ' '}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
