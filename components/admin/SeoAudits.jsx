'use client';

import { useEffect, useState } from 'react';
import { Search, Trash2, Square, ExternalLink, EyeOff } from 'lucide-react';
import { useApi, post, useToast, useDebounced, Card, Table, Badge, Btn, Tabs, Loading, ErrorBox, Empty, Pager, inputCls, ago, STATUS_TONE } from './ui';

function scoreTone(s) { return s == null ? 'slate' : s >= 80 ? 'emerald' : s >= 50 ? 'amber' : 'red'; }

export default function SeoSection() {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounced(q);
  useEffect(() => { setPage(1); }, [status, dq]);
  const { data, error, loading, reload } = useApi(`/api/admin/seo?status=${status}&q=${encodeURIComponent(dq)}&page=${page}`);
  const [toast, show] = useToast();
  async function act(action, id, confirmText) {
    if (confirmText && !confirm(confirmText)) return;
    const r = await post('/api/admin/seo', { action, id });
    show(r);
    if (r.ok !== false) reload();
  }
  const c = Object.fromEntries((data?.counts || []).map((x) => [x.status, x.n]));
  return (
    <div className="space-y-6">
      {toast}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
          <Tabs value={status} onChange={setStatus} items={[['', 'All', Object.values(c).reduce((a, b) => a + b, 0)], ['running', 'Running', c.running || 0], ['done', 'Done', c.done || 0], ['failed', 'Failed', c.failed || 0]]} />
          <div className="relative lg:ml-auto"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Site or user email" className={`${inputCls} pl-9 lg:w-64`} /></div>
        </div>
        {error && <ErrorBox>{error}</ErrorBox>}
        {loading && !data ? <Loading /> : data && (
          <>
            <Table head={['Site', 'User', 'Status', { label: 'Score', right: true }, { label: 'Pages', right: true }, 'Issues', 'Started', '']}>
              {data.rows.map((a) => (
                <tr key={a.id}>
                  <td className="py-2 px-3"><div className="font-semibold">{a.site}</div>{a.error && <div className="text-xs text-red-600 dark:text-red-400 truncate max-w-xs" title={a.error}>{a.error}</div>}</td>
                  <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{a.email || 'deleted user'}</td>
                  <td className="py-2 px-3"><Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>{a.is_public && <Badge tone="sky" className="ml-1">shared</Badge>}</td>
                  <td className="py-2 px-3 text-right">{a.score != null ? <Badge tone={scoreTone(a.score)}>{a.score}</Badge> : ''}</td>
                  <td className="py-2 px-3 text-right">{a.pages ?? ''}</td>
                  <td className="py-2 px-3 text-xs whitespace-nowrap">{a.summary ? <span><span className="text-red-600 dark:text-red-400 font-semibold">{a.summary.critical}</span> / <span className="text-amber-600 dark:text-amber-400 font-semibold">{a.summary.warning}</span> / <span className="text-sky-600 dark:text-sky-400">{a.summary.notice}</span></span> : ''}</td>
                  <td className="py-2 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{ago(a.created_at)}<div className="text-[11px]">{a.seconds}s</div></td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    {a.is_public && <a href={`/seo-report/${a.id}`} target="_blank" rel="noreferrer" className="inline-flex p-1.5 text-slate-500 hover:text-indigo-600" title="Open shared report"><ExternalLink className="w-4 h-4" /></a>}
                    {a.is_public && <Btn size="xs" tone="ghost" title="Turn off share link" onClick={() => act('unpublish', a.id)}><EyeOff className="w-3.5 h-3.5" /></Btn>}
                    {a.status === 'running' && <Btn size="xs" tone="warn" onClick={() => act('stop', a.id, 'Mark this audit as stopped?')}><Square className="w-3.5 h-3.5" />Stop</Btn>}
                    <Btn size="xs" tone="ghost" title="Delete" onClick={() => act('delete', a.id, 'Delete this audit report?')}><Trash2 className="w-3.5 h-3.5" /></Btn>
                  </td>
                </tr>
              ))}
            </Table>
            {!data.rows.length && <Empty>No audits found.</Empty>}
            <Pager page={data.page} pages={data.pages} onChange={setPage} />
          </>
        )}
      </Card>
      {data?.topSites?.length > 0 && (
        <Card title="Most audited sites">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {data.topSites.map((s) => <div key={s.site} className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3"><div className="font-semibold text-sm text-slate-900 dark:text-white truncate">{s.site}</div><div className="text-xs text-slate-500 dark:text-slate-400">{s.n} audits · avg score {s.avg_score}</div></div>)}
          </div>
        </Card>
      )}
    </div>
  );
}
