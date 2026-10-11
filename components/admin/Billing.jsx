'use client';

import { useState } from 'react';

function ProductRow({ p, onSave, busy }) {
  const [price, setPrice] = useState((p.price_cents / 100).toFixed(2));
  const [active, setActive] = useState(p.active);
  const dirty = price !== (p.price_cents / 100).toFixed(2) || active !== p.active;
  return (
    <tr>
      <td className="py-2 px-3 font-semibold">{p.name}</td>
      <td className="py-2 px-3 capitalize">{p.plan_key}</td>
      <td className="py-2 px-3">{p.months ? `${p.months} months` : 'Lifetime'}</td>
      <td className="py-2 px-3"><span className="inline-flex items-center gap-1">$<input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className="w-24 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-sm" aria-label={`Price for ${p.name}`} /></span></td>
      <td className="py-2 px-3"><label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />{active ? 'On sale' : 'Hidden'}</label></td>
      <td className="py-2 px-3 text-right"><Btn size="xs" tone="primary" disabled={!dirty} busy={busy} onClick={() => onSave({ key: p.key, price_cents: Math.round(Number(price) * 100), active })}>Save</Btn></td>
    </tr>
  );
}
import { CreditCard, Repeat, TrendingUp, Undo2, UserMinus, AlertTriangle, RefreshCw, Rocket, ExternalLink } from 'lucide-react';
import { useApi, post, useToast, Card, Stat, Badge, Btn, Table, Tabs, Toolbar, Loading, ErrorBox, Empty, fmtDate, ago, inputCls, useDebounced } from './ui';

const STATUS = { ACTIVE: 'emerald', APPROVAL_PENDING: 'slate', APPROVED: 'sky', SUSPENDED: 'amber', CANCELLED: 'slate', EXPIRED: 'slate' };
const usd = (c) => `$${(Number(c || 0) / 100).toFixed(2)}`;

