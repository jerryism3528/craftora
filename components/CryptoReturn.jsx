'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, PartyPopper, Clock, AlertTriangle } from 'lucide-react';

export default function CryptoReturn() {
  const [s, setS] = useState({ step: 'checking' });

  useEffect(() => {
    let stop = false;
    let id = new URLSearchParams(window.location.search).get('token') || '';
    try { if (!id) id = sessionStorage.getItem('craftora-crypto-order') || ''; } catch {}
    if (!/^[A-Z0-9]{10,30}$/.test(id)) { setS({ step: 'error', error: 'We could not find your order in this link.' }); return; }
    (async () => {
      for (let i = 0; i < 8 && !stop; i++) {
        try {
          const r = await fetch('/api/billing/order/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: id }) });
          const d = await r.json().catch(() => ({}));
          if (r.status === 401) { setS({ step: 'login' }); return; }
          if (d.ok) { try { sessionStorage.removeItem('craftora-crypto-order'); } catch {} setS({ step: 'done', plan: d.plan }); return; }
          if (!d.pending) { setS({ step: 'error', error: d.error }); return; }
        } catch {}
        await new Promise((res) => setTimeout(res, 4000));
      }
      if (!stop) setS({ step: 'pending' });
    })();
    return () => { stop = true; };
  }, []);

  const box = 'rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center';
  const h = 'text-2xl font-extrabold text-slate-900 dark:text-white mt-4';
  const p = 'text-slate-600 dark:text-slate-300 mt-2';
  const btn = 'inline-block mt-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3';
  if (s.step === 'checking') return <div className={box}><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /><h1 className={h}>Confirming your crypto payment</h1><p className={p}>This can take up to a minute. Please keep this page open.</p></div>;
  if (s.step === 'done') return <div className={box}><PartyPopper className="w-10 h-10 mx-auto text-indigo-600" /><h1 className={h}>Welcome to {s.plan?.name}!</h1><p className={p}>Your crypto payment went through and your plan is active now.</p><Link href="/all-tools" className={btn}>Start using tools</Link></div>;
  if (s.step === 'pending') return <div className={box}><Clock className="w-8 h-8 mx-auto text-amber-500" /><h1 className={h}>Payment is being confirmed</h1><p className={p}>Crypto payments can take a few minutes to confirm on the network. Your plan will be added automatically, and you can check it on your Billing page.</p><Link href="/account/billing" className={btn}>Go to Billing</Link></div>;
  if (s.step === 'login') return <div className={box}><h1 className={h}>Please sign in</h1><p className={p}>Sign in with the account you paid from. Your plan is added automatically.</p><Link href="/login?callbackUrl=%2Faccount%2Fbilling" className={btn}>Sign in</Link></div>;
  return <div className={box}><AlertTriangle className="w-8 h-8 mx-auto text-red-500" /><h1 className={h}>Payment not completed</h1><p className={p}>{s.error || 'Something went wrong.'}</p><Link href="/pricing" className={btn}>Back to pricing</Link></div>;
}
