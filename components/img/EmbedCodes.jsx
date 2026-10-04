'use client';

import { useState } from 'react';
import * as Lucide from 'lucide-react';

const TABS = [['direct', 'Direct link'], ['page', 'Share page'], ['html', 'HTML'], ['markdown', 'Markdown'], ['bbcode', 'BBCode']];

export default function EmbedCodes({ urls }) {
  const [tab, setTab] = useState('direct');
  const [ok, setOk] = useState(false);
  const value = urls[tab];
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {TABS.map(([k, l]) => (
          <button key={k} type="button" onClick={() => { setTab(k); setOk(false); }} className="rounded-lg px-2.5 py-1 text-xs font-semibold border surface"
            style={tab === k ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>{l}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <input readOnly value={value} onFocus={(e) => e.target.select()} className="flex-1 min-w-0 rounded-lg border surface px-3 py-2 text-xs font-mono bg-transparent" style={{ color: 'var(--ink)' }} />
        <button type="button" onClick={() => navigator.clipboard.writeText(value).then(() => { setOk(true); setTimeout(() => setOk(false), 1500); })}
          className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold inline-flex items-center gap-1" style={{ background: 'var(--brand)', color: '#fff' }}>
          {ok ? <><Lucide.Check className="w-3.5 h-3.5" /> Copied</> : <><Lucide.Copy className="w-3.5 h-3.5" /> Copy</>}
        </button>
      </div>
    </div>
  );
}
