'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import * as Lucide from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const justVerified = params.get('verified') === '1';
  const justReset = params.get('reset') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError('Incorrect email or password, or your email is not confirmed yet.');
      setBusy(false);
      return;
    }
    router.push('/profile');
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="border surface rounded-2xl p-7 sm:p-8" style={{ background: 'var(--surface)' }}>
        <h1 className="font-extrabold text-2xl mb-1" style={{ color: 'var(--ink)' }}>Sign in</h1>
        <p className="muted text-sm mb-6">Welcome back to Craftora.</p>

        {justVerified && (
          <div className="rounded-xl px-4 py-3 text-sm mb-5 inline-flex items-center gap-2 w-full" style={{ background: 'var(--mint-soft)', color: 'var(--mint)' }}>
            <Lucide.CheckCircle2 className="w-4 h-4" /> Email confirmed. You can sign in now.
          </div>
        )}
        {justReset && (
          <div className="rounded-xl px-4 py-3 text-sm mb-5 inline-flex items-center gap-2 w-full" style={{ background: 'var(--mint-soft)', color: 'var(--mint)' }}>
            <Lucide.CheckCircle2 className="w-4 h-4" /> Password reset. Sign in with your new password.
          </div>
        )}

        <button type="button" onClick={() => signIn('google', { callbackUrl: '/profile' })} className="w-full rounded-xl px-6 py-3 font-bold text-sm border surface inline-flex items-center justify-center gap-2 mb-4" style={{ color: 'var(--ink)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
          <span className="muted text-xs">or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} placeholder="you@example.com" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Password</label>
              <Link href="/forgot-password" className="brand-text text-sm font-semibold">Forgot?</Link>
            </div>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border surface px-4 py-2.5 pr-11 text-sm bg-transparent" style={{ color: 'var(--ink)' }} placeholder="Your password" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-2.5 muted" aria-label="Toggle password">
                {showPw ? <Lucide.EyeOff className="w-5 h-5" /> : <Lucide.Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm" style={{ color: '#b3261e' }}>{error}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-xl px-6 py-3 font-bold text-sm disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
            {busy ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="muted text-sm mt-5 text-center">New to Craftora? <Link href="/signup" className="brand-text font-semibold">Create an account</Link></p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div>
      <Header />
      <main className="editorial-width px-4 sm:px-7 py-12 sm:py-16">
        <Suspense fallback={null}>
          <LoginInner />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
