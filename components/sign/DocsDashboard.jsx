'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileSignature, Upload, Loader2, AlertTriangle, Search, Clock, CheckCircle2, FilePen, Inbox, ShieldCheck, FileText, PenLine } from 'lucide-react';
import { STATUS } from './fieldTypes';

function ago(d) {
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.round(s / 86400)} days ago`;
  return new Date(d).toLocaleDateString();
}

export function UploadBox({ compact = false }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);

  async function upload(file) {
    setError('');
    if (!file) return;
    if (!(file.type === 'application/pdf' || /\.pdf$/i.test(file.name))) return setError('Please choose a PDF file.');
    if (file.size > 20 * 1024 * 1024) return setError('The PDF is larger than 20 MB.');
    setBusy(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/sign/docs', { method: 'POST', body: form });
      const d = await res.json();
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) { setError(d.error || 'Upload failed.'); setBusy(false); return; }
      router.push(`/account/documents/${d.id}/edit`);
    } catch { setError('Upload failed. Check your connection.'); setBusy(false); }
  }

  return (
    <div>
      <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); upload(e.dataTransfer.files?.[0]); }}
        className={`w-full rounded-2xl border-2 border-dashed ${over ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'} ${compact ? 'py-6' : 'py-12'} text-center hover:border-indigo-400 transition`}>
        {busy ? <Loader2 className="w-8 h-8 mx-auto text-indigo-500 animate-spin" /> : <Upload className="w-8 h-8 mx-auto text-indigo-500" />}
        <div className="font-bold text-slate-900 dark:text-white mt-2">{busy ? 'Uploading...' : 'Upload a PDF to sign'}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">Drag and drop or click. Up to 20 MB and 50 pages.</div>
      </button>
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
      {error && <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400"><AlertTriangle className="w-4 h-4" /> {error}</p>}
    </div>
  );
}

const TABS = [
  ['all', 'All'], ['action', 'Needs my signature'], ['sent', 'Waiting for others'], ['completed', 'Completed'], ['draft', 'Drafts'], ['closed', 'Declined and expired'],
];

export default function DocsDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/sign/docs', { cache: 'no-store' });
      if (res.status === 401) { router.push('/login'); return; }
      const d = await res.json();
      if (!res.ok) setError(d.error || 'Could not load documents.'); else setData(d);
    })().catch(() => setError('Could not load documents.'));
  }, [router]);

  const me = data?.user?.email?.toLowerCase();
  const needsMe = (d) => d.status === 'sent' && (d.signers || []).some((s) => s.email.toLowerCase() === me && ['sent', 'viewed'].includes(s.status));
  const docs = useMemo(() => {
    const list = data?.docs || [];
    const query = q.trim().toLowerCase();
    return list.filter((d) => {
      if (query && !d.title.toLowerCase().includes(query) && !(d.signers || []).some((s) => s.name.toLowerCase().includes(query) || s.email.includes(query))) return false;
      if (tab === 'all') return true;
      if (tab === 'action') return needsMe(d);
      if (tab === 'closed') return ['declined', 'expired', 'voided'].includes(d.status);
      return d.status === tab;
    });
  }, [data, tab, q]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <div className="max-w-xl mx-auto text-center py-20"><AlertTriangle className="w-10 h-10 mx-auto text-amber-500" /><p className="mt-3 font-semibold text-slate-900 dark:text-white">{error}</p></div>;
  if (!data) return <div className="flex items-center justify-center py-24 text-slate-500 dark:text-slate-400"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading your documents...</div>;

  const all = data.docs;
  const stats = [
    [PenLine, 'Needs my signature', all.filter(needsMe).length, 'action', 'text-indigo-600 dark:text-indigo-400'],
    [Clock, 'Waiting for others', all.filter((d) => d.status === 'sent').length, 'sent', 'text-amber-600 dark:text-amber-400'],
    [CheckCircle2, 'Completed', all.filter((d) => d.status === 'completed').length, 'completed', 'text-emerald-600 dark:text-emerald-400'],
    [FilePen, 'Drafts', all.filter((d) => d.status === 'draft').length, 'draft', 'text-slate-600 dark:text-slate-300'],
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">Craftora Sign</p>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Your documents</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Send PDFs for signature, track every signer, and download signed copies with a certificate.</p>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">{data.isAdmin ? 'Unlimited sends (admin)' : `${data.remaining} of ${data.dailyLimit} sends left today`}</div>
      </div>

      <UploadBox compact={all.length > 0} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(([Icon, label, n, t, cls]) => (
          <button key={t} onClick={() => setTab(t)} className={`text-left rounded-2xl border bg-white dark:bg-slate-800 p-4 hover:border-indigo-400 ${tab === t ? 'border-indigo-500' : 'border-slate-200 dark:border-slate-700'}`}>
            <Icon className={`w-5 h-5 ${cls}`} />
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{n}</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">{label}</div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-semibold ${tab === k ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{l}</button>
            ))}
          </div>
          <div className="relative md:ml-auto md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or signer" className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400" />
          </div>
        </div>
        {docs.length ? (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {docs.map((d) => {
              const st = STATUS[d.status] || STATUS.draft;
              const href = d.status === 'draft' ? `/account/documents/${d.id}/edit` : `/account/documents/${d.id}`;
              return (
                <li key={d.id}>
                  <Link href={href} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white truncate">{d.title}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                        {needsMe(d) && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">Your turn</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex -space-x-1.5">
                          {(d.signers || []).slice(0, 6).map((s, i) => (
                            <span key={i} title={`${s.name} (${s.status})`} className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-800 flex items-center justify-center text-[10px] font-bold text-white" style={{ background: s.status === 'signed' ? '#10b981' : s.color }}>{s.name.slice(0, 1).toUpperCase()}</span>
                          ))}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{d.signer_count ? `${d.signed_count} of ${d.signer_count} signed` : 'No signers yet'} · {d.pages} pages · {ago(d.updated_at)}</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">{d.status === 'draft' ? 'Continue' : needsMe(d) ? 'Sign' : 'View'}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-10 text-center">
            <Inbox className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="mt-2 text-slate-600 dark:text-slate-300">{all.length ? 'No documents in this view.' : 'No documents yet. Upload a PDF above to get started.'}</p>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          ['/sign-pdf', FileSignature, 'Sign a PDF yourself', 'Add your own signature, no emails'],
          ['/verify-document', ShieldCheck, 'Verify a signed PDF', 'Check a copy is authentic'],
          ['/merge-pdf', FileText, 'Merge PDF', 'Combine files before sending'],
        ].map(([href, Icon, name, sub]) => (
          <Link key={href} href={href} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:border-indigo-400">
            <Icon className="w-5 h-5 text-indigo-500" />
            <div className="font-semibold text-slate-900 dark:text-white mt-2 text-sm">{name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{sub}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
