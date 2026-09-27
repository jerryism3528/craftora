'use client';

import { useState, useMemo } from 'react';
import * as Lucide from 'lucide-react';

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function OpenGraphTool() {
  const [f, setF] = useState({ title: '', description: '', url: '', image: '', siteName: '', type: 'website' });
  const [copied, setCopied] = useState(false);

  function set(k, v) { setF((x) => ({ ...x, [k]: v })); }

  const output = useMemo(() => {
    const l = [];
    l.push('<!-- Open Graph / Facebook / LinkedIn -->');
    l.push(`<meta property="og:type" content="${esc(f.type)}">`);
    if (f.url) l.push(`<meta property="og:url" content="${esc(f.url)}">`);
    if (f.title) l.push(`<meta property="og:title" content="${esc(f.title)}">`);
    if (f.description) l.push(`<meta property="og:description" content="${esc(f.description)}">`);
    if (f.image) l.push(`<meta property="og:image" content="${esc(f.image)}">`);
    if (f.siteName) l.push(`<meta property="og:site_name" content="${esc(f.siteName)}">`);
    l.push('');
    l.push('<!-- Twitter -->');
    l.push('<meta name="twitter:card" content="summary_large_image">');
    if (f.title) l.push(`<meta name="twitter:title" content="${esc(f.title)}">`);
    if (f.description) l.push(`<meta name="twitter:description" content="${esc(f.description)}">`);
    if (f.image) l.push(`<meta name="twitter:image" content="${esc(f.image)}">`);
    return l.join('\n');
  }, [f]);

  function copyOutput() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  let domain = '';
  try { domain = new URL(f.url.startsWith('http') ? f.url : 'https://' + f.url).hostname; } catch (e) { domain = f.url; }

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Title</label>
          <input value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Your page or article title" className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Description</label>
          <textarea value={f.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="A short summary shown under the title" className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Page URL</label>
          <input value={f.url} onChange={(e) => set('url', e.target.value)} placeholder="https://example.com/page" className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Image URL (1200 x 630 recommended)</label>
          <input value={f.image} onChange={(e) => set('image', e.target.value)} placeholder="https://example.com/preview.jpg" className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Site name</label>
            <input value={f.siteName} onChange={(e) => set('siteName', e.target.value)} placeholder="Your brand" className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Type</label>
            <select value={f.type} onChange={(e) => set('type', e.target.value)} className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }}>
              <option value="website">website</option>
              <option value="article">article</option>
              <option value="product">product</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Social preview</label>
        <div className="border surface rounded-xl overflow-hidden mb-5" style={{ background: '#ffffff' }}>
          <div style={{ width: '100%', aspectRatio: '1200/630', background: '#e6e8ee', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {f.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <span style={{ color: '#9aa0ac', fontSize: 13 }}>Preview image</span>
            )}
          </div>
          <div style={{ padding: '10px 12px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
            <div style={{ fontSize: 11, color: '#606770', textTransform: 'uppercase' }}>{domain || 'example.com'}</div>
            <div style={{ fontSize: 15, color: '#1d2129', fontWeight: 600, marginTop: 2 }}>{f.title || 'Your title appears here'}</div>
            <div style={{ fontSize: 13, color: '#606770', marginTop: 2 }}>{f.description || 'Your description appears here.'}</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Generated tags</label>
          <button onClick={copyOutput} className="text-sm font-semibold brand-text inline-flex items-center gap-1">
            {copied ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>
        <pre className="border surface rounded-xl p-4 text-xs leading-5 overflow-x-auto whitespace-pre-wrap break-all" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>{output}</pre>
      </div>
    </div>
  );
}
