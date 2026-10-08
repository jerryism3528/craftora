'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Loader2, AlertTriangle, Download, Bell, Ban, Copy, Trash2, PenLine, CheckCircle2, Send, Eye, XCircle, Clock, FileText, ShieldCheck,
} from 'lucide-react';
import PdfPages from './PdfPages';
import { STATUS, SIGNER_STATUS } from './fieldTypes';

const EV = {
  created: [FileText, 'Document uploaded'], sent: [Send, 'Sent for signature'], invited: [Send, 'Invitation emailed'], viewed: [Eye, 'Opened the document'],
  signed: [CheckCircle2, 'Signed'], declined: [XCircle, 'Declined'], reminded: [Bell, 'Reminder sent'], voided: [Ban, 'Voided'],
  completed: [ShieldCheck, 'Completed'], expired: [Clock, 'Expired'],
};

export default function DocDetail({ id }) {
  const router = useRouter();
  const params = useSearchParams();
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState(params.get('sent') ? 'Sent. Signers will get an email from Craftora Sign.' : '');

  const load = useCallback(async () => {
    const res = await fetch(`/api/sign/docs/${id}`, { cache: 'no-store' });
    if (res.status === 401) { router.push('/login'); return; }
    const x = await res.json();
    if (!res.ok) { setError(x.error || 'Document not found.'); return; }
    if (x.status === 'draft') { router.replace(`/account/documents/${id}/edit`); return; }
    setD(x);
  }, [id, router]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!d || !['sent', 'finalizing'].includes(d.status)) return;
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [d, load]);

  async function act(action, confirmText) {
    if (confirmText && !confirm(confirmText)) return;
    setBusy(action); setNote('');
    const res = await fetch(`/api/sign/docs/${id}/action`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    const x = await res.json();
    setBusy('');
    if (!res.ok) { setNote(x.error || 'Something went wrong.'); return; }
    if (action === 'duplicate') { router.push(`/account/documents/${x.id}/edit`); return; }
    if (action === 'remind') setNote(`Reminder sent to ${x.reminded.join(', ')}.`);
    load();
  }

  async function remove() {
    if (!confirm('Delete this document and all its files? This cannot be undone.')) return;
    const res = await fetch(`/api/sign/docs/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/account/documents');
  }

  if (error) return <div className="max-w-xl mx-auto text-center py-20"><AlertTriangle className="w-10 h-10 mx-auto text-amber-500" /><p className="mt-3 font-semibold text-slate-900 dark:text-white">{error}</p><Link href="/account/documents" className="inline-block mt-4 text-indigo-600 dark:text-indigo-400 font-semibold">Back to documents</Link></div>;
  if (!d) return <div className="flex items-center justify-center py-24 text-slate-500 dark:text-slate-400"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...</div>;

  const st = STATUS[d.status] || STATUS.sent;
  const me = d.signers.find((s) => s.token && ['sent', 'viewed'].includes(s.status));
  const signedCount = d.signers.filter((s) => s.status === 'signed').length;
  const byId = Object.fromEntries(d.signers.map((s) => [s.id, s]));
  const btn = 'flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50';

  return (
    <div className="space-y-6">
      <Link href="/account/documents" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600"><ArrowLeft className="w-4 h-4" /> All documents</Link>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1 min-w-0">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 break-words">{d.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {d.fileName} · {d.pages} pages · {signedCount} of {d.signers.length} signed
              {d.status === 'sent' && d.expiresAt && ` · Expires ${new Date(d.expiresAt).toLocaleDateString()}`}
              {d.completedAt && ` · Completed ${new Date(d.completedAt).toLocaleString()}`}
            </p>
            <div className="h-2 mt-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden max-w-md"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${d.signers.length ? (signedCount / d.signers.length) * 100 : 0}%` }} /></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {me && <Link href={`/sign/${me.token}`} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"><PenLine className="w-4 h-4" /> Sign now</Link>}
            {d.status === 'completed' && <a href={`/api/sign/docs/${id}/file?type=final&download=1`} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"><Download className="w-4 h-4" /> Download signed PDF</a>}
            {d.status === 'sent' && <button onClick={() => act('remind')} disabled={!!busy} className={btn}>{busy === 'remind' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />} Remind</button>}
            <a href={`/api/sign/docs/${id}/file?type=original&download=1`} className={btn}><Download className="w-4 h-4" /> Original</a>
            <button onClick={() => act('duplicate')} disabled={!!busy} className={btn}><Copy className="w-4 h-4" /> Reuse</button>
            {d.status === 'sent' && <button onClick={() => act('void', 'Void this document? Signers will no longer be able to sign it.')} disabled={!!busy} className={btn}><Ban className="w-4 h-4" /> Void</button>}
            <button onClick={remove} className={`${btn} text-red-600 dark:text-red-400`} aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
        {note && <div className="mt-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 px-4 py-2.5 text-sm">{note}</div>}
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="min-w-0 order-2 lg:order-1">
          <PdfPages src={`/api/sign/docs/${id}/file?type=${d.status === 'completed' ? 'final' : 'original'}`} maxWidth={820} />
        </div>
        <aside className="space-y-5 order-1 lg:order-2 lg:sticky lg:top-24">
          <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Signers {d.ordered && <span className="text-xs font-normal text-slate-500">(in order)</span>}</h2>
            <ul className="mt-3 space-y-3">
              {d.signers.map((s, i) => {
                const ss = SIGNER_STATUS[s.status] || SIGNER_STATUS.pending;
                return (
                  <li key={s.id} className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: s.status === 'signed' ? '#10b981' : s.color }}>{d.ordered ? i + 1 : s.name.slice(0, 1).toUpperCase()}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">{s.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{s.email}</div>
                      <div className={`text-xs font-semibold mt-0.5 ${ss.cls}`}>{ss.label}{s.signedAt ? ` · ${new Date(s.signedAt).toLocaleString()}` : s.viewedAt ? ` · ${new Date(s.viewedAt).toLocaleString()}` : ''}</div>
                      {s.declinedReason && <div className="text-xs text-red-600 dark:text-red-400 mt-0.5">"{s.declinedReason}"</div>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
          <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Activity</h2>
            <ol className="mt-3 space-y-3 max-h-96 overflow-y-auto pr-1">
              {[...d.events].reverse().map((e) => {
                const [Icon, label] = EV[e.event] || [Clock, e.event];
                const who = e.signerId && byId[e.signerId] ? byId[e.signerId].name : ['completed', 'expired'].includes(e.event) ? 'Craftora' : 'You';
                return (
                  <li key={e.id} className="flex gap-3">
                    <Icon className="w-4 h-4 mt-0.5 text-indigo-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-slate-800 dark:text-slate-100"><span className="font-semibold">{who}</span> · {label}</div>
                      {e.detail && <div className="text-xs text-slate-500 dark:text-slate-400 break-words">{e.detail}</div>}
                      <div className="text-xs text-slate-400">{new Date(e.createdAt).toLocaleString()}{e.ip ? ` · ${e.ip}` : ''}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
          {d.status === 'completed' && (
            <section className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm text-emerald-900 dark:text-emerald-100">
              <div className="font-bold flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Certificate of completion included</div>
              <p className="mt-1">The signed PDF ends with a certificate listing every signer, timestamp, and IP address. Anyone can check a copy at <Link href="/verify-document" className="underline">craftora.dev/verify-document</Link>.</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
