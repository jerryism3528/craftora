'use client';

import { useEffect, useState } from 'react';
import { Search, Flag, Image as ImageIcon, Link2, Eye, EyeOff, Ban, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { useApi, post, useToast, useDebounced, Card, Table, Badge, Btn, Tabs, Loading, ErrorBox, Empty, Pager, inputCls, fmtNum, fmtBytes, ago, STATUS_TONE } from './ui';

export default function ModerationSection() {
  const [type, setType] = useState('reports');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounced(q);
  useEffect(() => { setPage(1); }, [type, status, dq]);
  useEffect(() => { setStatus(''); }, [type]);
  const { data, error, loading, reload } = useApi(`/api/admin/moderation?type=${type}&status=${status}&q=${encodeURIComponent(dq)}&page=${page}`);
  const [toast, show] = useToast();
  async function act(action, id, confirmText) {
    if (confirmText && !confirm(confirmText)) return;
    const r = await post('/api/admin/moderation', { action, id });
    show(r);
    if (r.ok !== false) reload();
  }
  const rc = Object.fromEntries((type === 'reports' && data?.counts ? data.counts : []).map((c) => [c.status, c.n]));
  const statusOpts = type === 'reports' ? [['', `Open (${rc.open || 0})`], ['resolved', 'Resolved'], ['dismissed', 'Dismissed'], ['all', 'All']]
    : type === 'images' ? [['', 'Live'], ['removed', 'Removed'], ['all', 'All']] : [['', 'Active'], ['disabled', 'Disabled'], ['all', 'All']];

  return (
    <Card>
      {toast}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
        <Tabs value={type} onChange={setType} items={[['reports', 'Abuse reports'], ['images', 'Hosted images'], ['links', 'Short links']]} />
        <div className="flex gap-2 lg:ml-auto">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} w-40`} aria-label="Status">{statusOpts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          {type !== 'reports' && <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={type === 'links' ? 'Code, URL, or email' : 'Code, file name, or email'} className={`${inputCls} pl-9 w-56`} /></div>}
        </div>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      {loading && !data ? <Loading /> : data && (
        <>
          {type === 'reports' && (data.rows.length ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {data.rows.map((r) => (
                <li key={r.id} className="py-4 flex flex-col md:flex-row gap-4">
                  {r.image && <img src={`/api/admin/moderation/image?id=${r.image.id}`} alt="Reported upload" className="w-full md:w-40 h-40 object-cover rounded-xl bg-slate-100 dark:bg-slate-900" loading="lazy" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Flag className="w-4 h-4 text-red-500" />
                      <span className="font-bold text-slate-900 dark:text-white">{r.reason}</span>
                      <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                      <Badge>{r.target_type} #{r.target_id}</Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{ago(r.created_at)}</span>
                    </div>
                    {r.details && <p className="text-sm text-slate-700 dark:text-slate-300 mt-1.5 break-words">{r.details}</p>}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Reported by {r.reporter_user || 'anonymous'}{r.reporter_ip && ` (${r.reporter_ip})`}</p>
                    {r.image && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Image {r.image.code} · {r.image.original_name} · {fmtNum(r.image.views)} views {r.image.removed && <Badge tone="red">removed</Badge>}</p>}
                    {r.link && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-all">Link {r.link.code} → <a href={r.link.url} target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 dark:text-indigo-400 hover:underline">{r.link.url}</a> · {fmtNum(r.link.clicks)} clicks {r.link.disabled && <Badge tone="red">disabled</Badge>}</p>}
                    {!r.image && !r.link && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">The reported item no longer exists.</p>}
                    {r.status === 'open' && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {r.image && !r.image.removed && <Btn size="xs" tone="danger" onClick={() => act('remove_image', r.image.id, 'Remove this image? It stops loading everywhere it is embedded.')}><EyeOff className="w-3.5 h-3.5" />Remove image</Btn>}
                        {r.link && !r.link.disabled && <Btn size="xs" tone="danger" onClick={() => act('disable_link', r.link.id, 'Disable this short link?')}><Ban className="w-3.5 h-3.5" />Disable link</Btn>}
                        <Btn size="xs" onClick={() => act('resolve_report', r.id)}><CheckCircle2 className="w-3.5 h-3.5" />Mark resolved</Btn>
                        <Btn size="xs" tone="ghost" onClick={() => act('dismiss_report', r.id)}><XCircle className="w-3.5 h-3.5" />Dismiss</Btn>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : <Empty>No reports here. Nice and quiet.</Empty>)}

          {type === 'images' && (data.rows.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {data.rows.map((i) => (
                <div key={i.id} className={`rounded-xl border overflow-hidden ${i.removed ? 'border-red-300 dark:border-red-800 opacity-70' : 'border-slate-200 dark:border-slate-700'}`}>
                  <img src={`/api/admin/moderation/image?id=${i.id}`} alt={i.original_name || i.code} className="w-full h-36 object-cover bg-slate-100 dark:bg-slate-900" loading="lazy" />
                  <div className="p-2.5 text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-100 truncate" title={i.original_name}>{i.original_name || i.code}</div>
                    <div className="text-slate-500 dark:text-slate-400 truncate">{i.email || 'guest'} · {ago(i.created_at)}</div>
                    <div className="text-slate-500 dark:text-slate-400">{fmtBytes(i.size_bytes)} · {fmtNum(i.views)} views</div>
                    <div className="mt-2">{i.removed
                      ? <Btn size="xs" onClick={() => act('restore_image', i.id)}><Eye className="w-3.5 h-3.5" />Restore</Btn>
                      : <Btn size="xs" tone="danger" onClick={() => act('remove_image', i.id, 'Remove this image?')}><EyeOff className="w-3.5 h-3.5" />Remove</Btn>}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <Empty>No images found.</Empty>)}

          {type === 'links' && (data.rows.length ? (
            <Table head={['Code', 'Destination', 'Owner', { label: 'Clicks', right: true }, 'Created', '']}>
              {data.rows.map((l) => (
                <tr key={l.id}>
                  <td className="py-2 px-3 font-mono font-semibold">{l.code}{l.disabled && <Badge tone="red" className="ml-1">off</Badge>}</td>
                  <td className="py-2 px-3 max-w-xs"><a href={l.url} target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 dark:text-indigo-400 hover:underline break-all inline-flex items-start gap-1">{l.url.length > 70 ? `${l.url.slice(0, 70)}...` : l.url}<ExternalLink className="w-3 h-3 mt-1 shrink-0" /></a></td>
                  <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{l.email || 'guest'}</td>
                  <td className="py-2 px-3 text-right">{fmtNum(l.clicks)}</td>
                  <td className="py-2 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{ago(l.created_at)}</td>
                  <td className="py-2 px-3 text-right">{l.disabled
                    ? <Btn size="xs" onClick={() => act('enable_link', l.id)}>Enable</Btn>
                    : <Btn size="xs" tone="danger" onClick={() => act('disable_link', l.id, 'Disable this short link?')}><Ban className="w-3.5 h-3.5" />Disable</Btn>}</td>
                </tr>
              ))}
            </Table>
          ) : <Empty>No links found.</Empty>)}
          <Pager page={page} pages={data.rows.length >= 40 ? page + 1 : page} onChange={setPage} />
        </>
      )}
    </Card>
  );
}
