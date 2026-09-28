'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import * as Lucide from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submitForm(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error); setBusy(false); return; }
      setStep('otp');
    } catch (e) {
      setError('Something went wrong. Please try again.');
    }
    setBusy(false);
  }

  async function submitOtp(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, code }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error); setBusy(false); return; }
      const signInRes = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      if (signInRes?.error) { router.push('/login?verified=1'); return; }
      router.push('/profile?welcome=1');
      router.refresh();
    } catch (e) {
      setError('Something went wrong. Please try again.');
    }
    setBusy(false);
  }

  async function resend() {
    setError('');
    setBusy(true);
    try {
      await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch (e) {}
    setBusy(false);
  }

  return (
    <div>
      <Header />
      <main className="editorial-width px-4 sm:px-7 py-12 sm:py-16">
        <div className="max-w-md mx-auto">
          <div className="border surface rounded-2xl p-7 sm:p-8" style={{ background: 'var(--surface)' }}>
            {step === 'form' ? (
              <>
                <h1 className="font-extrabold text-2xl mb-1" style={{ color: 'var(--ink)' }}>Create your account</h1>
                <p className="muted text-sm mb-6">Free account for Craftora server tools like the Email Verifier.</p>
                <button type="button" onClick={() => signIn('google', { callbackUrl: '/profile' })} className="w-full rounded-xl px-6 py-3 font-bold text-sm border surface inline-flex items-center justify-center gap-2 mb-4" style={{ color: 'var(--ink)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continue with Google
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
                  <span className="muted text-xs">or</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
                </div>
                <form onSubmit={submitForm} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Email</label>
                    <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Username</label>
                    <input required value={form.username} onChange={(e) => set('username', e.target.value)} className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} placeholder="3-20 characters" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Password</label>
                    <div className="relative">
                      <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={(e) => set('password', e.target.value)} className="w-full rounded-xl border surface px-4 py-2.5 pr-11 text-sm bg-transparent" style={{ color: 'var(--ink)' }} placeholder="At least 8 characters" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-2.5 muted" aria-label="Toggle password">
                        {showPw ? <Lucide.EyeOff className="w-5 h-5" /> : <Lucide.Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {error && <p className="text-sm" style={{ color: '#b3261e' }}>{error}</p>}
                  <button type="submit" disabled={busy} className="w-full rounded-xl px-6 py-3 font-bold text-sm disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
                    {busy ? 'Creating account...' : 'Create account'}
                  </button>
                </form>
                <p className="muted text-sm mt-5 text-center">Already have an account? <Link href="/login" className="brand-text font-semibold">Sign in</Link></p>
              </>
            ) : (
              <>
                <h1 className="font-extrabold text-2xl mb-1" style={{ color: 'var(--ink)' }}>Confirm your email</h1>
                <p className="muted text-sm mb-6">We sent a 6-digit code to <strong style={{ color: 'var(--ink)' }}>{form.email}</strong>. Enter it below.</p>
                <form onSubmit={submitOtp} className="space-y-4">
                  <input inputMode="numeric" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="w-full rounded-xl border surface px-4 py-3 text-center text-2xl font-mono tracking-[0.4em] bg-transparent" style={{ color: 'var(--ink)' }} placeholder="000000" />
                  {error && <p className="text-sm" style={{ color: '#b3261e' }}>{error}</p>}
                  <button type="submit" disabled={busy} className="w-full rounded-xl px-6 py-3 font-bold text-sm disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
                    {busy ? 'Confirming...' : 'Confirm email'}
                  </button>
                </form>
                <div className="flex items-center justify-between mt-5 text-sm">
                  <button onClick={() => { setStep('form'); setError(''); }} className="muted font-semibold">Back</button>
                  <button onClick={resend} disabled={busy} className="brand-text font-semibold">Resend code</button>
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
