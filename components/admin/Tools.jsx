'use client';

import { useEffect, useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { useApi, post, useToast, Card, Table, Badge, Btn, Loading, ErrorBox, inputCls, fmtNum } from './ui';

function Row({ r, onSaved }) {
  const [f, setF] = useState(r);
  const [busy, setBusy] = useState(false);
  useEffect(() => setF(r), [r]);
  const dirty = ['daily_limit', 'batch_limit', 'anon_limit', 'enabled'].some((k) => String(f[k] ?? '') !== String(r[k] ?? ''));
  async function save() {
    setBusy(true);
    const res = await post('/api/admin/tools', { tool_slug: r.tool_slug, daily_limit: f.daily_limit, batch_limit: f.batch_limit ?? '', anon_limit: f.anon_limit, enabled: f.enabled });
    setBusy(false);
    onSaved(res);
  }
  return (
    <tr>
      <td className="py-2 px-3"><div className="font-semibold">{r.name}</div><div className="text-xs text-slate-500 dark:text-slate-400">{r.tool_slug}{r.status && r.status !== 'live' && <Badge tone="amber" className="ml-1">{r.status}</Badge>}</div></td>
      <td className="py-2 px-3"><input type="number" min="0" value={f.daily_limit} onChange={(e) => setF({ ...f, daily_limit: e.target.value })} className={`${inputCls} w-24 py-1`} aria-label={`${r.tool_slug} daily limit`} /></td>
      <td className="py-2 px-3"><input type="number" min="1" value={f.batch_limit ?? ''} placeholder="none" onChange={(e) => setF({ ...f, batch_limit: e.target.value })} className={`${inputCls} w-20 py-1`} aria-label={`${r.tool_slug} batch limit`} /></td>
      <td className="py-2 px-3"><input type="number" min="0" value={f.anon_limit} onChange={(e) => setF({ ...f, anon_limit: e.target.value })} className={`${inputCls} w-20 py-1`} aria-label={`${r.tool_slug} anonymous limit`} /></td>
      <td className="py-2 px-3">
        <button onClick={() => setF({ ...f, enabled: !f.enabled })} className={`relative w-10 h-6 rounded-full transition ${f.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} role="switch" aria-checked={!!f.enabled} aria-label={`${r.tool_slug} enabled`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${f.enabled ? 'left-[18px]' : 'left-0.5'}`} />
        </button>
      </td>
      <td className="py-2 px-3 text-right">{fmtNum(r.uses24h)}</td>
      <td className="py-2 px-3 text-right">{fmtNum(r.uses7d)}<div className="text-[11px] text-slate-400">{fmtNum(r.users7d)} users</div></td>
      <td className="py-2 px-3 text-right">{r.blocked ? <Badge tone="red">{r.blocked}</Badge> : <span className="text-slate-400">0</span>}</td>
      <td className="py-2 px-3 text-right"><Btn size="xs" tone={dirty ? 'primary' : 'default'} disabled={!dirty} busy={busy} onClick={save}><Save className="w-3.5 h-3.5" />Save</Btn></td>
    </tr>
  );
}

export default function ToolsSection() {
  const { data, error, loading, reload } = useApi('/api/admin/tools');
  const [toast, show] = useToast();
  const saved = (r) => { show(r); if (r.ok !== false) reload(); };
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox>{error}</ErrorBox>;
  return (
    <div className="space-y-6">
      {toast}
      <Card title="Server tool limits" action={<span className="text-xs text-slate-500 dark:text-slate-400">Base limits for Free. Pro and Business use the plan multiplier or their own limit.</span>}>
        <Table head={['Tool', 'Daily', 'Batch', 'Anonymous', 'On', { label: '24h', right: true }, { label: '7 days', right: true }, { label: 'Blocked users', right: true }, '']}>
          {data.rows.map((r) => <Row key={r.tool_slug} r={r} onSaved={saved} />)}
        </Table>
      </Card>
      {data.missing.length > 0 && (
        <Card title="Server tools without limits">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">These server tools have no limits row. Tools that check limits will show &quot;not available&quot; until you add one. Tools that do not use the limit system are not affected.</p>
          <div className="flex flex-wrap gap-2">
            {data.missing.map((t) => (
              <Btn key={t.slug} size="xs" onClick={async () => saved(await post('/api/admin/tools', { tool_slug: t.slug, daily_limit: 20, batch_limit: '', anon_limit: 0, enabled: true }))}><Plus className="w-3.5 h-3.5" />{t.name}</Btn>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
