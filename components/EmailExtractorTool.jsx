'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import * as Lucide from 'lucide-react';

// Matches the shape of an email address.
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export default function EmailExtractorTool() {
  const [input, setInput] = useState('');
  const [sortAz, setSortAz] = useState(false);
  const [lowercase, setLowercase] = useState(true);
  const [copied, setCopied] = useState(false);

  const emails = useMemo(() => {
    if (!input.trim()) return [];
    let found = input.match(EMAIL_RE) || [];
    if (lowercase) found = found.map((e) => e.toLowerCase());
    found = [...new Set(found)]; // dedupe
    if (sortAz) found = found.sort((a, b) => a.localeCompare(b));
    return found;
  }, [input, sortAz, lowercase]);

  function copyAll() {
    if (!emails.length) return;
    navigator.clipboard.writeText(emails.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function download(type) {
    let content, name, mime;
    if (type === 'csv') {
      content = 'Email\n' + emails.map((e) => `"${e}"`).join('\n');
      name = 'emails.csv'; mime = 'text/csv';
    } else {
      content = emails.join('\n');
      name = 'emails.txt'; mime = 'text/plain';
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Paste your text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={14}
            placeholder="Paste any text, list, or content that contains email addresses..."
            className="w-full border surface rounded-xl p-4 text-sm bg-transparent"
            style={{ color: 'var(--ink)' }}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
              {emails.length} email{emails.length === 1 ? '' : 's'} found
            </label>
            {emails.length > 0 && (
              <div className="flex gap-3">
                <button onClick={copyAll} className="text-sm font-semibold brand-text inline-flex items-center gap-1">
                  {copied ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy all</>}
                </button>
                <button onClick={() => download('txt')} className="text-sm font-semibold brand-text inline-flex items-center gap-1"><Lucide.Download className="w-4 h-4" /> TXT</button>
                <button onClick={() => download('csv')} className="text-sm font-semibold brand-text inline-flex items-center gap-1"><Lucide.Download className="w-4 h-4" /> CSV</button>
              </div>
            )}
          </div>
          <div className="w-full border surface rounded-xl p-4 bg-transparent overflow-y-auto" style={{ height: '332px' }}>
            {emails.length === 0 ? (
              <p className="muted text-sm">Extracted emails will appear here.</p>
            ) : (
              <div className="space-y-1">
                {emails.map((e, i) => (
                  <p key={i} className="text-sm font-mono" style={{ color: 'var(--ink)' }}>{e}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-5 mt-4">
        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer" style={{ color: 'var(--ink)' }}>
          <input type="checkbox" checked={lowercase} onChange={(e) => setLowercase(e.target.checked)} /> Lowercase all
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer" style={{ color: 'var(--ink)' }}>
          <input type="checkbox" checked={sortAz} onChange={(e) => setSortAz(e.target.checked)} /> Sort A to Z
        </label>
        {input && <button onClick={() => setInput('')} className="text-sm font-semibold muted inline-flex items-center gap-1"><Lucide.Trash2 className="w-4 h-4" /> Clear</button>}
      </div>

      {emails.length > 0 && (
        <div className="mt-4 rounded-xl px-4 py-3 text-sm flex items-center gap-2" style={{ background: 'var(--surface-soft)', color: 'var(--ink)' }}>
          <Lucide.Lightbulb className="w-4 h-4 shrink-0 brand-text" />
          <span>Got your list? <Link href="/bulk-email-verifier" className="brand-text font-semibold">Verify these emails</Link> to see which are valid before you send.</span>
        </div>
      )}

      {/* Extension promo (URL extraction coming soon) */}
      <div className="mt-8 border surface rounded-2xl p-6" style={{ background: 'var(--surface)' }}>
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--surface-soft)', color: 'var(--brand)' }}>
            <Lucide.Chrome className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-base" style={{ color: 'var(--ink)' }}>Extract emails from any website</h3>
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md" style={{ background: 'var(--brand)', color: '#fff' }}>Soon</span>
            </div>
            <p className="muted text-sm leading-6">Want to pull emails straight from a URL or a whole web page while you browse? The free Craftora Chrome extension is coming soon. It scans the page you are on and extracts every email in one click, no copy-pasting.</p>
          </div>
        </div>
      </div>

      <p className="muted text-xs mt-6">Extraction runs entirely in your browser. Your text is never uploaded. Use extracted emails responsibly and only when you have the right to.</p>
    </div>
  );
}
