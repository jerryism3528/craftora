'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Crown, CalendarClock, AlertTriangle } from 'lucide-react';

const fmt = (d) => (d ? new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '');
const usd = (c) => `$${(Number(c || 0) / 100).toFixed(Number(c) % 100 ? 2 : 0)}`;
const STATUS = { ACTIVE: 'Active', CANCELLED: 'Cancelled', SUSPENDED: 'Payment problem', EXPIRED: 'Ended', APPROVED: 'Processing' };

export default function AccountBilling() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const r = await fetch('/api/billing/me', { cache: 'no-store' });
    if (r.status === 401) { router.push('/login?callbackUrl=%2Faccount%2Fbilling'); return; }
    const d = await r.json().catch(() => ({}));
    if (!d.ok) setError(d.error || 'Could not load billing.');
    else setData(d);
  }, [router]);
  useEffect(() => { load(); }, [load]);

  async function cancel(id, until) {
    if (!confirm(`Cancel your subscription? You keep your plan until ${fmt(until) || 'the end of the paid period'} and will not be charged again.`)) return;
    setBusy(id); setMsg('');
    const r = await fetch('/api/billing/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscriptionId: id }) });
    const d = await r.json().catch(() => ({}));
    setBusy('');
    setMsg(d.ok ? 'Your subscription is cancelled. You will not be charged again.' : d.error || 'Could not cancel. Please try again.');
    load();
  }

  if (error) return <p className="mt-6 text-red-600 dark:text-red-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{error}</p>;
  if (!data) return <p className="mt-6 text-slate-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading...</p>;

  const p = data.plan;
  const active = data.subscriptions.find((s) => s.status === 'ACTIVE');
  const box = 'rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5';

  return (
    <div className="mt-6 space-y-5">
      {msg && <p role="status" className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 px-4 py-3 text-sm">{msg}</p>}

      <section className={box}>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center"><Crown className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></span>
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Current plan</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">{p.name}</div>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">
          {p.key === 'free' ? 'You are on the free plan.' : p.lifetime ? 'Lifetime access. No renewals.' : active ? `Renews automatically. Next payment around ${fmt(active.paid_through)}.` : `Active until ${fmt(p.expiresAt)}.`}
        </p>
        {!active && !p.lifetime && <Link href="/pricing" className="inline-block mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 text-sm">{p.key === 'free' ? 'See plans' : 'Change plan'}</Link>}
        {active && active.plan_key === 'pro' && <Link href="/pricing" className="inline-block mt-4 rounded-xl border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-bold px-4 py-2.5 text-sm">Upgrade to Business</Link>}
      </section>

      <section className={box}>
        <h2 className="font-bold text-slate-900 dark:text-white">Subscriptions</h2>
        {data.subscriptions.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">No subscriptions yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700 mt-2">
            {data.subscriptions.map((s) => (
              <li key={s.paypal_subscription_id} className="py-3 flex flex-wrap items-center gap-3 justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white capitalize">{s.plan_key} {s.billing_interval === 'year' ? 'yearly' : 'monthly'} <span className="text-slate-500 dark:text-slate-400 font-normal">{usd(s.price_cents)}</span></div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" />
                    {STATUS[s.status] || s.status}
                    {s.status === 'ACTIVE' && s.paid_through ? `, next payment ${fmt(s.paid_through)}` : ''}
                    {s.status === 'CANCELLED' && s.plan_key === p.key && s.paid_through && new Date(s.paid_through) > new Date() ? `, access until ${fmt(s.paid_through)}` : ''}
                  </div>
                </div>
                {['ACTIVE', 'SUSPENDED'].includes(s.status) && (
                  <button type="button" disabled={!!busy} onClick={() => cancel(s.paypal_subscription_id, s.paid_through)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-1.5 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50">
                    {busy === s.paypal_subscription_id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Cancel subscription
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Payments are processed by PayPal. Receipts are sent by PayPal to your PayPal email. You can also manage this subscription in PayPal under Settings, Payments, Automatic payments.</p>
      </section>
    </div>
  );
}
