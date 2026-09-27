'use client';

import { useState, useMemo } from 'react';
import * as Lucide from 'lucide-react';

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function MetaTagGeneratorTool() {
  const [f, setF] = useState({
    title: '',
    description: '',
    url: '',
    image: '',
    author: '',
    keywords: '',
    twitter: 'summary_large_image',
    robots: 'index, follow',
  });
  const [copied, setCopied] = useState(false);

  function set(key, val) { setF((x) => ({ ...x, [key]: val })); }

  const output = useMemo(() => {
    const lines = [];
    if (f.title) {
      lines.push(`<title>${esc(f.title)}</title>`);
      lines.push(`<meta name="title" content="${esc(f.title)}">`);
    }
    if (f.description) lines.push(`<meta name="description" content="${esc(f.description)}">`);
    if (f.keywords) lines.push(`<meta name="keywords" content="${esc(f.keywords)}">`);
    if (f.author) lines.push(`<meta name="author" content="${esc(f.author)}">`);
    if (f.robots) lines.push(`<meta name="robots" content="${esc(f.robots)}">`);
    if (f.url) lines.push(`<link rel="canonical" href="${esc(f.url)}">`);

    lines.push('');
    lines.push('<!-- Open Graph / Facebook -->');
    lines.push('<meta property="og:type" content="website">');
    if (f.url) lines.push(`<meta property="og:url" content="${esc(f.url)}">`);
    if (f.title) lines.push(`<meta property="og:title" content="${esc(f.title)}">`);
    if (f.description) lines.push(`<meta property="og:description" content="${esc(f.description)}">`);
    if (f.image) lines.push(`<meta property="og:image" content="${esc(f.image)}">`);

    lines.push('');
    lines.push('<!-- Twitter -->');
    lines.push(`<meta name="twitter:card" content="${esc(f.twitter)}">`);
    if (f.url) lines.push(`<meta name="twitter:url" content="${esc(f.url)}">`);
    if (f.title) lines.push(`<meta name="twitter:title" content="${esc(f.title)}">`);
    if (f.description) lines.push(`<meta name="twitter:description" content="${esc(f.description)}">`);
    if (f.image) lines.push(`<meta name="twitter:image" content="${esc(f.image)}">`);

    return lines.join('\n');
  }, [f]);

  function copyOutput() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const titleLen = f.title.length;
  const descLen = f.description.length;

  const Field = ({ label, k, placeholder, hint, hintColor }) => (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{label}</label>
        {hint && <span className="text-xs" style={{ color: hintColor || 'var(--muted)' }}>{hint}</span>}
      </div>
      <input value={f[k]} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
    </div>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-4">
        <Field label="Page title" k="title" placeholder="Free Online Tools That Just Work" hint={`${titleLen}/60`} hintColor={titleLen > 60 ? '#b3261e' : 'var(--muted)'} />
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Description</label>
            <span className="text-xs" style={{ color: descLen > 160 ? '#b3261e' : 'var(--muted)' }}>{descLen}/160</span>
          </div>
          <textarea value={f.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="A short, compelling summary of the page." className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
        </div>
        <Field label="Page URL" k="url" placeholder="https://example.com/page" />
        <Field label="Image URL (for social preview)" k="image" placeholder="https://example.com/preview.jpg" />
        <Field label="Author" k="author" placeholder="Your name or brand" />
        <Field label="Keywords (comma separated)" k="keywords" placeholder="free tools, pdf, image" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Twitter card</label>
            <select value={f.twitter} onChange={(e) => set('twitter', e.target.value)} className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }}>
              <option value="summary_large_image">Large image</option>
              <option value="summary">Summary</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Robots</label>
            <select value={f.robots} onChange={(e) => set('robots', e.target.value)} className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }}>
              <option value="index, follow">index, follow</option>
              <option value="noindex, follow">noindex, follow</option>
              <option value="index, nofollow">index, nofollow</option>
              <option value="noindex, nofollow">noindex, nofollow</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Generated tags</label>
          <button onClick={copyOutput} className="text-sm font-semibold brand-text inline-flex items-center gap-1">
            {copied ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>
        <pre className="border surface rounded-xl p-4 text-xs leading-5 overflow-x-auto whitespace-pre-wrap break-all" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>{output}</pre>
        <p className="muted text-xs mt-3">Paste these tags inside the &lt;head&gt; section of your HTML page. Everything is generated in your browser.</p>
      </div>
    </div>
  );
}
