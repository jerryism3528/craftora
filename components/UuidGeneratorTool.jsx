'use client';

import { useState } from 'react';
import * as Lucide from 'lucide-react';

function makeUuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  // Fallback for older browsers.
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0'));
  return `${h[0]}${h[1]}${h[2]}${h[3]}-${h[4]}${h[5]}-${h[6]}${h[7]}-${h[8]}${h[9]}-${h[10]}${h[11]}${h[12]}${h[13]}${h[14]}${h[15]}`;
}

export default function UuidGeneratorTool() {
  const [count, setCount] = useState(1);
  const [upper, setUpper] = useState(false);
  const [uuids, setUuids] = useState([]);
  const [copied, setCopied] = useState('');

  function generate() {
    const n = Math.min(Math.max(parseInt(count, 10) || 1, 1), 100);
    const list = Array.from({ length: n }, () => {
      const u = makeUuid();
      return upper ? u.toUpperCase() : u;
    });
    setUuids(list);
    setCopied('');
  }

  function copyOne(u) {
    navigator.clipboard.writeText(u).then(() => {
      setCopied(u);
      setTimeout(() => setCopied(''), 1500);
    });
  }

  function copyAll() {
    navigator.clipboard.writeText(uuids.join('\n')).then(() => {
      setCopied('all');
      setTimeout(() => setCopied(''), 2000);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>How many</label>
          <input type="number" min="1" max="100" value={count} onChange={(e) => setCount(e.target.value)} className="w-28 rounded-xl border surface px-4 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer pb-2" style={{ color: 'var(--ink)' }}>
          <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} /> Uppercase
        </label>
        <button onClick={generate} className="rounded-xl px-6 py-2.5 font-bold text-sm inline-flex items-center gap-2 mb-0.5" style={{ background: 'var(--brand)', color: '#fff' }}>
          <Lucide.RefreshCw className="w-4 h-4" /> Generate
        </button>
      </div>

      {uuids.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{uuids.length} UUID{uuids.length === 1 ? '' : 's'}</h3>
            {uuids.length > 1 && (
              <button onClick={copyAll} className="text-sm font-semibold brand-text inline-flex items-center gap-1">
                {copied === 'all' ? <><Lucide.Check className="w-4 h-4" /> Copied all</> : <><Lucide.Copy className="w-4 h-4" /> Copy all</>}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {uuids.map((u, i) => (
              <div key={i} className="flex items-center gap-3 border surface rounded-xl p-3" style={{ background: 'var(--surface)' }}>
                <p className="text-sm font-mono flex-1 min-w-0 break-all" style={{ color: 'var(--ink)' }}>{u}</p>
                <button onClick={() => copyOne(u)} className="text-sm font-semibold brand-text inline-flex items-center gap-1 shrink-0">
                  {copied === u ? <Lucide.Check className="w-4 h-4" /> : <Lucide.Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
