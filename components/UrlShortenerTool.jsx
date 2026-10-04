'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import * as Lucide from 'lucide-react';

const GO = 'go.' + 'craftora.dev';
const EXPIRY = [['', 'Never'], ['7', '7 days'], ['30', '30 days'], ['90', '90 days']];

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';
}

function CopyBtn({ text, label = 'Copy' }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" onClick={() => navigator.clipboard.writeText(text).then(() => { setOk(true); setTimeout(() => setOk(false), 1500); })}
      className="rounded-lg px-3 py-1.5 text-xs font-bold border surface inline-flex items-center gap-1" style={{ color: 'var(--ink)' }}>
      {ok ? <><Lucide.Check className="w-3.5 h-3.5" /> Copied</> : <><Lucide.Copy className="w-3.5 h-3.5" /> {label}</>}
    </button>
  );
}

function Stats({ id }) {
  const [s, setS] = useState(null);
  useEffect(() => {
    fetch(`/api/links/stats?id=${id}`).then((r) => r.json()).then(setS).catch(() => setS({ ok: false }));
  }, [id]);
  if (!s) return <p className="muted text-sm p-4">Loading stats...</p>;
  if (!s.ok) return <p className="text-sm p-4" style={{ color: '#e5484d' }}>Could not load stats.</p>;
  const max = Math.max(1, ...s.daily.map((d) => d.n));
  const List = ({ title, rows }) => (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide muted mb-2">{title}</p>
      {rows.length === 0 ? <p className="muted text-xs">No data yet</p> : rows.map((r) => (
        <div key={r.k} className="flex justify-between text-sm py-0.5" style={{ color: 'var(--ink)' }}><span className="truncate mr-2">{r.k}</span><strong>{r.n}</strong></div>
      ))}
    </div>
  );
  return (
    <div className="p-4 border-t surface">
      <p className="text-xs font-bold uppercase tracking-wide muted mb-2">Clicks, last 30 days</p>
      {s.daily.length === 0 ? <p className="muted text-sm mb-4">No clicks yet. Share your link to start tracking.</p> : (
        <div className="flex items-end gap-1 h-24 mb-5">
          {s.daily.map((d) => (
            <div key={d.day} title={`${d.day}: ${d.n}`} className="flex-1 rounded-t" style={{ height: `${Math.max(6, (d.n / max) * 100)}%`, background: 'var(--brand)' }} />
          ))}
        </div>
      )}
      <div className="grid sm:grid-cols-3 gap-5">
        <List title="Devices" rows={s.devices} />
        <List title="Browsers" rows={s.browsers} />
        <List title="Top referrers" rows={s.referrers} />
      </div>
    </div>
  );
}

