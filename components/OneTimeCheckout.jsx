'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, Loader2, CheckCircle2, Zap, AlertTriangle, Bitcoin, ArrowRight } from 'lucide-react';
import PaymentMethods, { ONCE_METHODS } from './PaymentMethods';

const scripts = {};
function loadScript(src, attrs = {}) {
  if (scripts[src]) return scripts[src];
  scripts[src] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
    s.onload = () => resolve();
    s.onerror = () => { delete scripts[src]; reject(new Error('Could not load ' + src)); };
    document.head.appendChild(s);
  });
  return scripts[src];
}

const dollars = (c) => (Number(c || 0) / 100).toFixed(2);

async function apiCreate(product) {
  const r = await fetch('/api/billing/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product }) });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401) { window.location.href = '/login?callbackUrl=%2Fpricing'; throw new Error('Please sign in first.'); }
  if (!d.ok) throw new Error(d.error || 'Could not start checkout.');
  return d.id;
}
async function apiCapture(orderId) {
  const r = await fetch('/api/billing/order/capture', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) });
  const d = await r.json().catch(() => ({}));
  if (!d.ok) { const e = new Error(d.error || 'Payment failed.'); e.pending = d.pending; throw e; }
  return d;
}

function CryptoOption({ product, disabled }) {
  const [open, setOpen] = useState(false);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function go(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/billing/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product: product.key, method: 'crypto', firstName: first, lastName: last }) });
      const d = await r.json().catch(() => ({}));
      if (!d.ok || !d.redirect) throw new Error(d.error || 'Crypto payment is not available right now.');
      try { sessionStorage.setItem('craftora-crypto-order', d.id); } catch {}
      window.location.href = d.redirect;
    } catch (x) { setErr(x.message); setBusy(false); }
  }
  const inp = 'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white';
  if (!open) {
    return (
      <button type="button" disabled={disabled} onClick={() => setOpen(true)} className="w-full h-[45px] inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 dark:border-slate-600 font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50">
        <Bitcoin className="w-5 h-5 text-amber-500" />Pay with crypto
      </button>
    );
  }
  return (
    <form onSubmit={go} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
      <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2"><Bitcoin className="w-4 h-4 text-amber-500" />Pay with crypto through PayPal</p>
      <div className="grid grid-cols-2 gap-2">
        <input className={inp} placeholder="First name" aria-label="First name" value={first} onChange={(e) => setFirst(e.target.value)} required maxLength={60} autoComplete="given-name" />
        <input className={inp} placeholder="Last name" aria-label="Last name" value={last} onChange={(e) => setLast(e.target.value)} required maxLength={60} autoComplete="family-name" />
      </div>
      {err && <p className="text-xs text-red-600 dark:text-red-400">{err}</p>}
      <button type="submit" disabled={busy} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-4 py-2.5 text-sm disabled:opacity-60">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}Continue to crypto payment
      </button>
      <p className="text-[11px] text-slate-500 dark:text-slate-400">You will pay on PayPal with a supported coin or wallet. The price stays ${dollars(product.price_cents)} in USD.</p>
    </form>
  );
}

function UsdcOption({ product, disabled }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function go() {
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/billing/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product: product.key, method: 'usdc' }) });
      const d = await r.json().catch(() => ({}));
      if (r.status === 401) { window.location.href = '/login?callbackUrl=%2Fpricing'; return; }
      if (!d.ok || !d.redirect) throw new Error(d.error || 'USDC payments are not available right now.');
      window.location.href = d.redirect;
    } catch (x) { setErr(x.message); setBusy(false); }
  }
  return (
    <div>
      <button type="button" disabled={disabled || busy} onClick={go} className="w-full h-[45px] inline-flex items-center justify-center gap-2 rounded-md bg-[#0052FF] hover:bg-[#0045d8] text-white font-bold disabled:opacity-60">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#fff" /><text x="12" y="16.5" textAnchor="middle" fontSize="13" fontWeight="700" fill="#2775CA" fontFamily="Arial, sans-serif">$</text></svg>}
        Pay with USDC
      </button>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 text-center">Through Coinbase. Pay from Coinbase or any wallet with USDC on Base.</p>
      {err && <p className="text-xs text-red-600 dark:text-red-400 mt-1 text-center">{err}</p>}
    </div>
  );
}

