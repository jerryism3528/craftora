'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2, AlertTriangle, CheckCircle2, Download, XCircle, ChevronRight, PenLine, ShieldCheck, Clock } from 'lucide-react';
import PdfPages from './PdfPages';
import SignatureModal from './SignatureModal';
import { FIELD_TYPES, hexA } from './fieldTypes';

export default function SignerView({ token }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [values, setValues] = useState({});
  const [modal, setModal] = useState(null); // { fieldId, kind }
  const [adopted, setAdopted] = useState({ signature: null, initials: null });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [declineOpen, setDeclineOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [result, setResult] = useState(null);
  const pageRefs = useRef([]);
  const fieldRefs = useRef({});

  async function load() {
    try {
      const res = await fetch(`/api/sign/s/${token}`, { cache: 'no-store' });
      const d = await res.json();
      if (!res.ok) { setError(d.error || 'This link is not valid.'); return; }
      setData(d);
      const v = {};
      for (const f of d.fields) {
        if (f.type === 'name') v[f.id] = f.value || d.signer.name;
        else if (f.type === 'checkbox') v[f.id] = f.value === 'true';
        else if (f.type === 'text') v[f.id] = f.value || '';
      }
      setValues(v);
    } catch { setError('Could not load the document. Check your connection.'); }
  }
  useEffect(() => { load(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const fields = data?.fields || [];
  const filled = (f) => {
    if (f.type === 'date' || f.type === 'email') return true;
    if (f.type === 'checkbox') return !f.required || values[f.id] === true;
    const v = values[f.id];
    return !f.required || (v != null && v !== '');
  };
  const todo = fields.filter((f) => !filled(f));
  const doneCount = fields.length - todo.length;

  function goNext() {
    const f = todo[0];
    if (!f) return;
    const el = fieldRefs.current[f.id] || pageRefs.current[f.page - 1];
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (f.type === 'signature' || f.type === 'initials') setTimeout(() => openSig(f), 350);
  }

  function openSig(f) {
    if (adopted[f.type]) { setValues((v) => ({ ...v, [f.id]: adopted[f.type] })); return; }
    setModal({ fieldId: f.id, kind: f.type });
  }

  function onAdopt(url) {
    const kind = modal.kind;
    setAdopted((a) => ({ ...a, [kind]: url }));
    // Apply to every field of the same kind.
    setValues((v) => {
      const n = { ...v };
      for (const f of fields) if (f.type === kind) n[f.id] = url;
      return n;
    });
    setModal(null);
  }

  async function submit() {
    setSubmitError('');
    if (todo.length) { setSubmitError(`Please complete ${todo.length} more required field${todo.length > 1 ? 's' : ''}.`); goNext(); return; }
    if (!consent) { setSubmitError('Please agree to sign electronically.'); return; }
    setBusy(true);
    const payload = {};
    for (const f of fields) if (values[f.id] !== undefined) payload[f.id] = values[f.id];
    try {
      const res = await fetch(`/api/sign/s/${token}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'sign', consent: true, values: payload }) });
      const d = await res.json();
      if (!res.ok) { setSubmitError(d.error || 'Could not submit.'); setBusy(false); return; }
      setResult({ type: 'signed', completed: d.completed });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch { setSubmitError('Network error. Please try again.'); }
    setBusy(false);
  }

  async function decline() {
    setBusy(true);
    const res = await fetch(`/api/sign/s/${token}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'decline', reason }) });
    const d = await res.json();
    setBusy(false);
    setDeclineOpen(false);
    if (res.ok) setResult({ type: 'declined' }); else setSubmitError(d.error || 'Could not decline.');
  }

  if (error) {
    return <div className="max-w-xl mx-auto text-center py-20"><AlertTriangle className="w-10 h-10 mx-auto text-amber-500" /><h1 className="text-xl font-bold text-slate-900 dark:text-white mt-3">{error}</h1><p className="text-slate-600 dark:text-slate-300 mt-2">If you think this is a mistake, contact the person who sent you the document.</p></div>;
  }
  if (!data) return <div className="flex items-center justify-center py-24 text-slate-500 dark:text-slate-400"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading document...</div>;

  const { doc, signer } = data;
  const fileUrl = `/api/sign/s/${token}/file`;

  // Finished or blocked states.
  const state = result?.type || (signer.status === 'signed' ? 'signed' : signer.status === 'declined' ? 'declined' : !data.canSign ? doc.status : null);
  if (state) {
    const completed = result?.completed || doc.status === 'completed';
    const map = {
      signed: { Icon: CheckCircle2, cls: 'text-emerald-500', title: completed ? 'All done. The document is complete.' : 'Thank you. You signed this document.', text: completed ? 'Everyone has signed. Download your copy below. We also emailed it to you.' : 'We will email you the final copy once everyone has signed.' },
      declined: { Icon: XCircle, cls: 'text-red-500', title: 'You declined to sign', text: `${doc.senderName} has been notified.` },
      voided: { Icon: XCircle, cls: 'text-slate-400', title: 'This document was voided', text: `${doc.senderName} cancelled this signing request.` },
      expired: { Icon: Clock, cls: 'text-slate-400', title: 'This signing link has expired', text: `Ask ${doc.senderName} to send the document again.` },
      completed: { Icon: CheckCircle2, cls: 'text-emerald-500', title: 'This document is complete', text: 'Download the signed copy below.' },
      declinedDoc: { Icon: XCircle, cls: 'text-slate-400', title: 'Signing was stopped', text: 'Another signer declined this document.' },
    };
    const m = map[state === 'declined' && signer.status !== 'declined' && !result ? 'declinedDoc' : state] || map.voided;
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <m.Icon className={`w-14 h-14 mx-auto ${m.cls}`} />
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-4">{m.title}</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2">{m.text}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{doc.title}</p>
        {completed && (
          <a href={`${fileUrl}?download=1`} className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"><Download className="w-4 h-4" /> Download signed PDF</a>
        )}
        <div className="mt-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 text-left">
          <div className="font-bold text-slate-900 dark:text-white">Need to sign your own documents?</div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Craftora Sign is free. Upload a PDF, add signers, and track every signature.</p>
          <Link href="/document-signer" className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400">Try Craftora Sign <ChevronRight className="w-4 h-4" /></Link>
        </div>
      </div>
    );
  }

  const fieldBox = (f) => {
    const c = signer.color || '#6366f1';
    const v = values[f.id];
    const base = { left: `${f.x * 100}%`, top: `${f.y * 100}%`, width: `${f.w * 100}%`, height: `${f.h * 100}%` };
    const ok = filled(f);
    const ring = ok ? 'transparent' : c;
    if (f.type === 'signature' || f.type === 'initials') {
      return (
        <button key={f.id} ref={(el) => { fieldRefs.current[f.id] = el; }} type="button" onClick={() => openSig(f)}
          className="absolute flex items-center justify-center rounded text-xs font-bold overflow-hidden" style={{ ...base, background: v ? 'transparent' : hexA(c, 0.15), border: `2px ${v ? 'dashed' : 'solid'} ${v ? hexA(c, 0.5) : c}`, color: c }}>
          {v ? <img src={v} alt="" className="max-w-full max-h-full object-contain" /> : <span className="flex items-center gap-1"><PenLine className="w-3.5 h-3.5" /> {f.type === 'initials' ? 'Initials' : 'Sign here'}</span>}
        </button>
      );
    }
    if (f.type === 'checkbox') {
      return (
        <button key={f.id} ref={(el) => { fieldRefs.current[f.id] = el; }} type="button" onClick={() => setValues((x) => ({ ...x, [f.id]: !x[f.id] }))} title={f.label || 'Checkbox'}
          className="absolute flex items-center justify-center rounded bg-white" style={{ ...base, border: `2px solid ${c}` }}>
          {v && <svg viewBox="0 0 20 20" className="w-full h-full p-0.5"><path d="M4 10.5l4 4 8-9" fill="none" stroke="#1a1f4e" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </button>
      );
    }
    if (f.type === 'date' || f.type === 'email') {
      return <div key={f.id} className="absolute flex items-center px-1 rounded text-[11px] sm:text-xs text-slate-800 overflow-hidden whitespace-nowrap" style={{ ...base, background: hexA(c, 0.08), border: `1px dashed ${hexA(c, 0.6)}` }}>{f.type === 'date' ? today : signer.email}</div>;
    }
    return (
      <input key={f.id} ref={(el) => { fieldRefs.current[f.id] = el; }} value={v || ''} onChange={(e) => setValues((x) => ({ ...x, [f.id]: e.target.value.slice(0, 500) }))} placeholder={f.label || (f.type === 'name' ? 'Full name' : 'Type here')}
        className="absolute rounded px-1 text-[11px] sm:text-xs text-slate-900 bg-white/90 focus:outline-none" style={{ ...base, border: `2px solid ${ring === 'transparent' ? hexA(c, 0.45) : c}` }} />
    );
  };

  return (
    <div>
      <div className="sticky top-0 z-30 -mx-4 px-4 py-3 mb-6 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center gap-3 max-w-5xl mx-auto">
          <div className="flex-1 min-w-0">
            <div className="font-bold text-slate-900 dark:text-white truncate">{doc.title}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">From {doc.senderName} · {doneCount} of {fields.length} fields done</div>
          </div>
          {todo.length > 0 ? (
            <button onClick={goNext} className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-white font-semibold" style={{ background: signer.color || '#6366f1' }}>Next field <ChevronRight className="w-4 h-4" /></button>
          ) : (
            <button onClick={() => document.getElementById('finish')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold">Finish <ChevronRight className="w-4 h-4" /></button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 mb-6">
          <p className="text-slate-700 dark:text-slate-200"><span className="font-semibold">{doc.senderName}</span> ({doc.senderEmail}) asked you to sign this document.</p>
          {doc.message && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 dark:bg-slate-900/60 p-3 text-sm text-slate-700 dark:text-slate-300">{doc.message}</p>}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Click each highlighted field to fill it in. Your signature is applied to every signature field automatically.</p>
        </div>

        <PdfPages src={fileUrl} pageRefs={pageRefs} renderOverlay={(page) => <div className="absolute inset-0">{fields.filter((f) => f.page === page).map(fieldBox)}</div>} />

        <div id="finish" className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
            <span className="text-sm text-slate-700 dark:text-slate-200">I agree to sign this document electronically. I understand my electronic signature is legally binding, the same as a handwritten signature.</span>
          </label>
          {submitError && <p className="text-sm text-red-600 dark:text-red-400 mt-3">{submitError}</p>}
          <div className="flex flex-wrap gap-3 mt-4">
            <button onClick={submit} disabled={busy} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Finish and sign
            </button>
            <button onClick={() => setDeclineOpen(true)} className="px-5 py-3 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">Decline to sign</button>
            <a href={`${fileUrl}?download=1`} className="px-5 py-3 rounded-lg font-semibold text-slate-600 dark:text-slate-300 hover:underline">Download original</a>
          </div>
        </div>
      </div>

      <SignatureModal open={!!modal} kind={modal?.kind} defaultText={modal?.kind === 'initials' ? signer.name.split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 3) : signer.name} onClose={() => setModal(null)} onSave={onAdopt} />

      {declineOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Decline to sign?</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{doc.senderName} will be notified and the signing process will stop.</p>
            <textarea value={reason} onChange={(e) => setReason(e.target.value.slice(0, 500))} rows={3} placeholder="Reason (optional)" className="w-full mt-3 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setDeclineOpen(false)} className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-slate-800 dark:text-slate-100">Cancel</button>
              <button onClick={decline} disabled={busy} className="px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700">Decline</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