export default function UrlShortenerTool() {
  const { data: session, status } = useSession();
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiry, setExpiry] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);
  const [qr, setQr] = useState('');
  const [links, setLinks] = useState([]);
  const [open, setOpen] = useState(null);

  async function loadLinks() {
    try { const r = await fetch('/api/links'); const d = await r.json(); if (d.ok) setLinks(d.links); } catch (e) {}
  }
  useEffect(() => { if (session?.user) loadLinks(); }, [session?.user]);

  useEffect(() => {
    if (!created) { setQr(''); return; }
    import('qrcode').then((QR) => QR.toDataURL(created.short, { width: 512, margin: 2 })).then(setQr).catch(() => setQr(''));
  }, [created]);

  async function shorten() {
    setError(''); setCreated(null);
    if (!url.trim()) { setError('Paste a link to shorten.'); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, alias, expiry }) });
      const d = await r.json();
      if (!d.ok) setError(d.error || 'Could not shorten this link.');
      else { setCreated(d.link); setUrl(''); setAlias(''); loadLinks(); }
    } catch (e) { setError('Network error. Please try again.'); }
    setBusy(false);
  }

  async function remove(id) {
    if (!confirm('Delete this short link? It will stop working immediately.')) return;
    await fetch(`/api/links?id=${id}`, { method: 'DELETE' });
    if (created?.id === id) setCreated(null);
    loadLinks();
  }

  if (status === 'loading') {
    return <div className="border surface rounded-2xl p-8 text-center muted" style={{ background: 'var(--surface)' }}>Loading...</div>;
  }
  if (!session?.user) {
    return (
      <div className="border surface rounded-2xl p-8 text-center" style={{ background: 'var(--surface)' }}>
        <Lucide.Link2 className="w-8 h-8 mx-auto mb-4 brand-text" />
        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>Sign in to create short links</h3>
        <p className="muted text-sm mb-5 max-w-md mx-auto">A free account lets you create unlimited short links, choose custom names, get QR codes, and track every click.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="rounded-xl px-5 py-2.5 font-bold text-sm" style={{ background: 'var(--brand)', color: '#fff' }}>Sign in</Link>
          <Link href="/signup" className="rounded-xl px-5 py-2.5 font-semibold text-sm border surface" style={{ color: 'var(--ink)' }}>Create account</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="border surface rounded-2xl p-3 flex flex-col sm:flex-row gap-2" style={{ background: 'var(--surface)' }}>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Lucide.Link className="w-5 h-5 muted shrink-0 ml-2" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') shorten(); }}
            placeholder="Paste a long link, e.g. https://example.com/very/long/page" className="w-full min-w-0 bg-transparent py-3 text-sm outline-none" style={{ color: 'var(--ink)' }} inputMode="url" />
        </div>
        <button onClick={shorten} disabled={busy} className="rounded-xl px-6 py-3 font-bold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: 'var(--brand)', color: '#fff' }}>
          {busy ? <><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Checking...</> : <><Lucide.Scissors className="w-4 h-4" /> Shorten</>}
        </button>
      </div>

      <button type="button" onClick={() => setShowMore(!showMore)} className="mt-3 text-sm font-semibold brand-text inline-flex items-center gap-1">
        <Lucide.SlidersHorizontal className="w-4 h-4" /> {showMore ? 'Hide options' : 'Custom name and expiry'}
      </button>
      {showMore && (
        <div className="mt-3 grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide muted mb-2">Custom name (optional)</p>
            <div className="flex items-center rounded-lg border surface overflow-hidden">
              <span className="px-3 text-sm muted shrink-0">{GO}/</span>
              <input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="my-link" className="w-full bg-transparent py-2.5 pr-3 text-sm outline-none" style={{ color: 'var(--ink)' }} />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide muted mb-2">Link expires</p>
            <select value={expiry} onChange={(e) => setExpiry(e.target.value)} className="w-full rounded-lg border surface px-3 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }}>
              {EXPIRY.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
      )}

      {error && <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#e5484d' }}>{error}</div>}

      {created && (
        <div className="mt-5 border surface rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start" style={{ background: 'var(--surface)' }}>
          {qr && (
            <div className="shrink-0 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR code for the short link" className="w-32 h-32 rounded-lg border surface bg-white" />
              <a href={qr} download={`qr-${created.code}.png`} className="text-xs font-bold brand-text inline-flex items-center gap-1 mt-2"><Lucide.Download className="w-3.5 h-3.5" /> QR code</a>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide muted">Your short link</p>
            <a href={created.short} target="_blank" rel="noopener noreferrer" className="block font-extrabold text-xl brand-text mt-1 break-all">{created.short.replace('https://', '')}</a>
            <p className="muted text-xs mt-1 break-all">Goes to {created.url}</p>
            {created.expires_at && <p className="muted text-xs mt-1">Expires {fmtDate(created.expires_at)}</p>}
            <div className="flex gap-2 mt-3"><CopyBtn text={created.short} label="Copy link" /></div>
          </div>
        </div>
      )}

      <div className="mt-10">
        <h3 className="font-extrabold text-lg mb-3" style={{ color: 'var(--ink)' }}>My links {links.length > 0 && <span className="muted font-semibold text-sm">({links.length})</span>}</h3>
        {links.length === 0 ? (
          <p className="muted text-sm">Links you create will appear here with their click counts.</p>
        ) : (
          <div className="border surface rounded-2xl overflow-hidden" style={{ background: 'var(--surface)' }}>
            {links.map((l) => (
              <div key={l.id} className="border-b surface last:border-0">
                <div className="p-4 flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <a href={l.short} target="_blank" rel="noopener noreferrer" className="font-bold text-sm brand-text break-all">{l.short.replace('https://', '')}</a>
                    <p className="muted text-xs truncate">{l.url}</p>
                    <p className="muted text-xs mt-0.5">
                      {fmtDate(l.created_at)}
                      {l.expired ? <span style={{ color: '#e5484d' }}> · Expired</span> : l.expires_at ? ` · Expires ${fmtDate(l.expires_at)}` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-extrabold shrink-0" style={{ color: 'var(--ink)' }}>{l.clicks} <span className="muted font-semibold text-xs">clicks</span></span>
                  <div className="flex gap-2 shrink-0">
                    <CopyBtn text={l.short} />
                    <button onClick={() => setOpen(open === l.id ? null : l.id)} className="rounded-lg px-3 py-1.5 text-xs font-bold border surface inline-flex items-center gap-1" style={{ color: 'var(--ink)' }}><Lucide.BarChart3 className="w-3.5 h-3.5" /> Stats</button>
                    <button onClick={() => remove(l.id)} className="rounded-lg px-2 py-1.5 border surface" title="Delete" style={{ color: '#e5484d' }}><Lucide.Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {open === l.id && <Stats id={l.id} />}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="muted text-xs mt-6">Every link is checked against Google Safe Browsing. Links to phishing, malware, or illegal content are blocked or removed.</p>
    </div>
  );
}
