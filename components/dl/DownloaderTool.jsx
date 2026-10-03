'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as Lucide from 'lucide-react';
import PlatformIcon from './PlatformIcon';

function dur(s) {
  if (!s && s !== 0) return '';
  s = Math.round(s);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
function fileBase(t) {
  return (t || 'video').replace(/[^\w\s-]+/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'video';
}

export default function DownloaderTool({ item = null, liveList = [] }) {
  const live = item ? item.live : true;
  const [url, setUrl] = useState('');
  const [info, setInfo] = useState(null);
  const [busy, setBusy] = useState('');
  const [pct, setPct] = useState(null);
  const [error, setError] = useState('');
  const [kind, setKind] = useState(item?.mode === 'audio' ? 'audio' : 'video');
  const [height, setHeight] = useState(1080);
  const [done, setDone] = useState(false);

  async function paste() {
    try { const t = await navigator.clipboard.readText(); if (t) setUrl(t.trim()); } catch (e) {}
  }

  async function fetchInfo() {
    setError(''); setInfo(null); setDone(false);
    if (!url.trim()) { setError('Paste a link first.'); return; }
    setBusy('info');
    try {
      const res = await fetch('/api/dl/info', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url.trim() }) });
      const data = await res.json();
      if (!data.ok) setError(data.error || 'Could not fetch this link.');
      else {
        setInfo(data);
        const best = (data.heights || []).find((h) => h <= 1080);
        setHeight(best || 1080);
      }
    } catch (e) { setError('Network error. Please try again.'); }
    setBusy('');
  }

  async function download() {
    setError(''); setDone(false); setBusy('download'); setPct(null);
    try {
      const res = await fetch('/api/dl/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url.trim(), kind, height }) });
      const type = res.headers.get('content-type') || '';
      if (!res.ok || type.includes('application/json')) {
        let msg = 'Download failed. Please try again.';
        try { const d = await res.json(); if (d.error) msg = d.error; } catch (e) {}
        setError(msg); setBusy(''); return;
      }
      const total = Number(res.headers.get('content-length')) || 0;
      const reader = res.body.getReader();
      const chunks = [];
      let got = 0;
      setPct(0);
      while (true) {
        const { done: end, value } = await reader.read();
        if (end) break;
        chunks.push(value);
        got += value.length;
        if (total) setPct(Math.round((got / total) * 100));
      }
      const blob = new Blob(chunks, { type });
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = `${fileBase(info?.title)}-craftora.${kind === 'audio' ? 'mp3' : 'mp4'}`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 5000);
      setDone(true);
    } catch (e) { setError('Network error during download. Please try again.'); }
    setBusy(''); setPct(null);
  }

  if (!live) {
    return (
      <div className="border surface rounded-2xl p-6" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center gap-3 mb-3">
          <PlatformIcon item={item} size={40} />
          <div>
            <p className="font-extrabold" style={{ color: 'var(--ink)' }}>{item.name} is coming soon</p>
            <p className="muted text-sm">We are working on {item.brand} support. Meanwhile, these downloaders work right now:</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {liveList.map((d) => (
            <Link key={d.slug} href={`/${d.slug}`} className="rounded-lg px-3 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}>
              <PlatformIcon item={d} size={22} /> {d.name}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="border surface rounded-2xl p-3 flex flex-col sm:flex-row gap-2" style={{ background: 'var(--surface)' }}>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Lucide.Link className="w-5 h-5 muted shrink-0 ml-2" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchInfo(); }}
            placeholder={item ? `Paste ${item.brand} link here` : 'Paste a TikTok, Instagram, Facebook, X, or Dailymotion link'}
            className="w-full min-w-0 bg-transparent py-3 text-sm outline-none"
            style={{ color: 'var(--ink)' }}
            inputMode="url"
          />
          <button onClick={paste} type="button" className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold border surface inline-flex items-center gap-1" style={{ color: 'var(--ink)' }}>
            <Lucide.ClipboardPaste className="w-4 h-4" /> Paste
          </button>
        </div>
        <button onClick={fetchInfo} disabled={busy !== ''} className="rounded-xl px-6 py-3 font-bold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: 'var(--brand)', color: '#fff' }}>
          {busy === 'info' ? <><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Checking...</> : <><Lucide.Search className="w-4 h-4" /> Get video</>}
        </button>
      </div>

      {error && <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#e5484d' }}>{error}</div>}

      {info && (
        <div className="mt-5 border surface rounded-2xl p-5" style={{ background: 'var(--surface)' }}>
          <div className="flex gap-4">
            {info.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={info.thumbnail} alt="" referrerPolicy="no-referrer" className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-xl shrink-0" style={{ background: 'var(--surface-soft)' }} />
            ) : (
              <div className="w-28 h-28 rounded-xl shrink-0 flex items-center justify-center" style={{ background: 'var(--surface-soft)' }}><Lucide.Film className="w-8 h-8 muted" /></div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-sm leading-snug line-clamp-3" style={{ color: 'var(--ink)' }}>{info.title}</p>
              <p className="muted text-xs mt-1">{[info.uploader, dur(info.duration)].filter(Boolean).join(' · ')}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {[['video', 'Video (MP4)'], ['audio', 'Audio (MP3)']].map(([v, l]) => (
                  <button key={v} onClick={() => setKind(v)} className="rounded-lg px-3 py-1.5 text-xs font-semibold border surface"
                    style={kind === v ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>{l}</button>
                ))}
                {kind === 'video' && (info.heights || []).length > 0 && (
                  <select value={height} onChange={(e) => setHeight(Number(e.target.value))} className="rounded-lg border surface px-2 py-1.5 text-xs bg-transparent" style={{ color: 'var(--ink)' }}>
                    {info.heights.map((h) => <option key={h} value={h}>{h}p{h >= 720 ? ' HD' : ''}</option>)}
                  </select>
                )}
              </div>
            </div>
          </div>

          {busy === 'download' ? (
            <div className="mt-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                  <Lucide.Loader2 className="w-4 h-4 animate-spin" /> {pct === null ? 'Preparing your file...' : `Downloading ${pct}%`}
                </span>
                {pct !== null && <span className="font-bold brand-text">{pct}%</span>}
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--surface-soft)' }}>
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct === null ? 6 : pct}%`, background: 'var(--brand)' }} />
              </div>
            </div>
          ) : (
            <button onClick={download} className="mt-5 w-full rounded-xl px-6 py-3 font-bold text-sm inline-flex items-center justify-center gap-2" style={{ background: 'var(--brand)', color: '#fff' }}>
              <Lucide.Download className="w-4 h-4" /> Download {kind === 'audio' ? 'MP3' : 'MP4'}
            </button>
          )}

          {done && (
            <div className="mt-4 rounded-xl px-4 py-3 text-sm flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--ink)' }}>
              <Lucide.CircleCheck className="w-5 h-5" style={{ color: '#0f9d76' }} /> Saved. Check your downloads folder.
            </div>
          )}
        </div>
      )}

      <p className="muted text-xs mt-4">Download only content you own or have permission to use. Craftora is not affiliated with TikTok, Instagram, Facebook, X, Dailymotion, or YouTube.</p>
    </div>
  );
}
