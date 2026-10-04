'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import * as Lucide from 'lucide-react';
import EmbedCodes from './img/EmbedCodes';

const MAX_MB = 6;
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const EXPLORE = 'https://img.' + 'craftora.dev/explore';

export default function ImageHostTool() {
  const { data: session, status } = useSession();
  const [mine, setMine] = useState([]);
  const [max, setMax] = useState(10);
  const [files, setFiles] = useState([]);
  const [pct, setPct] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState([]);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);
  const isAdmin = !!session?.user?.isAdmin;
  const left = isAdmin ? 99 : Math.max(0, max - mine.length);

  async function load() {
    try { const r = await fetch('/api/images'); const d = await r.json(); if (d.ok) { setMine(d.images); setMax(d.max); } } catch (e) {}
  }
  useEffect(() => { if (session?.user) load(); }, [session?.user]);

  function pick(list) {
    setError(''); setNotes([]);
    const arr = Array.from(list || []);
    const bad = [];
    const ok = arr.filter((f) => {
      if (!TYPES.includes(f.type)) { bad.push(`${f.name}: not a JPG, PNG, WebP, or GIF`); return false; }
      if (f.size > MAX_MB * 1024 * 1024) { bad.push(`${f.name}: larger than ${MAX_MB} MB`); return false; }
      return true;
    });
    if (ok.length > left) bad.push(`Only ${left} more image${left === 1 ? '' : 's'} allowed on your account right now.`);
    setFiles(ok.slice(0, left));
    setNotes(bad);
  }

  function upload() {
    if (!files.length) return;
    setError(''); setResults([]); setPct(0);
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/images');
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) setPct(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      let d = null;
      try { d = JSON.parse(xhr.responseText); } catch (e) {}
      setPct(null);
      if (d?.ok) { setResults(d.images); setNotes(d.errors || []); setFiles([]); if (inputRef.current) inputRef.current.value = ''; load(); }
      else setError(d?.error || 'Upload failed. Please try again.');
    };
    xhr.onerror = () => { setPct(null); setError('Network error during upload.'); };
    xhr.send(fd);
  }

  async function remove(id) {
    if (!confirm('Delete this image? Its links will stop working.')) return;
    await fetch(`/api/images?id=${id}`, { method: 'DELETE' });
    setResults((r) => r.filter((x) => x.id !== id));
    load();
  }

  if (status === 'loading') {
    return <div className="border surface rounded-2xl p-8 text-center muted" style={{ background: 'var(--surface)' }}>Loading...</div>;
  }
  if (!session?.user) {
    return (
      <div className="border surface rounded-2xl p-8 text-center" style={{ background: 'var(--surface)' }}>
        <Lucide.ImageUp className="w-8 h-8 mx-auto mb-4 brand-text" />
        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>Sign in to upload images</h3>
        <p className="muted text-sm mb-5 max-w-md mx-auto">A free account lets you host up to {max} images and get a direct link, share page, HTML, Markdown, and BBCode for each.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="rounded-xl px-5 py-2.5 font-bold text-sm" style={{ background: 'var(--brand)', color: '#fff' }}>Sign in</Link>
          <Link href="/signup" className="rounded-xl px-5 py-2.5 font-semibold text-sm border surface" style={{ color: 'var(--ink)' }}>Create account</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{isAdmin ? 'Unlimited (admin)' : `${mine.length} / ${max} images used`}</p>
        <a href={EXPLORE} className="text-sm font-semibold brand-text inline-flex items-center gap-1"><Lucide.LayoutGrid className="w-4 h-4" /> Explore images</a>
      </div>

      {left > 0 ? (
        <label
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files); }}
          className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer text-center"
          style={{ background: 'var(--surface)', borderColor: drag ? 'var(--brand)' : 'var(--line, #d6d9e6)' }}
        >
          <Lucide.ImageUp className="w-10 h-10 mb-3 brand-text" />
          <span className="font-bold" style={{ color: 'var(--ink)' }}>Choose images or drop them here</span>
          <span className="muted text-sm mt-1">JPG, PNG, WebP, or GIF, up to {MAX_MB} MB each</span>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(e) => pick(e.target.files)} className="hidden" />
        </label>
      ) : (
        <div className="rounded-2xl p-6 text-center border surface" style={{ background: 'var(--surface)' }}>
          <p className="font-bold" style={{ color: 'var(--ink)' }}>You've reached {max} images</p>
          <p className="muted text-sm mt-1">Delete an image below to upload a new one.</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 border surface rounded-2xl p-4" style={{ background: 'var(--surface)' }}>
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>{files.length} image{files.length === 1 ? '' : 's'} ready</p>
          <ul className="text-xs muted space-y-1 mb-4">{files.map((f) => <li key={f.name + f.size}>{f.name} ({(f.size / 1048576).toFixed(1)} MB)</li>)}</ul>
          {pct === null ? (
            <button onClick={upload} className="w-full rounded-xl px-6 py-3 font-bold text-sm inline-flex items-center justify-center gap-2" style={{ background: 'var(--brand)', color: '#fff' }}>
              <Lucide.Upload className="w-4 h-4" /> Upload and get links
            </button>
          ) : (
            <div>
              <div className="flex justify-between text-sm mb-2"><span className="font-semibold" style={{ color: 'var(--ink)' }}>{pct < 100 ? `Uploading ${pct}%` : 'Optimizing...'}</span><span className="font-bold brand-text">{pct}%</span></div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--surface-soft)' }}><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--brand)' }} /></div>
            </div>
          )}
          <p className="muted text-xs mt-3">Uploaded images are public: anyone with the link can see them, and they appear on the Explore page. Don't upload private photos.</p>
        </div>
      )}

      {notes.length > 0 && <div className="mt-4 rounded-xl px-4 py-3 text-xs space-y-1" style={{ background: 'var(--surface-soft)', color: '#c98a13' }}>{notes.map((n) => <p key={n}>{n}</p>)}</div>}
      {error && <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#e5484d' }}>{error}</div>}

      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          {results.map((r) => (
            <div key={r.id} className="border surface rounded-2xl p-4 flex flex-col sm:flex-row gap-4" style={{ background: 'var(--surface)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.direct} alt="" className="w-full sm:w-32 h-32 object-cover rounded-xl shrink-0" style={{ background: 'var(--surface-soft)' }} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm mb-2 truncate" style={{ color: 'var(--ink)' }}><Lucide.CircleCheck className="w-4 h-4 inline mr-1" style={{ color: '#0f9d76' }} />{r.original_name}</p>
                <EmbedCodes urls={r} />
              </div>
            </div>
          ))}
        </div>
      )}

      {mine.length > 0 && (
        <div className="mt-10">
          <h3 className="font-extrabold text-lg mb-3" style={{ color: 'var(--ink)' }}>My images</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {mine.map((m) => (
              <div key={m.id} className="border surface rounded-xl overflow-hidden" style={{ background: 'var(--surface)' }}>
                <a href={m.page} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.direct} alt="" className="w-full h-28 object-cover" style={{ background: 'var(--surface-soft)' }} />
                </a>
                <div className="p-2">
                  <p className="text-xs muted">{m.views} views · {m.days_left} days left</p>
                  <div className="flex gap-1.5 mt-1.5">
                    <button onClick={() => navigator.clipboard.writeText(m.direct)} className="flex-1 rounded-md px-2 py-1 text-[11px] font-bold border surface" style={{ color: 'var(--ink)' }}>Copy link</button>
                    <button onClick={() => remove(m.id)} className="rounded-md px-2 py-1 border surface" title="Delete" style={{ color: '#e5484d' }}><Lucide.Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
