'use client';

import { useEffect, useState } from 'react';
import { Search, Trash2, Ban, HardDrive, Sparkles } from 'lucide-react';
import { useApi, post, useToast, useDebounced, Card, Table, Badge, Btn, Tabs, Loading, ErrorBox, Empty, Pager, inputCls, ago, fmtBytes, fmtNum, STATUS_TONE } from './ui';

export default function DocsSection() {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const dq = useDebounced(q);
  useEffect(() => { setPage(1); }, [status, dq]);
  const { data, error, loading, reload } = useApi(`/api/admin/docs?status=${status}&q=${encodeURIComponent(dq)}&page=${page}`);
  const [toast, show] = useToast();

  async function act(action, id, confirmText) {
    if (confirmText && !confirm(confirmText)) return;
    const r = await post('/api/admin/docs', { action, id });
    show(r);
    if (r.ok !== false) reload();
  }
  async function cleanup() {
    const c = data.cleanup;
    if (!confirm(`Delete ${c.drafts} old drafts, ${c.closed} old voided, declined, or expired documents, and ${c.orphanFiles} leftover files (${fmtBytes(c.bytes)})? Completed documents are never touched.`)) return;
    setBusy(true);
    const r = await post('/api/admin/docs', { action: 'cleanup' });
    setBusy(false);
    show(r);
    reload();
  }

  const counts = Object.fromEntries((data?.counts || []).map((c) => [c.status, c]));
  const total = Object.values(counts).reduce((s, c) => s + c.n, 0);
  const c = data?.cleanup;

  return (
    <div className="space-y-6">
      {toast}
      {data && (
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
          <Card title={<span className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-indigo-500" />Storage</span>}>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{fmtBytes(data.disk.bytes)}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{fmtNum(data.disk.files)} PDF files for {fmtNum(total)} documents</div>
            <div className="flex flex-wrap gap-1.5 mt-3">{Object.values(counts).map((x) => <Badge key={x.status} tone={STATUS_TONE[x.status]}>{x.status} {x.n} · {fmtBytes(x.bytes)}</Badge>)}</div>
          </Card>
          <Card title={<span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-500" />Storage cleanup</span>}>
            <p className="text-sm text-slate-600 dark:text-slate-300">Runs automatically every night. Removes drafts untouched for {c.rules.draftDays} days, voided, declined, and expired documents after {c.rules.closedDays} days, and leftover files with no document. Completed documents are kept until the owner deletes them.</p>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              {[['Old drafts', c.drafts], ['Old closed docs', c.closed], ['Leftover files', c.orphanFiles]].map(([l, v]) => <div key={l} className="rounded-xl bg-slate-50 dark:bg-slate-900 p-2.5"><div className="font-extrabold text-slate-900 dark:text-white">{v}</div><div className="text-[11px] text-slate-500 dark:text-slate-400">{l}</div></div>)}
            </div>
            <div className="flex items-center justify-between gap-3 mt-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">Frees {fmtBytes(c.bytes)}</span>
              <Btn tone="primary" busy={busy} disabled={!c.drafts && !c.closed && !c.orphanFiles} onClick={cleanup}>Run cleanup now</Btn>
            </div>
          </Card>
        </div>
      )}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
          <Tabs value={status} onChange={setStatus} items={[['', 'All', total], ['sent', 'Waiting', counts.sent?.n || 0], ['completed', 'Completed', counts.completed?.n || 0], ['draft', 'Drafts', counts.draft?.n || 0], ['voided', 'Voided', counts.voided?.n || 0], ['declined', 'Declined', counts.declined?.n || 0], ['expired', 'Expired', counts.expired?.n || 0]]} />
          <div className="relative lg:ml-auto"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, owner email, or ID" className={`${inputCls} pl-9 lg:w-64`} /></div>
        </div>
        {error && <ErrorBox>{error}</ErrorBox>}
        {loading && !data ? <Loading /> : data && (
          <>
            <Table head={['Document', 'Owner', 'Status', 'Signers', { label: 'Size', right: true }, 'Updated', '']}>
              {data.rows.map((d) => (
                <tr key={d.id}>
                  <td className="py-2 px-3"><div className="font-semibold truncate max-w-xs">{d.title}</div><div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{d.id} · {d.pages} pages</div></td>
                  <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{d.owner}</td>
                  <td className="py-2 px-3"><Badge tone={STATUS_TONE[d.status]}>{d.status}</Badge></td>
                  <td className="py-2 px-3">{d.signed}/{d.signers}</td>
                  <td className="py-2 px-3 text-right">{fmtBytes(d.size_bytes)}</td>
                  <td className="py-2 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{ago(d.updated_at)}</td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    {d.status === 'sent' && <Btn size="xs" tone="warn" onClick={() => act('void', d.id, `Void "${d.title}"? Signers will no longer be able to sign it.`)}><Ban className="w-3.5 h-3.5" />Void</Btn>}
                    <Btn size="xs" tone="ghost" title="Delete" onClick={() => act('delete', d.id, `Delete "${d.title}" and its files permanently?`)}><Trash2 className="w-3.5 h-3.5" /></Btn>
                  </td>
                </tr>
              ))}
            </Table>
            {!data.rows.length && <Empty>No documents found.</Empty>}
            <Pager page={data.page} pages={data.pages} onChange={setPage} />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Document contents are private. Admins can void or delete documents but cannot open them here.</p>
          </>
        )}
      </Card>
    </div>
  );
}
