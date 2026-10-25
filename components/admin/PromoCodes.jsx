'use client';

import { useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import { useApi, post, useToast, Card, Table, Badge, Btn, Loading, ErrorBox, Empty, fmtDate, inputCls } from './ui';

const usd = (c) => `$${(Number(c || 0) / 100).toFixed(2)}`;

export default function PromoCodes() {
  const { data, error, loading, reload } = useApi('/api/admin/promo');
  const [toast, show] = useToast();
  const [busy, setBusy] = useState('');
  const [f, setF] = useState({ code: '', percent: 50, months: 3, max_uses: '', note: '' });

  async function act(body, key) {
    setBusy(key);
    const r = await post('/api/admin/promo', body);
    setBusy('');
    show(r);
    if (r.ok !== false) { reload(); if (!body.action) setF({ code: '', percent: 50, months: 3, max_uses: '', note: '' }); }
  }

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox>{error}</ErrorBox>;
  return (
    <Card title="Launch codes" action={<span className="text-xs text-slate-500 dark:text-slate-400">Percent off the first months, on subscriptions and one-time plans. One code per account.</span>}>
      {toast}
      <Table head={['Code', 'Discount', 'Paid', 'Started, not paid', { label: 'Revenue', right: true }, 'Note', 'Status', '']} empty={!data.codes.length && <Empty>No codes yet.</Empty>}>
        {data.codes.map((c) => (
          <tr key={c.code}>
            <td className="py-2 px-3 font-mono font-bold">{c.code}</td>
            <td className="py-2 px-3">{c.percent}% for {c.months} mo{c.max_uses ? <span className="text-xs text-slate-500"> (max {c.max_uses})</span> : null}</td>
            <td className="py-2 px-3 font-semibold">{c.paid}</td>
            <td className="py-2 px-3">{c.started}</td>
            <td className="py-2 px-3 text-right">{usd(c.revenue_cents)}</td>
            <td className="py-2 px-3 text-xs text-slate-500 dark:text-slate-400 max-w-[220px]">{c.note}</td>
            <td className="py-2 px-3">{c.active ? <Badge tone="emerald">on</Badge> : <Badge>off</Badge>}</td>
            <td className="py-2 px-3 text-right"><Btn size="xs" busy={busy === 't' + c.code} onClick={() => act({ action: 'toggle', code: c.code }, 't' + c.code)}>{c.active ? 'Turn off' : 'Turn on'}</Btn></td>
          </tr>
        ))}
      </Table>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Revenue is the first payment after the discount. For subscriptions it counts the whole discounted period.</p>

      <form onSubmit={(e) => { e.preventDefault(); act(f, 'new'); }} className="mt-5 grid sm:grid-cols-6 gap-2 items-end">
        <label className="sm:col-span-1 text-xs font-semibold text-slate-600 dark:text-slate-300">Code<input className={inputCls + ' mt-1 uppercase'} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="SPRING30" required /></label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">% off<input type="number" min="1" max="100" className={inputCls + ' mt-1'} value={f.percent} onChange={(e) => setF({ ...f, percent: e.target.value })} /></label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Months<input type="number" min="1" max="24" className={inputCls + ' mt-1'} value={f.months} onChange={(e) => setF({ ...f, months: e.target.value })} /></label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Max uses<input type="number" min="1" className={inputCls + ' mt-1'} value={f.max_uses} onChange={(e) => setF({ ...f, max_uses: e.target.value })} placeholder="no limit" /></label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Note<input className={inputCls + ' mt-1'} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Where it is used" /></label>
        <Btn tone="primary" busy={busy === 'new'} type="submit"><Plus className="w-4 h-4" />Add code</Btn>
      </form>

      {data.recent.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-bold mb-2 inline-flex items-center gap-1.5"><Tag className="w-4 h-4" />Recent uses</p>
          <Table head={['When', 'Customer', 'Code', 'Type', 'Paid', 'Status']}>
            {data.recent.map((r, i) => (
              <tr key={i}>
                <td className="py-2 px-3">{fmtDate(r.created_at, true)}</td>
                <td className="py-2 px-3">{r.email || '-'}</td>
                <td className="py-2 px-3 font-mono">{r.code}</td>
                <td className="py-2 px-3">{r.kind === 'order' ? 'one-time' : 'subscription'}</td>
                <td className="py-2 px-3">{usd(r.base_cents - r.discount_cents)} <span className="text-xs text-slate-500">({usd(r.discount_cents)} off)</span></td>
                <td className="py-2 px-3">{r.status === 'paid' ? <Badge tone="emerald">paid</Badge> : <Badge>checkout started</Badge>}</td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </Card>
  );
}
