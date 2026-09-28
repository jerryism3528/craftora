'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as Lucide from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState('request'); // 'request' | 'reset'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  async function requestCode(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error); setBusy(false); return; }
      setNote('If an account exists for that email, a reset code has been sent. Check your inbox.');
      setStep('reset');
    } catch (e) {
      setError('Something went wrong. Please try again.');
    }
    setBusy(false);
  }

  async function resetPassword(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error); setBusy(false); return; }
      router.push('/login?reset=1');
    } catch (e) {
      setError('Something went wrong. Please try again.');
    }
    setBusy(false);
  }

  return (
    <div>
      <Header />
      <main className="editorial-width px-4 sm:px-7 py-12 sm:py-16">
        <div className="max-w-md mx-auto">
          <div className="border surface rounded-2xl p-7 sm:p-8" style={{ background: 'var(--surface)' }}>
            {step === 'request' ? (
              <>
                <h1 className="font-extrabold text-2xl mb-1" style={{ color: 'var(--ink)' }}>Reset your password</h1>
                <p className="muted text-sm mb-6">Enter your email and we will send you a reset code.</p>
                <form onSubmit={requestCode} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} placeholder="you@example.com" />
                  </div>
                  {error && <p className="text-sm" style={{ color: '#b3261e' }}>{error}</p>}
                  <button type="submit" disabled={busy} className="w-full rounded-xl px-6 py-3 font-bold text-sm disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
                    {busy ? 'Sending...' : 'Send reset code'}
                  </button>
                </form>
                <p className="muted text-sm mt-5 text-center"><Link href="/login" className="brand-text font-semibold">Back to sign in</Link></p>
              </>
            ) : (
              <>
                <h1 className="font-extrabold text-2xl mb-1" style={{ color: 'var(--ink)' }}>Set a new password</h1>
                {note && <p className="muted text-sm mb-6">{note}</p>}
                <form onSubmit={resetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Reset code</label>
                    <input inputMode="numeric" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="w-full rounded-xl border surface px-4 py-3 text-center text-2xl font-mono tracking-[0.4em] bg-transparent" style={{ color: 'var(--ink)' }} placeholder="000000" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>New password</label>
                    <div className="relative">
                      <input type={showPw ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border surface px-4 py-2.5 pr-11 text-sm bg-transparent" style={{ color: 'var(--ink)' }} placeholder="At least 8 characters" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-2.5 muted" aria-label="Toggle password">
                        {showPw ? <Lucide.EyeOff className="w-5 h-5" /> : <Lucide.Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {error && <p className="text-sm" style={{ color: '#b3261e' }}>{error}</p>}
                  <button type="submit" disabled={busy} className="w-full rounded-xl px-6 py-3 font-bold text-sm disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
                    {busy ? 'Resetting...' : 'Reset password'}
                  </button>
                </form>
                <div className="flex items-center justify-between mt-5 text-sm">
                  <button onClick={() => { setStep('request'); setError(''); setNote(''); }} className="muted font-semibold">Back</button>
                  <button onClick={requestCode} disabled={busy} className="brand-text font-semibold">Resend code</button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
