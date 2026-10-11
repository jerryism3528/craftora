'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Loader2, Sparkles, ShieldCheck, Lock } from 'lucide-react';

const dollars = (c) => {
  const v = Number(c || 0) / 100;
  return Number.isInteger(v) ? `$${v}` : `$${v.toFixed(2)}`;
};

export default function PricingPlans({ prices, plans, rows, browserTools, loggedIn, current }) {
  const [period, setPeriod] = useState('month');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get('checkout') === 'cancelled') setMsg({ text: 'Checkout was cancelled. No payment was made.' });
    } catch {}
  }, []);

  const save = (k) => {
    const m = prices[k]?.month?.cents, y = prices[k]?.year?.cents;
    return m && y ? Math.round((1 - y / (m * 12)) * 100) : 0;
  };
  const bestSave = Math.max(save('pro'), save('business'));

  async function subscribe(planKey) {
    setMsg(null);
    if (!loggedIn) { window.location.href = `/login?callbackUrl=${encodeURIComponent('/pricing')}`; return; }
    setBusy(planKey);
    try {
      const r = await fetch('/api/billing/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: planKey, interval: period }) });
      const d = await r.json().catch(() => ({}));
      if (r.status === 401) { window.location.href = `/login?callbackUrl=${encodeURIComponent('/pricing')}`; return; }
      if (!d.ok || !d.approveUrl) { setMsg({ text: d.error || 'Could not start checkout. Please try again.', error: true }); setBusy(''); return; }
      window.location.href = d.approveUrl;
    } catch {
      setMsg({ text: 'Could not reach the server. Please try again.', error: true });
      setBusy('');
    }
  }

  const bullets = (k) => {
    if (k === 'free') return [
      `All ${browserTools}+ browser tools, unlimited`,
      'No signup for browser tools, no watermarks',
      ...rows.slice(0, 3).map((r) => `${r.free.toLocaleString()} ${r.short} a day`),
    ];
    const mult = plans[k]?.multiplier || 1;
    return [
      k === 'pro' ? 'Everything in Free' : 'Everything in Pro',
      `Up to ${mult}x the free daily limits on server tools`,
      ...rows.map((r) => `${r[k].toLocaleString()} ${r.short} a day`),
      'Priority email support',
    ];
  };

  const card = (k, featured) => {
    const p = prices[k]?.[period];
    const isCurrent = current?.key === k;
    const ready = k === 'free' || !!p?.ready;
    const perMonth = k === 'free' ? '$0' : p ? dollars(period === 'year' ? Math.round(p.cents / 12) : p.cents) : '';
    return (
      <section key={k} aria-labelledby={`plan-${k}`} className={`relative rounded-2xl border bg-white dark:bg-slate-800 p-6 flex flex-col ${featured ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg' : 'border-slate-200 dark:border-slate-700'}`}>
        {featured && <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-indigo-600 text-white text-xs font-bold px-3 py-1"><Sparkles className="w-3.5 h-3.5" />Most popular</span>}
        <h2 id={`plan-${k}`} className="text-xl font-extrabold text-slate-900 dark:text-white">{plans[k]?.name}</h2>
        <div className="mt-3 flex items-end gap-1">
          <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{perMonth}</span>
          <span className="text-slate-500 dark:text-slate-400 mb-1">/month</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 h-5">
          {k === 'free' ? 'Free forever' : p ? (period === 'year' ? `Billed ${dollars(p.cents)} once a year` : 'Billed monthly') : ''}
        </p>
        <ul className="mt-5 space-y-2 text-sm text-slate-700 dark:text-slate-200 flex-1">
          {bullets(k).map((b) => <li key={b} className="flex gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{b}</li>)}
        </ul>
        <div className="mt-6">
          {k === 'free' ? (
            <Link href="/all-tools" className="block text-center rounded-xl border border-slate-300 dark:border-slate-600 font-bold px-4 py-3 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700">{current && current.key === 'free' ? 'Your current plan' : 'Use free tools'}</Link>
          ) : current && !isCurrent && current.key !== 'free' && (plans[current.key]?.rank || 0) > (plans[k]?.rank || 0) ? (
            <span className="block text-center rounded-xl border border-slate-200 dark:border-slate-700 font-bold px-4 py-3 text-slate-500 dark:text-slate-400">Included in your {plans[current.key]?.name} plan</span>
          ) : isCurrent ? (
            <Link href="/account/billing" className="block text-center rounded-xl border border-indigo-300 dark:border-indigo-700 font-bold px-4 py-3 text-indigo-700 dark:text-indigo-300">{current.lifetime ? 'You have lifetime ' + plans[k]?.name : 'Your current plan'}</Link>
          ) : (
            <button type="button" disabled={!ready || !!busy} onClick={() => subscribe(k)} className={`w-full inline-flex items-center justify-center gap-2 rounded-xl font-bold px-4 py-3 disabled:opacity-60 ${featured ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'}`}>
              {busy === k && <Loader2 className="w-4 h-4 animate-spin" />}
              {!ready ? 'Coming soon' : loggedIn ? `Get ${plans[k]?.name}` : `Sign in to get ${plans[k]?.name}`}
            </button>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="mt-10">
      <div className="flex justify-center">
        <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1" role="group" aria-label="Billing period">
          {[['month', 'Monthly'], ['year', 'Yearly']].map(([k, label]) => (
            <button key={k} type="button" aria-pressed={period === k} onClick={() => setPeriod(k)} className={`px-4 py-2 rounded-lg text-sm font-bold ${period === k ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}>
              {label}{k === 'year' && bestSave > 0 && <span className={`ml-1.5 text-xs ${period === k ? 'text-indigo-100' : 'text-emerald-600 dark:text-emerald-400'}`}>save {bestSave}%</span>}
            </button>
          ))}
        </div>
      </div>

      {msg && <p role="status" className={`mt-5 text-center text-sm font-semibold ${msg.error ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>{msg.text}</p>}

      <div className="grid md:grid-cols-3 gap-5 mt-8">
        {card('free')}
        {card('pro', true)}
        {card('business')}
      </div>

      <p className="mt-5 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <span className="inline-flex items-center gap-1"><Lock className="w-3.5 h-3.5" />Secure checkout with PayPal, card or PayPal balance</span>
        <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" />Cancel any time</span>
      </p>
    </div>
  );
}
