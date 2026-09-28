'use client';

import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';
import RichEditor from './RichEditor';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function CharMeter({ value, min, max }) {
  const len = (value || '').length;
  let color = 'var(--muted)';
  let status = '';
  if (len === 0) { color = 'var(--muted)'; }
  else if (max && len > max) { color = '#b3261e'; status = 'too long'; }
  else if (min && len < min) { color = '#c98a13'; status = 'a bit short'; }
  else { color = 'var(--mint)'; status = 'good'; }
  return (
    <span className="text-xs font-semibold" style={{ color }}>
      {len}{max ? `/${max}` : ''} {status && `· ${status}`}
    </span>
  );
}

export default function ArticleEditor({ initial, onSaved, onCancel }) {
  const init = initial || {};
  // body may be legacy array (old posts) or HTML string (new). Normalize to string.
  const initialBody = typeof init.body === 'string' ? init.body : '';
  const [a, setA] = useState({
    id: init.id || null,
    title: init.title || '',
    slug: init.slug || '',
    metaTitle: init.meta_title || '',
    metaDescription: init.meta_description || '',
    focusKeyword: init.focus_keyword || '',
    excerpt: init.excerpt || '',
    author: init.author || 'Craftora',
    coverImage: init.cover_image || '',
    imageAlt: init.image_alt || '',
    publishedAt: init.published_at ? String(init.published_at).slice(0, 10) : today(),
    published: !!init.published,
    body: initialBody,
  });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  function set(k, v) { setA((x) => ({ ...x, [k]: v })); }

  async function uploadBanner(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg({ type: '', text: '' });
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.ok) setMsg({ type: 'error', text: data.error });
      else set('coverImage', data.url);
    } catch (e) { setMsg({ type: 'error', text: 'Upload failed.' }); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function save(publish) {
    setMsg({ type: '', text: '' });
    if (!a.title.trim()) { setMsg({ type: 'error', text: 'Title is required.' }); return; }
    if (publish && a.coverImage && !a.imageAlt.trim()) {
      setMsg({ type: 'error', text: 'Please add alt text for the banner image (needed for SEO).' });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...a, published: publish }),
      });
      const data = await res.json();
      if (!data.ok) { setMsg({ type: 'error', text: data.error }); setBusy(false); return; }
      onSaved(data);
    } catch (e) { setMsg({ type: 'error', text: 'Something went wrong.' }); }
    setBusy(false);
  }

  const inputCls = 'w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent';

  return (
    <div className="border surface rounded-2xl p-6" style={{ background: 'var(--surface)' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>{a.id ? 'Edit article' : 'New article'}</h2>
        <button onClick={onCancel} className="muted text-sm font-semibold inline-flex items-center gap-1"><Lucide.X className="w-4 h-4" /> Close</button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Title (H1 on the page)</label>
          <input value={a.title} onChange={(e) => set('title', e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }} placeholder="How to Merge PDF Files for Free (2026 Guide)" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>URL slug</label>
          <div className="flex items-center gap-2">
            <span className="muted text-sm shrink-0">/insights/</span>
            <input value={a.slug} onChange={(e) => set('slug', e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }} placeholder="auto-generated from title if left blank" />
          </div>
          <p className="muted text-xs mt-1.5">Keep it short and keyword-focused. Leave blank to auto-generate from the title.</p>
        </div>

        <div className="border surface rounded-xl p-4" style={{ background: 'var(--surface-soft)' }}>
          <p className="brand-text text-xs font-extrabold tracking-[.12em] uppercase mb-3">Search engine (SEO)</p>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Meta title (shows in Google)</label>
              <CharMeter value={a.metaTitle} max={60} />
            </div>
            <input value={a.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }} placeholder="Falls back to the title if left blank" />
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Meta description</label>
              <CharMeter value={a.metaDescription} min={120} max={160} />
            </div>
            <textarea value={a.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} rows={2} className={inputCls} style={{ color: 'var(--ink)' }} placeholder="A compelling 120-160 character summary for search results." />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Focus keyword (optional)</label>
            <input value={a.focusKeyword} onChange={(e) => set('focusKeyword', e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }} placeholder="e.g. merge pdf" />
            {a.focusKeyword && (
              <div className="flex flex-wrap gap-3 mt-2 text-xs">
                <Check label="in title" ok={a.title.toLowerCase().includes(a.focusKeyword.toLowerCase())} />
                <Check label="in meta description" ok={a.metaDescription.toLowerCase().includes(a.focusKeyword.toLowerCase())} />
                <Check label="in URL slug" ok={(a.slug || a.title).toLowerCase().includes(a.focusKeyword.toLowerCase())} />
                <Check label="in content" ok={a.body.toLowerCase().includes(a.focusKeyword.toLowerCase())} />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Banner image</label>
          {a.coverImage ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.coverImage} alt="Banner preview" className="w-full max-w-md rounded-xl border surface" />
              <button onClick={() => set('coverImage', '')} className="text-sm font-semibold" style={{ color: '#b3261e' }}>Remove image</button>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Image alt text (for SEO and accessibility)</label>
                <input value={a.imageAlt} onChange={(e) => set('imageAlt', e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }} placeholder="Describe the image in a few words" />
              </div>
            </div>
          ) : (
            <label className="rounded-xl px-4 py-3 text-sm font-semibold border surface inline-flex items-center gap-2 cursor-pointer" style={{ color: 'var(--ink)' }}>
              {uploading ? <><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Lucide.Upload className="w-4 h-4" /> Upload image</>}
              <input ref={fileRef} type="file" accept="image/*" onChange={uploadBanner} className="hidden" disabled={uploading} />
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Excerpt (short summary for listings)</label>
          <textarea value={a.excerpt} onChange={(e) => set('excerpt', e.target.value)} rows={2} className={inputCls} style={{ color: 'var(--ink)' }} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Author</label>
            <input value={a.author} onChange={(e) => set('author', e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Publish date</label>
            <input type="date" value={a.publishedAt} onChange={(e) => set('publishedAt', e.target.value)} className={inputCls} style={{ color: 'var(--ink)' }} />
          </div>
        </div>

        {/* The one rich editor box */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Article content</label>
          <RichEditor value={a.body} onChange={(html) => set('body', html)} />
        </div>

        {msg.text && <p className="text-sm" style={{ color: msg.type === 'error' ? '#b3261e' : 'var(--mint)' }}>{msg.text}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={() => save(true)} disabled={busy} className="rounded-xl px-6 py-2.5 font-bold text-sm disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
            {busy ? 'Saving...' : 'Publish'}
          </button>
          <button onClick={() => save(false)} disabled={busy} className="rounded-xl px-6 py-2.5 font-semibold text-sm border surface disabled:opacity-50" style={{ color: 'var(--ink)' }}>
            Save as draft
          </button>
        </div>
      </div>
    </div>
  );
}

function Check({ label, ok }) {
  return (
    <span className="inline-flex items-center gap-1" style={{ color: ok ? 'var(--mint)' : 'var(--muted)' }}>
      {ok ? <Lucide.CheckCircle2 className="w-3.5 h-3.5" /> : <Lucide.Circle className="w-3.5 h-3.5" />} {label}
    </span>
  );
}
