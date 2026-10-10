'use client';

import { useEffect, useState } from 'react';
import { Heart, Loader2, Check } from 'lucide-react';

// Lets a signed-in supporter change how their name appears on the wall, or hide it.
export default function SupporterSelf() {
  const [me, setMe] = useState(null);
  const [name, setName] = useState('');
  const [show, setShow] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/account/supporter', { cache: 'no-store' }).then((r) => r.json()).then((d) => {
      setMe(d);
      if (d.isSupporter) { setName(d.name || ''); setShow(d.show !== false); }
    }).catch(() => {});
  }, []);

  if (!me?.isSupporter) return null;

  async function save() {
    setBusy(true); setMsg('');
    try {
      const r = await fetch('/api/account/supporter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, show }) });
      const d = await r.json();
      setMsg(r.ok ? (d.show ? 'Saved. Your name updates on the wall within a few minutes.' : 'Saved. Your name is hidden from the wall.') : d.error || 'Could not save.');
    } catch { setMsg('Could not save. Check your connection.'); }
    setBusy(false);
  }

  return (
    <section className="rounded-2xl border border-pink-200 dark:border-pink-900 bg-pink-50 dark:bg-pink-950/30 p-5" aria-labelledby="my-listing">
      <h2 id="my-listing" className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Heart className="w-4 h-4 text-pink-500 fill-pink-500" /> You are a Founding Supporter. Thank you!</h2>
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Choose how your name appears on this page, or hide it.</p>
      <div className="flex flex-col sm:flex-row gap-2 mt-3">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} aria-label="Name on the wall" className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white" />
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 px-1"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show my name</label>
        <button onClick={save} disabled={busy} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 disabled:opacity-60">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
        </button>
      </div>
      {msg && <p className="text-sm text-slate-700 dark:text-slate-200 mt-2" role="status">{msg}</p>}
    </section>
  );
}
