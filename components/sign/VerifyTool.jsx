'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert, Upload, Loader2, FileText } from 'lucide-react';

export default function VerifyTool() {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [over, setOver] = useState(false);

  async function check(file) {
    setError(''); setRes(null);
    if (!file) return;
    if (!(file.type === 'application/pdf' || /\.pdf$/i.test(file.name))) return setError('Please choose a PDF file.');
    setName(file.name);
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-256', buf);
      const hash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
      const r = await fetch('/api/sign/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hash }) });
      const d = await r.json();
      if (!r.ok) setError(d.error || 'Could not check this file.'); else setRes({ ...d, hash });
    } catch { setError('Could not read this file.'); }
    setBusy(false);
  }

  return (
    <div className="space-y-5">
      <button type="button" onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); check(e.dataTransfer.files?.[0]); }}
        className={`w-full rounded-2xl border-2 border-dashed py-12 text-center transition ${over ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'} hover:border-indigo-400`}>
        {busy ? <Loader2 className="w-8 h-8 mx-auto text-indigo-500 animate-spin" /> : <Upload className="w-8 h-8 mx-auto text-indigo-500" />}
        <div className="font-bold text-slate-900 dark:text-white mt-2">Upload a signed PDF to verify</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">The file stays on your device. Only its fingerprint (SHA-256) is checked.</div>
      </button>
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => check(e.target.files?.[0])} />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {res?.match === 'signed' && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-5">
          <div className="flex items-center gap-2 text-lg font-bold text-emerald-800 dark:text-emerald-200"><ShieldCheck className="w-6 h-6" /> Authentic and unchanged</div>
          <p className="text-sm text-emerald-900 dark:text-emerald-100 mt-1">This file exactly matches a document completed with Craftora Sign.</p>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm">
            <div><dt className="text-emerald-700 dark:text-emerald-300 text-xs font-semibold">Document</dt><dd className="text-slate-900 dark:text-white">{res.doc.title}</dd></div>
            <div><dt className="text-emerald-700 dark:text-emerald-300 text-xs font-semibold">Document ID</dt><dd className="text-slate-900 dark:text-white font-mono">{res.doc.id}</dd></div>
            <div><dt className="text-emerald-700 dark:text-emerald-300 text-xs font-semibold">Completed</dt><dd className="text-slate-900 dark:text-white">{new Date(res.doc.completedAt).toLocaleString()}</dd></div>
            <div><dt className="text-emerald-700 dark:text-emerald-300 text-xs font-semibold">Sent by</dt><dd className="text-slate-900 dark:text-white">{res.doc.senderName}</dd></div>
          </dl>
          <div className="mt-4">
            <div className="text-emerald-700 dark:text-emerald-300 text-xs font-semibold">Signed by</div>
            <ul className="mt-1 space-y-1">
              {res.signers.map((s, i) => <li key={i} className="text-sm text-slate-900 dark:text-white">{s.name} <span className="text-slate-500">({s.email})</span> · {new Date(s.signedAt).toLocaleString()}</li>)}
            </ul>
          </div>
        </div>
      )}
      {res?.match === 'none' && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-5">
          <div className="flex items-center gap-2 text-lg font-bold text-amber-800 dark:text-amber-200"><ShieldAlert className="w-6 h-6" /> No match found</div>
          <p className="text-sm text-amber-900 dark:text-amber-100 mt-1">{name} does not match any completed Craftora Sign document. It may have been edited, re-saved, printed and scanned, or signed with another service. Ask the sender for the original signed PDF from their email.</p>
        </div>
      )}
      {res && <p className="text-xs text-slate-500 dark:text-slate-400 break-all flex items-start gap-1.5"><FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" /> SHA-256: {res.hash}</p>}
      <p className="text-sm text-slate-600 dark:text-slate-300">Need signatures on a document? <Link href="/document-signer" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Send it with Craftora Sign for free</Link>.</p>
    </div>
  );
}
