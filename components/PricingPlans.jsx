'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, Loader2, Sparkles, ShieldCheck, Lock, X, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import PaymentMethods, { SUB_METHODS } from './PaymentMethods';
import { usePromo, promoOff } from './PromoCode';

let subSdk = null;
function loadSubSdk(clientId, mode) {
  if (subSdk) return subSdk;
  const q = new URLSearchParams({ 'client-id': clientId, vault: 'true', intent: 'subscription', components: 'buttons', 'disable-funding': 'credit' });
  if (mode !== 'live') q.set('buyer-country', 'US');
  subSdk = new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = `https://www.paypal.com/sdk/js?${q}`;
    el.async = true;
    el.setAttribute('data-namespace', 'paypalSub');
    el.onload = () => resolve(window.paypalSub);
    el.onerror = () => { subSdk = null; reject(new Error('Could not load PayPal.')); };
    document.head.appendChild(el);
  });
  return subSdk;
}

function SubscribeModal({ planKey, planName, interval, cents, promo, clientId, mode, usdc, onceProduct, onClose, onRedirect }) {
  const ref = useRef(null);
  const lastErr = useRef('');
  const [state, setState] = useState({ step: 'loading' });
  const price = dollars(cents);
  const promoCents = promo ? cents - (interval === 'year' ? promoOff(cents, 12, promo) : promoOff(cents, 1, { ...promo, months: 1 })) : null;

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const pp = await loadSubSdk(clientId, mode);
        if (dead || !ref.current) return;
        await pp.Buttons({
          style: { layout: 'vertical', shape: 'rect', label: 'subscribe', height: 45 },
          createSubscription: async () => {
            lastErr.current = '';
            const r = await fetch('/api/billing/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: planKey, interval, code: promo?.code || undefined }) });
            const d = await r.json().catch(() => ({}));
            if (r.status === 401) { window.location.href = `/login?callbackUrl=${encodeURIComponent('/pricing')}`; throw new Error('Please sign in first.'); }
            if (!d.ok || !d.id) { lastErr.current = d.error || 'Could not start checkout.'; throw new Error(lastErr.current); }
            return d.id;
          },
          onApprove: async (data) => {
            setState({ step: 'working' });
            for (let i = 0; i < 6; i++) {
              try {
                const r = await fetch('/api/billing/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscriptionId: data.subscriptionID }) });
                const d = await r.json().catch(() => ({}));
                if (d.ok && ['ACTIVE', 'APPROVED'].includes(d.status)) { if (!dead) setState({ step: 'done', plan: d.plan }); return; }
              } catch {}
              await new Promise((res) => setTimeout(res, 2500));
            }
            if (!dead) setState({ step: 'pending' });
          },
          onCancel: () => !dead && setState({ step: 'ready', error: 'Checkout was cancelled. No payment was made.' }),
          onError: () => !dead && setState({ step: 'ready', error: lastErr.current || 'PayPal could not complete the checkout. You were not charged. Please try again.' }),
        }).render(ref.current);
        if (!dead) setState({ step: 'ready' });
      } catch {
        if (!dead) setState({ step: 'error', error: 'Could not load the payment options.' });
      }
    })();
    return () => { dead = true; };
  }, [planKey, interval, clientId, mode, promo?.code]);

  const busy = state.step === 'working';
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="sub-title" onClick={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <div className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="sub-title" className="text-xl font-extrabold text-slate-900 dark:text-white">{planName}, {interval === 'year' ? 'yearly' : 'monthly'}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{promo ? <>{interval === 'year' ? `${dollars(promoCents)} for the first year` : `${dollars(promoCents)} a month for ${promo.months} months`} with code <b>{promo.code}</b>, then {price} per {interval}. Cancel any time.</> : <>{price} per {interval}. Renews automatically. Cancel any time.</>}</p>
          </div>
          {!busy && <button type="button" onClick={onClose} aria-label="Close" className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-5 h-5" /></button>}
        </div>

        {state.step === 'done' ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-3">Welcome to {state.plan?.name || planName}!</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Your subscription is active. You can manage or cancel it any time from Billing.</p>
            <div className="flex justify-center gap-3 mt-5">
              <Link href="/all-tools" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 text-sm">Start using tools</Link>
              <Link href="/account/billing" className="rounded-xl border border-slate-300 dark:border-slate-600 font-bold px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100">View billing</Link>
            </div>
          </div>
        ) : state.step === 'pending' ? (
          <div className="mt-5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 p-4 text-sm">
            PayPal approved your subscription and we are waiting for the first payment to clear. Your plan will be added automatically, usually within a few minutes. <Link href="/account/billing" className="font-bold underline">Check Billing</Link>
          </div>
        ) : (
          <>
            {state.error && <p role="alert" className="mt-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-3 py-2 text-sm flex gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />{state.error}</p>}
            {(state.step === 'loading' || busy) && <p className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Loader2 className="w-4 h-4 animate-spin" />{busy ? 'Activating your subscription...' : 'Loading payment options...'}</p>}
            <div ref={ref} className={`mt-5 rounded-lg bg-white p-1 ${busy ? 'pointer-events-none opacity-50' : ''}`} />
            <PaymentMethods methods={SUB_METHODS} className="mt-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">Pay with your PayPal account, or choose <b>Debit or Credit Card</b> to pay as a guest with no PayPal account. Processed securely by PayPal.</p>
            {onceProduct && (
              <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Prefer Google Pay, Apple Pay{usdc ? ' or USDC' : ''}?</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pay for {interval === 'year' ? '1 year' : '1 month'} once, with no auto-renewal. We email you before it ends.</p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('craftora:pay-once', { detail: { product: onceProduct } })); }}
                  className="mt-2 w-full rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-4 py-2.5 text-sm hover:opacity-90 disabled:opacity-60"
                >
                  Pay {promo ? dollars(cents - promoOff(cents, interval === 'year' ? 12 : 1, promo)) : price} once for {interval === 'year' ? '1 year' : '1 month'}
                </button>
              </div>
            )}
            {state.step !== 'loading' && !busy && (
              <button type="button" onClick={onRedirect} className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:underline"><ExternalLink className="w-3.5 h-3.5" />Buttons not working? Continue on PayPal's website</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const dollars = (c) => {
  const v = Number(c || 0) / 100;
  return Number.isInteger(v) ? `$${v}` : `$${v.toFixed(2)}`;
};

export default function PricingPlans({ prices, plans, rows, browserTools, loggedIn, current, clientId, mode, usdc = false, onceKeys = [] }) {
  const [period, setPeriod] = useState('month');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const promo = usePromo();

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

  function startCheckout(planKey) {
    setMsg(null);
    if (!loggedIn) { window.location.href = `/login?callbackUrl=${encodeURIComponent('/pricing')}`; return; }
    if (!clientId) { subscribe(planKey); return; }
    setCheckout({ planKey, interval: period });
  }

  async function subscribe(planKey, interval = period) {
    setMsg(null);
    if (!loggedIn) { window.location.href = `/login?callbackUrl=${encodeURIComponent('/pricing')}`; return; }
    setBusy(planKey);
    try {
      const r = await fetch('/api/billing/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: planKey, interval, code: promo?.code || undefined }) });
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
      'PDF and image tools: 5 uses a day each (3 without an account)',
      'Files up to 25 MB, always processed in your browser',
      'Unlimited text, developer and generator tools',
      ...rows.slice(0, 3).map((r) => `${r.free.toLocaleString()} ${r.short} a day`),
    ];
    const mult = plans[k]?.multiplier || 1;
    return [
      k === 'pro' ? 'Everything in Free' : 'Everything in Pro',
      `Unlimited PDF and image tools, files up to ${k === 'business' ? 500 : 200} MB`,
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
    const promoFirst = k !== 'free' && p && promo ? p.cents - (period === 'year' ? promoOff(p.cents, 12, promo) : promoOff(p.cents, 1, { ...promo, months: 1 })) : null;
    const promoPerMonth = promoFirst != null ? dollars(period === 'year' ? Math.round(promoFirst / 12) : promoFirst) : null;
    return (
      <section key={k} aria-labelledby={`plan-${k}`} className={`relative rounded-2xl border bg-white dark:bg-slate-800 p-6 flex flex-col ${featured ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg' : 'border-slate-200 dark:border-slate-700'}`}>
        {featured && <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-indigo-600 text-white text-xs font-bold px-3 py-1"><Sparkles className="w-3.5 h-3.5" />Most popular</span>}
        <h2 id={`plan-${k}`} className="text-xl font-extrabold text-slate-900 dark:text-white">{plans[k]?.name}</h2>
        <div className="mt-3 flex items-end gap-1">
          {promoPerMonth && <span className="text-xl font-bold text-slate-400 line-through mb-1 mr-1">{perMonth}</span>}
          <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{promoPerMonth || perMonth}</span>
          <span className="text-slate-500 dark:text-slate-400 mb-1">/month</span>
        </div>
        <p className={`text-sm h-5 ${promoPerMonth ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
          {k === 'free' ? 'Free forever' : p ? (promoPerMonth
            ? (period === 'year' ? `First year ${dollars(promoFirst)}, then ${dollars(p.cents)} a year` : `For ${promo.months} months, then ${dollars(p.cents)} a month`)
            : (period === 'year' ? `Billed ${dollars(p.cents)} once a year` : 'Billed monthly')) : ''}
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
            <button type="button" disabled={!ready || !!busy} onClick={() => startCheckout(k)} className={`w-full inline-flex items-center justify-center gap-2 rounded-xl font-bold px-4 py-3 disabled:opacity-60 ${featured ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'}`}>
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

      <PaymentMethods methods={SUB_METHODS} className="mt-6" label="Monthly and yearly plans: pay by card (no PayPal account needed) or PayPal" />
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <span className="inline-flex items-center gap-1"><Lock className="w-3.5 h-3.5" />Secure checkout processed by PayPal</span>
        <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" />Cancel any time</span>
        <a href="#pay-once" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Google Pay, Apple Pay{usdc ? ' or USDC' : ''}? Pay once below</a>
      </p>

      {checkout && (
        <SubscribeModal
          planKey={checkout.planKey}
          planName={plans[checkout.planKey]?.name}
          interval={checkout.interval}
          cents={prices[checkout.planKey]?.[checkout.interval]?.cents}
          promo={promo}
          clientId={clientId}
          mode={mode}
          usdc={usdc}
          onceProduct={(onceKeys || []).includes(`${checkout.planKey}-${checkout.interval === 'year' ? '1y' : '1m'}`) ? `${checkout.planKey}-${checkout.interval === 'year' ? '1y' : '1m'}` : null}
          onClose={() => setCheckout(null)}
          onRedirect={() => { const c = checkout; setCheckout(null); subscribe(c.planKey, c.interval); }}
        />
      )}
    </div>
  );
}