export default function BillingSection() {
  const [tab, setTab] = useState('subs');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const dq = useDebounced(q);
  const { data, error, loading, reload } = useApi(`/api/admin/billing?status=${status}&q=${encodeURIComponent(dq)}`);
  const [toast, show] = useToast();
  const [busy, setBusy] = useState('');

  async function act(action, extra = {}, confirmText) {
    if (confirmText && !confirm(confirmText)) return;
    setBusy(action + (extra.id || ''));
    const r = await post('/api/admin/billing', { action, ...extra });
    setBusy('');
    show(r);
    reload();
  }

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox>{error}</ErrorBox>;
  const s = data.stats || {};
  const missing = data.plans.filter((p) => p.active && !p.paypal_plan_id).length;

  return (
    <div className="space-y-6">
      {toast}
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={data.mode === 'live' ? 'emerald' : 'amber'}>PayPal {data.mode === 'live' ? 'LIVE' : 'SANDBOX (test mode)'}</Badge>
        {!data.configured && <Badge tone="red">PayPal keys missing in .env</Badge>}
        {!data.webhookSet && <Badge tone="red">PAYPAL_WEBHOOK_ID missing</Badge>}
        {s.event_errors > 0 && <Badge tone="red">{s.event_errors} webhook errors</Badge>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat icon={Repeat} label="Active subscriptions" value={s.active || 0} tone="indigo" />
        <Stat icon={TrendingUp} label="Monthly recurring" value={usd(s.mrr_cents)} sub="Yearly plans counted per month" tone="emerald" />
        <Stat icon={CreditCard} label="Paid, last 30 days" value={usd(s.revenue30_cents)} tone="teal" />
        <Stat icon={Undo2} label="Refunded, last 30 days" value={usd(s.refunds30_cents)} tone="amber" />
        <Stat icon={UserMinus} label="Cancelled, last 30 days" value={s.cancelled30 || 0} tone="red" />
      </div>

      <Card title="Prices and PayPal plans" action={<Btn tone="primary" busy={busy === 'setup_plans'} disabled={!data.configured || !missing} onClick={() => act('setup_plans', {}, `Create ${missing} plan(s) in PayPal ${data.mode}?`)}><Rocket className="w-4 h-4" />{missing ? `Create ${missing} plan(s) in PayPal` : 'All plans created'}</Btn>}>
        <Table head={['Plan', 'Billing', 'Price', 'PayPal plan ID', 'Status']}>
          {data.plans.map((p) => (
            <tr key={p.id}>
              <td className="py-2 px-3 font-semibold capitalize">{p.plan_key}</td>
              <td className="py-2 px-3">{p.billing_interval === 'year' ? 'Yearly' : 'Monthly'}</td>
              <td className="py-2 px-3">{usd(p.price_cents)}</td>
              <td className="py-2 px-3 font-mono text-xs">{p.paypal_plan_id || <span className="text-slate-400">not created</span>}</td>
              <td className="py-2 px-3">{p.paypal_plan_id ? <Badge tone="emerald">Ready</Badge> : <Badge tone="amber">Needs setup</Badge>}</td>
            </tr>
          ))}
        </Table>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Sandbox and live each have their own plans. After switching PAYPAL_MODE to live, come back here and create the live plans once.</p>
      </Card>

      <Card title="One-time products (Apple Pay, Google Pay, PayPal, card)">
        <Table head={['Product', 'Plan', 'Access', 'Price', 'Status', '']}>
          {(data.products || []).map((p) => <ProductRow key={p.key + p.price_cents + p.active} p={p} busy={busy === 'save_product' + p.key} onSave={(x) => act('save_product', { ...x, id: x.key })} />)}
        </Table>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Products marked On sale appear under "Prefer to pay once?" on the pricing page. Keep the Lifetime ones hidden until the Kickstarter campaign ends.</p>
      </Card>

      <Card>
        <Tabs value={tab} onChange={setTab} items={[['subs', 'Subscriptions', data.subscriptions.length], ['orders', 'One-time orders', (data.orders || []).length], ['payments', 'Payments', data.payments.length], ['events', 'Webhook events', data.events.length]]} />
        <div className="mt-4">
          {tab === 'subs' && (
            <>
              <Toolbar>
                <input className={inputCls + ' sm:max-w-xs'} placeholder="Search email or subscription ID" value={q} onChange={(e) => setQ(e.target.value)} />
                <select className={inputCls + ' sm:max-w-[200px]'} value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">All (except unfinished)</option>
                  {Object.keys(STATUS).map((k) => <option key={k} value={k}>{k.replace('_', ' ').toLowerCase()}</option>)}
                </select>
                <Btn onClick={() => act('sync_due')} busy={busy === 'sync_due'}><RefreshCw className="w-4 h-4" />Re-check renewals</Btn>
              </Toolbar>
              <Table head={['Customer', 'Plan', 'Status', 'Paid through', 'Started', { label: 'Actions', right: true }]} empty={!data.subscriptions.length && <Empty>No subscriptions yet.</Empty>}>
                {data.subscriptions.map((x) => (
                  <tr key={x.id}>
                    <td className="py-2 px-3"><div className="font-semibold">{x.user_email || x.payer_email || 'Unknown'}</div><div className="font-mono text-[11px] text-slate-500">{x.paypal_subscription_id}</div></td>
                    <td className="py-2 px-3 capitalize">{x.plan_key} <span className="text-xs text-slate-500">{x.billing_interval === 'year' ? 'yearly' : 'monthly'} {usd(x.price_cents)}</span></td>
                    <td className="py-2 px-3"><Badge tone={STATUS[x.status] || 'slate'}>{x.status.replace('_', ' ').toLowerCase()}</Badge></td>
                    <td className="py-2 px-3">{x.paid_through ? fmtDate(x.paid_through) : '-'}</td>
                    <td className="py-2 px-3">{ago(x.created_at)}</td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <Btn size="xs" busy={busy === 'sync' + x.paypal_subscription_id} onClick={() => act('sync', { id: x.paypal_subscription_id })}>Sync</Btn>{' '}
                      {['ACTIVE', 'SUSPENDED'].includes(x.status) && <Btn size="xs" tone="danger" busy={busy === 'cancel' + x.paypal_subscription_id} onClick={() => act('cancel', { id: x.paypal_subscription_id }, `Cancel ${x.paypal_subscription_id}? The customer keeps the plan until the paid period ends. Refunds are done in PayPal.`)}>Cancel</Btn>}
                    </td>
                  </tr>
                ))}
              </Table>
            </>
          )}
          {tab === 'orders' && (
            <Table head={['When', 'Customer', 'Product', 'Amount', 'Paid with', 'Status']} empty={!(data.orders || []).length && <Empty>No one-time orders yet.</Empty>}>
              {(data.orders || []).map((o) => (
                <tr key={o.id}>
                  <td className="py-2 px-3">{fmtDate(o.created_at, true)}</td>
                  <td className="py-2 px-3">{o.user_email || o.payer_email || '-'}</td>
                  <td className="py-2 px-3">{o.product_key}</td>
                  <td className="py-2 px-3 font-semibold">{usd(o.amount_cents)}</td>
                  <td className="py-2 px-3 capitalize">{(o.payment_source || '-').replace('_', ' ')}</td>
                  <td className="py-2 px-3"><Badge tone={o.status === 'COMPLETED' ? 'emerald' : 'red'}>{o.status.toLowerCase()}</Badge></td>
                </tr>
              ))}
            </Table>
          )}
          {tab === 'payments' && (
            <Table head={['When', 'Customer', 'Type', 'Amount', 'PayPal transaction']} empty={!data.payments.length && <Empty>No payments yet.</Empty>}>
              {data.payments.map((p) => (
                <tr key={p.id}>
                  <td className="py-2 px-3">{fmtDate(p.created_at, true)}</td>
                  <td className="py-2 px-3">{p.user_email || '-'}</td>
                  <td className="py-2 px-3">{p.kind === 'refund' ? <Badge tone="amber">refund</Badge> : <Badge tone="emerald">payment</Badge>}</td>
                  <td className="py-2 px-3 font-semibold">{p.kind === 'refund' ? '-' : ''}{usd(p.amount_cents)}</td>
                  <td className="py-2 px-3 font-mono text-xs">{p.paypal_txn_id}</td>
                </tr>
              ))}
            </Table>
          )}
          {tab === 'events' && (
            <Table head={['Received', 'Event', 'Resource', 'Result', '']} empty={!data.events.length && <Empty>No webhook events yet. PayPal sends them after the first checkout.</Empty>}>
              {data.events.map((e) => (
                <tr key={e.id}>
                  <td className="py-2 px-3">{ago(e.received_at)}</td>
                  <td className="py-2 px-3 font-mono text-xs">{e.event_type}</td>
                  <td className="py-2 px-3 font-mono text-xs">{e.resource_id}</td>
                  <td className="py-2 px-3">{e.processed ? <Badge tone="emerald">ok</Badge> : e.error ? <Badge tone="red" className="max-w-[260px] truncate" ><AlertTriangle className="w-3 h-3" />{e.error}</Badge> : <Badge>pending</Badge>}</td>
                  <td className="py-2 px-3 text-right">{!e.processed && e.error && <Btn size="xs" busy={busy === 'retry_event' + e.id} onClick={() => act('retry_event', { id: e.id })}>Retry</Btn>}</td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </Card>

      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        <ExternalLink className="w-3.5 h-3.5" />Refunds and disputes are handled in PayPal. After a refund, remove the plan from the customer in Users if needed.
      </p>
    </div>
  );
}
