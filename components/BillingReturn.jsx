'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, PartyPopper, AlertTriangle } from 'lucide-react';

export default function BillingReturn() {
  const [state, setState] = useState({ step: 'checking' });

  useEffect(() => {
    let stop = false;
    const id = new URLSearchParams(window.location.search).get('subscription_id') || '';
    if (!/^I-[A-Z0-9]+$/.test(id)) { setState({ step: 'error', error: 'We could not find your subscription details in this link.' }); return; }
    (async () => {
      for (let i = 0; i < 6 && !stop; i++) {
        try {
          const r = await fetch('/api/billing/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscriptionId: id }) });
          const d = await r.json().catch(() => ({}));
          if (r.status === 401) { setState({ step: 'login' }); return; }
          if (d.ok && d.status === 'ACTIVE') { setState({ step: 'done', plan: d.plan, interval: d.interval }); return; }
          if (d.ok && ['CANCELLED', 'EXPIRED'].includes(d.status)) { setState({ step: 'error', error: 'This subscription was not completed. No payment was taken.' }); return; }
        } catch {}
        await new Promise((res) => setTimeout(res, 2500));
      }
      if (!stop) setState({ step: 'slow' });
    })();
    return () => { stop = true; };
  }, []);

  const box = 'rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center';
  if (state.step === 'checking') return <div className={box}><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-4">Confirming your subscription</h1><p className="text-slate-600 dark:text-slate-300 mt-2">This takes a few seconds. Please keep this page open.</p></div>;
  if (state.step === 'done') return (
    <div className={box}>
      <PartyPopper className="w-10 h-10 mx-auto text-indigo-600" />
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-4">Welcome to {state.plan?.name}!</h1>
      <p className="text-slate-600 dark:text-slate-300 mt-2">Your higher limits are active now. Thank you for supporting Craftora.</p>
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <Link href="/all-tools" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3">Start using tools</Link>
        <Link href="/account/billing" className="rounded-xl border border-slate-300 dark:border-slate-600 font-bold px-5 py-3 text-slate-800 dark:text-slate-100">View billing</Link>
      </div>
    </div>
  );
  if (state.step === 'login') return <div className={box}><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Please sign in</h1><p className="text-slate-600 dark:text-slate-300 mt-2">Sign in with the account you subscribed from. Your plan will be added automatically.</p><Link href="/login?callbackUrl=%2Faccount%2Fbilling" className="inline-block mt-6 rounded-xl bg-indigo-600 text-white font-bold px-5 py-3">Sign in</Link></div>;
  if (state.step === 'slow') return <div className={box}><Loader2 className="w-8 h-8 mx-auto text-amber-500" /><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-4">Almost there</h1><p className="text-slate-600 dark:text-slate-300 mt-2">PayPal is still processing your payment. Your plan will appear on your Billing page within a few minutes.</p><Link href="/account/billing" className="inline-block mt-6 rounded-xl bg-indigo-600 text-white font-bold px-5 py-3">Go to Billing</Link></div>;
  return <div className={box}><AlertTriangle className="w-8 h-8 mx-auto text-red-500" /><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-4">Something went wrong</h1><p className="text-slate-600 dark:text-slate-300 mt-2">{state.error}</p><Link href="/pricing" className="inline-block mt-6 rounded-xl bg-indigo-600 text-white font-bold px-5 py-3">Back to pricing</Link></div>;
}
