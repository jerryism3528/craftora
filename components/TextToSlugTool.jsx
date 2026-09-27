'use client';

import { useState, useMemo } from 'react';
import * as Lucide from 'lucide-react';

function slugify(text, sep) {
  return text
    .normalize('NFKD')                    // split accented chars
    .replace(/[\u0300-\u036f]/g, '')      // strip accent marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')         // remove non-alphanumeric
    .replace(/[\s-]+/g, sep)              // collapse spaces/dashes to separator
    .replace(new RegExp(`^${sep}+|${sep}+$`, 'g'), ''); // trim leading/trailing
}

export default function TextToSlugTool() {
  const [text, setText] = useState('');
  const [sep, setSep] = useState('-');
  const [copied, setCopied] = useState(false);

  const slug = useMemo(() => slugify(text, sep), [text, sep]);

  function copySlug() {
    if (!slug) return;
    navigator.clipboard.writeText(slug).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Your text</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="e.g. How to Merge PDF Files (Free Guide)"
        className="w-full border surface rounded-xl p-4 text-sm bg-transparent leading-6"
        style={{ color: 'var(--ink)' }}
      />

      <div className="mt-4">
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Separator</label>
        <div className="flex gap-2">
          <button onClick={() => setSep('-')} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={sep === '-' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>Hyphen (-)</button>
          <button onClick={() => setSep('_')} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={sep === '_' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>Underscore (_)</button>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>URL slug</label>
          {slug && (
            <button onClick={copySlug} className="text-sm font-semibold brand-text inline-flex items-center gap-1">
              {copied ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy</>}
            </button>
          )}
        </div>
        <div className="border surface rounded-xl p-4 text-sm font-mono break-all min-h-[3rem] flex items-center" style={{ color: slug ? 'var(--ink)' : 'var(--muted)', background: 'var(--surface)' }}>
          {slug || 'your-slug-appears-here'}
        </div>
      </div>
    </div>
  );
}
