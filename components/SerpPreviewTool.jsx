'use client';

import { useState } from 'react';
import * as Lucide from 'lucide-react';

// Rough pixel-width estimate for truncation (Google truncates by pixels, not chars).
function pixelWidth(text, size) {
  // Average char width factor for Arial-like fonts.
  let w = 0;
  for (const ch of text) {
    if ('iIl.,:;\'|!'.includes(ch)) w += size * 0.28;
    else if ('mwMW'.includes(ch)) w += size * 0.85;
    else if (ch === ' ') w += size * 0.28;
    else w += size * 0.52;
  }
  return Math.round(w);
}

function truncate(text, maxPx, size) {
  if (pixelWidth(text, size) <= maxPx) return text;
  let out = text;
  while (out.length && pixelWidth(out + '...', size) > maxPx) out = out.slice(0, -1);
  return out.trimEnd() + '...';
}

export default function SerpPreviewTool() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [device, setDevice] = useState('desktop');

  const isMobile = device === 'mobile';
  const titleMaxPx = isMobile ? 460 : 600;
  const descMaxPx = isMobile ? 460 : 920;
  const titleSize = 20;
  const descSize = 14;

  const displayTitle = title || 'Your page title appears here';
  const displayUrl = url || 'https://example.com/page';
  const displayDesc = desc || 'Your meta description appears here. Write a short, compelling summary of the page so it reads well in Google search results.';

  const titlePx = pixelWidth(displayTitle, titleSize);
  const descPx = pixelWidth(displayDesc, descSize);
  const titleCut = titlePx > titleMaxPx;
  const descCut = descPx > descMaxPx;

  let breadcrumb = displayUrl;
  try {
    const u = new URL(displayUrl.startsWith('http') ? displayUrl : 'https://' + displayUrl);
    const parts = u.pathname.split('/').filter(Boolean);
    breadcrumb = u.hostname + (parts.length ? ' › ' + parts.join(' › ') : '');
  } catch (e) {}

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setDevice('desktop')} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={device === 'desktop' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}><Lucide.Monitor className="w-4 h-4" /> Desktop</button>
        <button onClick={() => setDevice('mobile')} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={device === 'mobile' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}><Lucide.Smartphone className="w-4 h-4" /> Mobile</button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Title</label>
              <span className="text-xs" style={{ color: titleCut ? '#b3261e' : 'var(--muted)' }}>{titlePx}px / {titleMaxPx}px</span>
            </div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your page title" className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>URL</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/page" className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Meta description</label>
              <span className="text-xs" style={{ color: descCut ? '#b3261e' : 'var(--muted)' }}>{desc.length} chars</span>
            </div>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="Your meta description" className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
          </div>
          {(titleCut || descCut) && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: 'var(--ink)' }}>
              {titleCut && <p>Your title may be cut off in {device} results. Shorten it a little.</p>}
              {descCut && <p>Your description may be cut off in {device} results. Trim it to keep the key message visible.</p>}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Google preview</label>
          <div className="border surface rounded-xl p-5" style={{ background: '#ffffff', maxWidth: isMobile ? 380 : '100%' }}>
            <div style={{ fontFamily: 'Arial, sans-serif' }}>
              <div style={{ fontSize: 12, color: '#4d5156', marginBottom: 3 }}>{breadcrumb}</div>
              <div style={{ fontSize: 20, color: '#1a0dab', lineHeight: 1.3, marginBottom: 3 }}>{truncate(displayTitle, titleMaxPx, titleSize)}</div>
              <div style={{ fontSize: 14, color: '#4d5156', lineHeight: 1.5 }}>{truncate(displayDesc, descMaxPx, descSize)}</div>
            </div>
          </div>
          <p className="muted text-xs mt-3">This is an approximation. Google may rewrite titles and descriptions. Everything runs in your browser.</p>
        </div>
      </div>
    </div>
  );
}
