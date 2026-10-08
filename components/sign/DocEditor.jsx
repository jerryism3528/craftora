'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Send, Plus, Trash2, UserPlus, Loader2, Check, AlertTriangle, ChevronUp, ChevronDown, MousePointerClick, X, ListOrdered,
} from 'lucide-react';
import PdfPages from './PdfPages';
import { COLORS, FIELD_TYPES, hexA } from './fieldTypes';

let keySeq = 0;
const nextKey = (p) => `${p}${Date.now().toString(36)}${(keySeq++).toString(36)}`;

export default function DocEditor({ id }) {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [doc, setDoc] = useState(null);
  const [owner, setOwner] = useState(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [ordered, setOrdered] = useState(false);
  const [signers, setSigners] = useState([]);
  const [fields, setFields] = useState([]);
  const [active, setActive] = useState('');
  const [pending, setPending] = useState('');
  const [selected, setSelected] = useState('');
  const [saveState, setSaveState] = useState('saved');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const dirty = useRef(false);
  const timer = useRef(null);
  const drag = useRef(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/sign/docs/${id}`, { cache: 'no-store' });
      if (res.status === 401) { router.push('/login'); return; }
      const d = await res.json();
      if (!res.ok) { setError(d.error || 'Document not found.'); return; }
      if (d.status !== 'draft') { router.replace(`/account/documents/${id}`); return; }
      setDoc(d);
      setOwner(d.owner);
      setTitle(d.title);
      setMessage(d.message || '');
      setOrdered(!!d.ordered);
      const s = d.signers.map((x) => ({ key: String(x.id), name: x.name, email: x.email }));
      setSigners(s);
      setFields(d.fields.map((f) => ({ key: `f${f.id}`, signerKey: String(f.signerId), type: f.type, page: f.page, x: f.x, y: f.y, w: f.w, h: f.h, required: f.required, label: f.label })));
      setActive(s[0]?.key || '');
      setLoaded(true);
    })().catch(() => setError('Could not load the document.'));
  }, [id, router]);

  const colorOf = useCallback((key) => {
    const i = signers.findIndex((s) => s.key === key);
    return COLORS[(i < 0 ? 0 : i) % COLORS.length];
  }, [signers]);

  const save = useCallback(async () => {
    clearTimeout(timer.current);
    if (!dirty.current) return true;
    dirty.current = false;
    setSaveState('saving');
    const valid = signers.filter((s) => s.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.email.trim()));
    const validKeys = new Set(valid.map((s) => s.key));
    try {
      const res = await fetch(`/api/sign/docs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, message, ordered,
          signers: valid.map((s, i) => ({ key: s.key, name: s.name, email: s.email, position: i + 1 })),
          fields: fields.filter((f) => validKeys.has(f.signerKey)).map((f) => ({ signerKey: f.signerKey, type: f.type, page: f.page, x: f.x, y: f.y, w: f.w, h: f.h, required: f.required, label: f.label })),
        }),
      });
      const d = await res.json();
      if (!res.ok) { setSaveState('error'); setSendError(d.error || 'Could not save.'); return false; }
      setSaveState(dirty.current ? 'pending' : 'saved');
      return true;
    } catch {
      setSaveState('error');
      dirty.current = true;
      return false;
    }
  }, [id, title, message, ordered, signers, fields]);

  useEffect(() => {
    if (!loaded) return;
    dirty.current = true;
    setSaveState('pending');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { save(); }, 1200);
    return () => clearTimeout(timer.current);
  }, [title, message, ordered, signers, fields]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected && !/input|textarea|select/i.test(document.activeElement?.tagName || '')) {
        setFields((fs) => fs.filter((f) => f.key !== selected));
        setSelected('');
      }
      if (e.key === 'Escape') { setPending(''); setSelected(''); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  function addSigner(name = '', email = '') {
    if (signers.length >= 10) return;
    const key = nextKey('s');
    setSigners((s) => [...s, { key, name, email }]);
    setActive(key);
  }
  function addMe() {
    if (!owner || signers.some((s) => s.email.toLowerCase() === owner.email.toLowerCase())) return;
    addSigner(owner.name || owner.email.split('@')[0], owner.email);
  }
  function updateSigner(key, patch) { setSigners((s) => s.map((x) => (x.key === key ? { ...x, ...patch } : x))); }
  function removeSigner(key) {
    setSigners((s) => s.filter((x) => x.key !== key));
    setFields((fs) => fs.filter((f) => f.signerKey !== key));
    if (active === key) setActive(signers.find((s) => s.key !== key)?.key || '');
  }
  function moveSigner(i, dir) {
    setSigners((s) => {
      const n = [...s];
      const j = i + dir;
      if (j < 0 || j >= n.length) return s;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  }

  function placeField(type, page, box, px, py) {
    if (!active) return;
    const t = FIELD_TYPES[type];
    const w = t.w;
    const h = type === 'checkbox' ? (t.w * box.width) / box.height : t.h;
    const x = Math.min(1 - w, Math.max(0, px - w / 2));
    const y = Math.min(1 - h, Math.max(0, py - h / 2));
    const key = nextKey('f');
    setFields((fs) => [...fs, { key, signerKey: active, type, page, x, y, w, h, required: type !== 'checkbox', label: '' }]);
    setSelected(key);
    setPending('');
  }

  function startDrag(e, f, box, mode) {
    e.stopPropagation();
    e.preventDefault();
    setSelected(f.key);
    drag.current = { key: f.key, mode, sx: e.clientX, sy: e.clientY, f: { ...f }, box };
    const move = (ev) => {
      const d = drag.current;
      if (!d) return;
      const dx = (ev.clientX - d.sx) / d.box.width;
      const dy = (ev.clientY - d.sy) / d.box.height;
      setFields((fs) => fs.map((x) => {
        if (x.key !== d.key) return x;
        if (d.mode === 'move') {
          return { ...x, x: Math.min(1 - x.w, Math.max(0, d.f.x + dx)), y: Math.min(1 - x.h, Math.max(0, d.f.y + dy)) };
        }
        const w = Math.min(1 - x.x, Math.max(0.02, d.f.w + dx));
        const h = Math.min(1 - x.y, Math.max(0.012, d.f.h + dy));
        return { ...x, w, h };
      }));
    };
    const up = () => { drag.current = null; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  async function send() {
    setSendError('');
    const valid = signers.filter((s) => s.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.email.trim()));
    if (!valid.length) return setSendError('Add at least one signer with a name and email.');
    if (valid.length !== signers.length) return setSendError('Every signer needs a name and a valid email address.');
    for (const s of signers) {
      if (!fields.some((f) => f.signerKey === s.key && f.type === 'signature')) return setSendError(`Add a signature field for ${s.name || s.email}.`);
    }
    setSending(true);
    dirty.current = true;
    const ok = await save();
    if (!ok) { setSending(false); return; }
    const res = await fetch(`/api/sign/docs/${id}/send`, { method: 'POST' });
    const d = await res.json();
    if (!res.ok) { setSendError(d.error || 'Could not send.'); setSending(false); return; }
    router.push(`/account/documents/${id}?sent=1`);
  }

  const sel = fields.find((f) => f.key === selected);
  const counts = useMemo(() => Object.fromEntries(signers.map((s) => [s.key, fields.filter((f) => f.signerKey === s.key).length])), [signers, fields]);

  if (error) return <div className="max-w-xl mx-auto text-center py-20"><AlertTriangle className="w-10 h-10 mx-auto text-amber-500" /><p className="mt-3 font-semibold text-slate-900 dark:text-white">{error}</p><Link href="/account/documents" className="inline-block mt-4 text-indigo-600 dark:text-indigo-400 font-semibold">Back to documents</Link></div>;
  if (!loaded) return <div className="flex items-center justify-center py-24 text-slate-500 dark:text-slate-400"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading editor...</div>;

  const inputCls = 'w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div>
      {/* Top bar */}
      <div className="sticky top-0 z-30 -mx-4 px-4 py-3 mb-6 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3">
        <Link href="/account/documents" className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800" aria-label="Back"><ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" /></Link>
        <input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 150))} className="flex-1 min-w-[180px] bg-transparent text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1" aria-label="Document title" />
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          {saveState === 'saving' || saveState === 'pending' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving</> : saveState === 'error' ? <span className="text-red-600">Not saved</span> : <><Check className="w-3.5 h-3.5 text-emerald-500" /> Saved</>}
        </span>
        <button onClick={send} disabled={sending} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send for signature
        </button>
      </div>
      {sendError && <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-700 dark:text-red-300"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {sendError}</div>}

      <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto pr-1">
          <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white">1. Signers</h2>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer" title="Each signer gets the email after the previous one signs">
                <input type="checkbox" checked={ordered} onChange={(e) => setOrdered(e.target.checked)} /> <ListOrdered className="w-3.5 h-3.5" /> Set order
              </label>
            </div>
            <div className="space-y-3 mt-3">
              {signers.map((s, i) => (
                <div key={s.key} onClick={() => setActive(s.key)} className={`rounded-xl border-2 p-3 cursor-pointer ${active === s.key ? 'border-indigo-500' : 'border-slate-200 dark:border-slate-700'}`} style={{ background: active === s.key ? hexA(colorOf(s.key), 0.06) : undefined }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: colorOf(s.key) }} />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{ordered ? `Signer ${i + 1}` : 'Signer'} · {counts[s.key] || 0} fields</span>
                    <span className="ml-auto flex items-center gap-0.5">
                      {ordered && <>
                        <button type="button" onClick={(e) => { e.stopPropagation(); moveSigner(i, -1); }} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Move up"><ChevronUp className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); moveSigner(i, 1); }} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Move down"><ChevronDown className="w-3.5 h-3.5" /></button>
                      </>}
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeSigner(s.key); }} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600" aria-label="Remove signer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </span>
                  </div>
                  <input value={s.name} onChange={(e) => updateSigner(s.key, { name: e.target.value.slice(0, 100) })} placeholder="Full name" className={inputCls} />
                  <input value={s.email} onChange={(e) => updateSigner(s.key, { email: e.target.value.slice(0, 254) })} placeholder="Email address" type="email" className={`${inputCls} mt-2`} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={() => addSigner()} disabled={signers.length >= 10} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"><UserPlus className="w-4 h-4" /> Add signer</button>
              {owner && !signers.some((s) => s.email.toLowerCase() === owner.email.toLowerCase()) && (
                <button type="button" onClick={addMe} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"><Plus className="w-4 h-4" /> Add me</button>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <h2 className="font-bold text-slate-900 dark:text-white">2. Fields</h2>
            {signers.length ? (
              <>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Adding fields for <span className="font-semibold" style={{ color: colorOf(active) }}>{signers.find((s) => s.key === active)?.name || 'this signer'}</span>. Pick a field, then click on the page.</p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {Object.entries(FIELD_TYPES).map(([k, t]) => (
                    <button key={k} type="button" onClick={() => setPending(pending === k ? '' : k)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-semibold text-left ${pending === k ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-slate-300'}`}>
                      <t.Icon className="w-4 h-4 shrink-0" style={{ color: colorOf(active) }} /> {t.label}
                    </button>
                  ))}
                </div>
              </>
            ) : <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add a signer first.</p>}
          </section>

          {sel && (
            <section className="rounded-2xl border-2 border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 dark:text-white">{FIELD_TYPES[sel.type].label} field</h2>
                <button type="button" onClick={() => setSelected('')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Close"><X className="w-4 h-4 text-slate-500" /></button>
              </div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mt-3">Assigned to</label>
              <select value={sel.signerKey} onChange={(e) => setFields((fs) => fs.map((f) => (f.key === sel.key ? { ...f, signerKey: e.target.value } : f)))} className={`${inputCls} mt-1`}>
                {signers.map((s) => <option key={s.key} value={s.key}>{s.name || s.email || 'Unnamed signer'}</option>)}
              </select>
              {(sel.type === 'text' || sel.type === 'checkbox') && (
                <>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mt-3">{sel.type === 'text' ? 'Placeholder / label' : 'Label'}</label>
                  <input value={sel.label} onChange={(e) => setFields((fs) => fs.map((f) => (f.key === sel.key ? { ...f, label: e.target.value.slice(0, 60) } : f)))} placeholder={sel.type === 'text' ? 'e.g. Company name' : 'e.g. I agree to the terms'} className={`${inputCls} mt-1`} />
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 mt-3 cursor-pointer">
                    <input type="checkbox" checked={sel.required} onChange={(e) => setFields((fs) => fs.map((f) => (f.key === sel.key ? { ...f, required: e.target.checked } : f)))} /> Required
                  </label>
                </>
              )}
              <button type="button" onClick={() => { setFields((fs) => fs.filter((f) => f.key !== sel.key)); setSelected(''); }} className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"><Trash2 className="w-4 h-4" /> Remove field</button>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <h2 className="font-bold text-slate-900 dark:text-white">3. Message <span className="font-normal text-xs text-slate-500">(optional)</span></h2>
            <textarea value={message} onChange={(e) => setMessage(e.target.value.slice(0, 2000))} rows={4} placeholder="Hi, please review and sign this document." className={`${inputCls} mt-2`} />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Signers get an email from noreply@craftora.dev. Replies go to you. Links expire after 30 days.</p>
          </section>
        </aside>

        {/* Document */}
        <div className="min-w-0">
          {pending && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2.5 text-sm font-semibold">
              <MousePointerClick className="w-4 h-4" /> Click on the page to place the {FIELD_TYPES[pending].label.toLowerCase()} field. Press Esc to cancel.
            </div>
          )}
          <PdfPages
            src={`/api/sign/docs/${id}/file?type=original`}
            renderOverlay={(page, box) => (
              <div
                className={`absolute inset-0 ${pending ? 'cursor-crosshair' : ''}`}
                onPointerDown={(e) => {
                  if (!pending) { if (e.target === e.currentTarget) setSelected(''); return; }
                  const r = e.currentTarget.getBoundingClientRect();
                  placeField(pending, page, box, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
                }}
              >
                {fields.filter((f) => f.page === page).map((f) => {
                  const c = colorOf(f.signerKey);
                  const T = FIELD_TYPES[f.type];
                  const isSel = selected === f.key;
                  return (
                    <div key={f.key}
                      onPointerDown={(e) => startDrag(e, f, box, 'move')}
                      className={`absolute flex items-center gap-1 overflow-hidden rounded cursor-move text-[11px] font-semibold ${isSel ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}`}
                      style={{ left: `${f.x * 100}%`, top: `${f.y * 100}%`, width: `${f.w * 100}%`, height: `${f.h * 100}%`, background: hexA(c, 0.16), border: `1.5px solid ${c}`, color: c, padding: f.type === 'checkbox' ? 0 : '0 4px', justifyContent: f.type === 'checkbox' ? 'center' : 'flex-start' }}
                      title={`${T.label} for ${signers.find((s) => s.key === f.signerKey)?.name || ''}`}
                    >
                      <T.Icon className="w-3.5 h-3.5 shrink-0" />
                      {f.type !== 'checkbox' && <span className="truncate">{f.type === 'text' && f.label ? f.label : T.label}</span>}
                      {isSel && (
                        <>
                          <button type="button" onPointerDown={(e) => { e.stopPropagation(); setFields((fs) => fs.filter((x) => x.key !== f.key)); setSelected(''); }} className="absolute -top-0 -right-0 bg-white/90 rounded-bl p-0.5" aria-label="Remove field"><X className="w-3 h-3 text-red-600" /></button>
                          <span onPointerDown={(e) => startDrag(e, f, box, 'resize')} className="absolute right-0 bottom-0 w-3 h-3 cursor-se-resize" style={{ background: c }} />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