function Modal({ product, clientId, mode, crypto, usdc, onClose }) {
  const ppRef = useRef(null);
  const gpRef = useRef(null);
  const apRef = useRef(null);
  const [state, setState] = useState({ step: 'loading' });
  const price = dollars(product.price_cents);

  useEffect(() => {
    let dead = false;
    const done = (d) => !dead && setState({ step: 'done', plan: d.plan });
    const fail = (e) => !dead && setState((s) => ({ ...s, step: e?.pending ? 'pending' : 'ready', error: e?.message || 'Payment failed. You were not charged.' }));

    (async () => {
      try {
        const q = new URLSearchParams({ 'client-id': clientId, components: 'buttons,applepay,googlepay', currency: 'USD', intent: 'capture' });
        if (mode !== 'live') q.set('buyer-country', 'US');
        await loadScript(`https://www.paypal.com/sdk/js?${q}`, { 'data-namespace': 'paypal' });
        if (dead) return;
        const paypal = window.paypal;

        // 1. PayPal, Venmo, Pay Later, and debit or credit card.
        await paypal.Buttons({
          style: { layout: 'vertical', shape: 'rect', label: 'pay', height: 45 },
          createOrder: () => apiCreate(product.key),
          onApprove: async (data) => { setState({ step: 'working' }); try { done(await apiCapture(data.orderID)); } catch (e) { fail(e); } },
          onError: (e) => fail(e),
        }).render(ppRef.current);
        if (!dead) setState({ step: 'ready' });

        // 2. Google Pay (Chrome, Android).
        try {
          await loadScript('https://pay.google.com/gp/p/js/pay.js');
          const gp = paypal.Googlepay();
          const cfg = await gp.config();
          const after = async (orderId) => {
            setState({ step: 'working' });
            try { await gp.initiatePayerAction({ orderId }); done(await apiCapture(orderId)); } catch (e) { fail(e); }
          };
          const client = new window.google.payments.api.PaymentsClient({
            environment: mode === 'live' ? 'PRODUCTION' : 'TEST',
            paymentDataCallbacks: {
              onPaymentAuthorized: async (paymentData) => {
                try {
                  const orderId = await apiCreate(product.key);
                  const { status } = await gp.confirmOrder({ orderId, paymentMethodData: paymentData.paymentMethodData });
                  if (status === 'PAYER_ACTION_REQUIRED') { setTimeout(() => after(orderId), 0); return { transactionState: 'SUCCESS' }; }
                  if (status !== 'APPROVED') throw new Error('Google Pay could not approve this payment.');
                  const d = await apiCapture(orderId);
                  setTimeout(() => done(d), 0);
                  return { transactionState: 'SUCCESS' };
                } catch (e) {
                  return { transactionState: 'ERROR', error: { intent: 'PAYMENT_AUTHORIZATION', message: e.message || 'Payment failed', reason: 'PAYMENT_DATA_INVALID' } };
                }
              },
            },
          });
          const ready = await client.isReadyToPay({ apiVersion: 2, apiVersionMinor: 0, allowedPaymentMethods: cfg.allowedPaymentMethods });
          if (ready.result && gpRef.current && !dead) {
            const btn = client.createButton({
              buttonColor: 'black', buttonType: 'pay', buttonSizeMode: 'fill',
              onClick: () => client.loadPaymentData({
                apiVersion: 2, apiVersionMinor: 0,
                allowedPaymentMethods: cfg.allowedPaymentMethods,
                merchantInfo: cfg.merchantInfo,
                transactionInfo: { countryCode: 'US', currencyCode: 'USD', totalPriceStatus: 'FINAL', totalPrice: price, totalPriceLabel: 'Total' },
                callbackIntents: ['PAYMENT_AUTHORIZATION'],
              }).catch(() => {}),
            });
            gpRef.current.appendChild(btn);
          }
        } catch (e) { console.warn('Google Pay not available:', e?.message); }

        // 3. Apple Pay (Safari on iPhone, iPad, Mac).
        try {
          if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
            await loadScript('https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js', { crossorigin: 'anonymous' });
            const ap = paypal.Applepay();
            const cfg = await ap.config();
            if (cfg.isEligible && apRef.current && !dead) {
              const btn = document.createElement('apple-pay-button');
              btn.setAttribute('buttonstyle', 'black');
              btn.setAttribute('type', 'buy');
              btn.setAttribute('locale', 'en-US');
              btn.style.cssText = 'display:block;width:100%;--apple-pay-button-width:100%;--apple-pay-button-height:45px;--apple-pay-button-border-radius:6px;';
              btn.addEventListener('click', () => {
                const session = new window.ApplePaySession(4, {
                  countryCode: cfg.countryCode,
                  merchantCapabilities: cfg.merchantCapabilities,
                  supportedNetworks: cfg.supportedNetworks,
                  currencyCode: 'USD',
                  requiredBillingContactFields: ['postalAddress'],
                  total: { label: 'Craftora', type: 'final', amount: price },
                });
                session.onvalidatemerchant = (ev) => {
                  ap.validateMerchant({ validationUrl: ev.validationURL, displayName: 'Craftora' })
                    .then((r) => session.completeMerchantValidation(r.merchantSession))
                    .catch(() => { session.abort(); fail(new Error('Apple Pay is not available right now. Please use another option.')); });
                };
                session.onpaymentauthorized = async (ev) => {
                  try {
                    const orderId = await apiCreate(product.key);
                    await ap.confirmOrder({ orderId, token: ev.payment.token, billingContact: ev.payment.billingContact });
                    const d = await apiCapture(orderId);
                    session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
                    done(d);
                  } catch (e) {
                    session.completePayment(window.ApplePaySession.STATUS_FAILURE);
                    fail(e);
                  }
                };
                session.begin();
              });
              apRef.current.appendChild(btn);
            }
          }
        } catch (e) { console.warn('Apple Pay not available:', e?.message); }
      } catch (e) {
        if (!dead) setState({ step: 'error', error: 'Could not load the payment options. Please refresh and try again.' });
      }
    })();
    return () => { dead = true; };
  }, [product, clientId, mode, price]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="otc-title" onClick={(e) => e.target === e.currentTarget && state.step !== 'working' && onClose()}>
      <div className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="otc-title" className="text-xl font-extrabold text-slate-900 dark:text-white">{product.name}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">${price} one-time payment. Does not renew.</p>
          </div>
          {state.step !== 'working' && <button type="button" onClick={onClose} aria-label="Close" className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-5 h-5" /></button>}
        </div>

        {state.step === 'done' ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-3">Welcome to {state.plan?.name}!</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{state.plan?.lifetime ? 'Your plan never expires.' : `Your plan is active until ${new Date(state.plan?.expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}.`}</p>
            <div className="flex justify-center gap-3 mt-5">
              <Link href="/all-tools" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 text-sm">Start using tools</Link>
              <Link href="/account/billing" className="rounded-xl border border-slate-300 dark:border-slate-600 font-bold px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100">View billing</Link>
            </div>
          </div>
        ) : state.step === 'pending' ? (
          <p className="mt-5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 p-4 text-sm">{state.error}</p>
        ) : (
          <>
            {state.error && <p role="alert" className="mt-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-3 py-2 text-sm flex gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />{state.error}</p>}
            {(state.step === 'loading' || state.step === 'working') && (
              <p className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Loader2 className="w-4 h-4 animate-spin" />{state.step === 'working' ? 'Completing your payment...' : 'Loading payment options...'}</p>
            )}
            <div className={`mt-5 space-y-3 ${state.step === 'working' ? 'pointer-events-none opacity-50' : ''}`}>
              <div ref={apRef} />
              <div ref={gpRef} className="h-[45px] empty:hidden" />
              <div ref={ppRef} className="rounded-lg bg-white p-1" />
              {usdc && state.step !== 'loading' && <UsdcOption product={product} disabled={state.step === 'working'} />}
              {crypto && state.step !== 'loading' && <CryptoOption product={product} disabled={state.step === 'working'} />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">Card, PayPal, Apple Pay and Google Pay are processed securely by PayPal{usdc ? ', USDC by Coinbase' : ''}. No PayPal account needed to pay by card. Apple Pay shows in Safari and Google Pay in Chrome when your device supports them. We email you 7 days before your plan ends.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OneTimeCheckout({ products, clientId, mode, loggedIn, crypto = false, usdc = false }) {
  const [open, setOpen] = useState(null);
  useEffect(() => {
    const onPay = (e) => {
      const p = (products || []).find((x) => x.key === e.detail?.product);
      if (!p) return;
      if (!loggedIn) { window.location.href = '/login?callbackUrl=%2Fpricing'; return; }
      setOpen(p);
    };
    window.addEventListener('craftora:pay-once', onPay);
    return () => window.removeEventListener('craftora:pay-once', onPay);
  }, [products, loggedIn]);
  if (!products?.length || !clientId) return null;
  return (
    <section id="pay-once" className="mt-12 scroll-mt-24" aria-labelledby="pay-once-title">
      <div className="text-center">
        <h2 id="pay-once-title" className="text-2xl font-extrabold text-slate-900 dark:text-white">Prefer to pay once?</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-2">No subscription. Pay with Apple Pay, Google Pay, PayPal, any card{usdc || crypto ? ', or crypto (USDC)' : ''}.</p>
        <PaymentMethods methods={usdc ? [...ONCE_METHODS, 'usdc'] : ONCE_METHODS} className="mt-4" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mt-6 max-w-3xl mx-auto">
        {products.map((p) => (
          <div key={p.key} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 flex items-center justify-between gap-4">
            <div>
              <div className="font-extrabold text-slate-900 dark:text-white">{p.name}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300"><span className="font-bold text-slate-900 dark:text-white">${dollars(p.price_cents).replace(/\.00$/, '')}</span> once{p.months ? `, ${p.months} month${p.months === 1 ? '' : 's'} of access` : ', never expires'}</div>
            </div>
            <button
              type="button"
              onClick={() => (loggedIn ? setOpen(p) : (window.location.href = '/login?callbackUrl=%2Fpricing'))}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-4 py-2.5 text-sm hover:opacity-90"
            >
              <Zap className="w-4 h-4" />{loggedIn ? 'Buy' : 'Sign in to buy'}
            </button>
          </div>
        ))}
      </div>
      {open && <Modal product={open} clientId={clientId} mode={mode} crypto={crypto} usdc={usdc} onClose={() => setOpen(null)} />}
    </section>
  );
}
