'use client';

import { useEffect, useRef, useState } from 'react';
import { Heart, Loader2, Check, ImagePlus, Clock } from 'lucide-react';
import { resizeImage } from './resizeImage';

// Lets a signed-in supporter change their name and photo on the wall, or hide their listing.
export default function SupporterSelf() {
  const [me, setMe] = useState(null);
  const [name, setName] = useState('');
  const [show, setShow] = useState(true);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    fetch('/api/account/supporter', { cache: 'no-store' }).then((r) => r.json()).then((d) => {
      setMe(d);
      if (d.isSupporter) { setName(d.name || ''); setShow(d.show !== false); }
    }).catch(() => {});
  }, []);

  if (!me?.isSupporter) return null;

  async function send(body, isForm = false) {
    const r = await fetch('/api/account/supporter', isForm ? { method: 'POST', body } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json();
    if (r.ok) setMe((m) => ({ ...m, ...d }));
    return { ok: r.ok, d };
  }
  async function save() {
    setBusy('save'); setMsg('');
    try {
      const { ok, d } = await send({ name, show });
      setMsg(ok ? (d.show ? 'Saved. Your listing is updated.' : 'Saved. Your name is hidden from the wall.') : d.error || 'Could not save.');
    } catch { setMsg('Could not save. Check your connection.'); }
    setBusy('');
  }
  async function upload(file) {
    if (!file) return;
    setBusy('photo'); setMsg('');
    try {
      const small = await resizeImage(file, 'avatar');
      const fd = new FormData(); fd.append('photo', small);
      const { ok, d } = await send(fd, true);
      setMsg(ok ? 'Thanks! Your photo will appear after a quick review.' : d.error || 'Upload failed.');
    } catch (e) { setMsg(e.message || 'Upload failed.'); }
    setBusy('');
  }
  async function removePhoto() {
    setBusy('remove');
    const { ok } = await send({ removePhoto: true });
    setMsg(ok ? 'Photo removed.' : 'Could not remove the photo.');
    setBusy('');
  }

  const initials = (me.name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <section className="rounded-2xl border border-pink-200 dark:border-pink-900 bg-pink-50 dark:bg-pink-950/30 p-5" aria-labelledby="my-listing">
      <h2 id="my-listing" className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Heart className="w-4 h-4 text-pink-500 fill-pink-500" /> You are a Founding Supporter. Thank you!</h2>
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Choose how you appear on this page. Photos are optional and shown after a quick review.</p>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4">
        <div className="flex items-center gap-3 shrink-0">
          {me.photo
            ? <img src={me.photo} alt="Your wall photo" className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-slate-700" />
            : <span className="w-14 h-14 rounded-full bg-pink-200 dark:bg-pink-900 text-pink-800 dark:text-pink-200 flex items-center justify-center font-bold">{initials}</span>}
          <div className="flex flex-col gap-1">
            <button onClick={() => fileRef.current?.click()} disabled={!!busy} className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:underline disabled:opacity-50">
              {busy === 'photo' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />} {me.photo ? 'Change photo' : 'Add a photo'}
            </button>
            {me.photo && <button onClick={removePhoto} disabled={!!busy} className="text-xs text-slate-500 dark:text-slate-400 hover:underline text-left">Remove photo</button>}
            {me.pendingPhoto && <span className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300"><Clock className="w-3 h-3" /> New photo in review</span>}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} aria-label="Name on the wall" className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white" />
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 px-1"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show me on the wall</label>
          <button onClick={save} disabled={!!busy} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 disabled:opacity-60">
            {busy === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
          </button>
        </div>
      </div>
      {msg && <p className="text-sm text-slate-700 dark:text-slate-200 mt-3" role="status">{msg}</p>}
    </section>
  );
}
