'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useApi, useDebounced, Card, Table, Tabs, Loading, ErrorBox, Empty, Pager, inputCls, fmtDate } from './ui';

export default function ActivitySection({ tools }) {
  const [type, setType] = useState('usage');
  const [tool, setTool] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounced(q);
  useEffect(() => { setPage(1); }, [type, tool, dq]);
  const { data, error, loading } = useApi(`/api/admin/activity?type=${type}&tool=${tool}&q=${encodeURIComponent(dq)}&page=${page}`);
  const logs = data?.logs || [];
  return (
    <Card>
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
        <Tabs value={type} onChange={setType} items={[['usage', 'Tool usage'], ['admin', 'Admin actions']]} />
        <div className="flex gap-2 lg:ml-auto">
          {type === 'usage' && <select value={tool} onChange={(e) => setTool(e.target.value)} className={`${inputCls} w-48`} aria-label="Tool"><option value="">All tools</option>{tools.filter((t) => t.engine === 'server').map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}</select>}
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={type === 'usage' ? 'Email or IP' : 'Action, target, or admin'} className={`${inputCls} pl-9 w-56`} /></div>
        </div>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      {loading && !data ? <Loading /> : (
        <>
          {type === 'usage' ? (
            <Table head={['When', 'User', 'Tool', { label: 'Amount', right: true }, 'IP']}>
              {logs.map((l, i) => (
                <tr key={i}>
                  <td className="py-2 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{fmtDate(l.created_at, true)}</td>
                  <td className="py-2 px-3">{l.email || <span className="text-slate-400">guest</span>}</td>
                  <td className="py-2 px-3 font-semibold">{l.tool_slug}</td>
                  <td className="py-2 px-3 text-right">{l.amount}</td>
                  <td className="py-2 px-3 font-mono text-xs text-slate-500 dark:text-slate-400">{l.ip}</td>
                </tr>
              ))}
            </Table>
          ) : (
            <Table head={['When', 'Admin', 'Action', 'Target', 'Details']}>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="py-2 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{fmtDate(l.created_at, true)}</td>
                  <td className="py-2 px-3">{l.admin_email || 'system'}</td>
                  <td className="py-2 px-3 font-semibold">{l.action.replace(/_/g, ' ')}</td>
                  <td className="py-2 px-3">{l.target}</td>
                  <td className="py-2 px-3 text-xs text-slate-500 dark:text-slate-400 break-all max-w-xs">{l.detail ? JSON.stringify(l.detail) : ''}</td>
                </tr>
              ))}
            </Table>
          )}
          {!logs.length && <Empty>No activity found.</Empty>}
          <Pager page={page} pages={logs.length >= 100 ? page + 1 : page} onChange={setPage} />
        </>
      )}
    </Card>
  );
}
