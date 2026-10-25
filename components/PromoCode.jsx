'use client';

import { useEffect, useState } from 'react';
import { Tag, Loader2, X, CheckCircle2 } from 'lucide-react';

const KEY = 'craftora-promo';
const EVT = 'craftora:promo';

function read() {
  if (typeof window === 'undefined') return null;
  if (window.__craftoraPromo !== undefined) return window.__craftoraPromo;
  try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; }
}
function write(p) {
  window.__craftoraPromo = p;
  try { p ? sessionStorage.setItem(KEY, JSON.stringify(p)) : sessionStorage.removeItem(KEY); } catch {}
  window.dispatchEvent(new CustomEvent(EVT, { detail: p }));
}

// The launch code currently applied on the pricing page: { code, percent, months, text } or null.
export function usePromo() {
  const [promo, setPromo] = useState(null);
  useEffect(() => {
    setPromo(read());
    const on = (e) => setPromo(e.detail || null);
    window.addEventListener(EVT, on);
    return () => window.removeEventListener(EVT, on);
  }, []);
  return promo;
}

// Same math as the server (lib/promo.js). The server always recalculates at checkout.
export function promoOff(priceCents, months, promo) {
  if (!promo || !months || !priceCents) return 0;
  return Math.round((priceCents * Math.min(months, promo.months) / months) * promo.percent / 100);
}

export function clearPromo() { write(null); }

export default function PromoBox() {
  const [promo, setPromo] = useState(null);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function apply(c) {
    const v = String(c || '').trim();
    if (!v) return;
    setBusy(true); setErr('');
    try {
      const r = await fetch(`/api/billing/promo?code=${encodeURIComponent(v)}`);
      const d = await r.json().catch(() => ({}));
      if (!d.ok) { setErr(d.error || 'This code is not valid.'); write(null); setPromo(null); }
      else { const p = { code: d.code, percent: d.percent, months: d.months, text: d.text }; write(p); setPromo(p); setOpen(false); }
    } catch { setErr('Could not check the code. Please try again.'); }
    setBusy(false);
  }

  useEffect(() => {
    let fromUrl = '';
    try { fromUrl = new URLSearchParams(window.location.search).get('code') || ''; } catch {}
    const saved = read();
    if (fromUrl) { setCode(fromUrl); apply(fromUrl); }
    else if (saved) setPromo(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (promo) {
    return (
      <div className="mt-8 flex justify-center">
        <div role="status" className="inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2.5 text-sm text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>Code <b>{promo.code}</b> applied: {promo.text}. Prices below include it.</span>
          <button type="button" onClick={() => { write(null); setPromo(null); setCode(''); }} className="inline-flex items-center gap-1 font-semibold underline"><X className="w-3.5 h-3.5" />Remove</button>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-8 flex flex-col items-center">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"><Tag className="w-4 h-4" />Have a launch code?</button>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); apply(code); }} className="flex w-full max-w-sm gap-2">
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter code" aria-label="Launch code" maxLength={32} autoFocus className="flex-1 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm uppercase tracking-wide text-slate-900 dark:text-white" />
          <button type="submit" disabled={busy || !code.trim()} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 text-sm disabled:opacity-60 inline-flex items-center gap-1.5">{busy && <Loader2 className="w-4 h-4 animate-spin" />}Apply</button>
        </form>
      )}
      {err && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{err}</p>}
    </div>
  );
}
