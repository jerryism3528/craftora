'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import * as Lucide from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function ProfileInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session, status, update } = useSession();
  const [welcome, setWelcome] = useState(params.get('welcome') === '1');

  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (session?.user) {
      setUsername(session.user.username || session.user.name || '');
      setAvatarUrl(session.user.image || '');
    }
  }, [status, session, router]);

  async function saveProfile(e) {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setBusy(true);
    try {
      const res = await fetch('/api/account/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, avatarUrl }),
      });
      const data = await res.json();
      if (!data.ok) { setMsg({ type: 'error', text: data.error }); setBusy(false); return; }
      await update();
      setMsg({ type: 'ok', text: 'Profile updated.' });
    } catch (e) {
      setMsg({ type: 'error', text: 'Something went wrong.' });
    }
    setBusy(false);
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });
    if (pw.next !== pw.confirm) { setPwMsg({ type: 'error', text: 'New passwords do not match.' }); return; }
    setPwBusy(true);
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: pw.current, next: pw.next }),
      });
      const data = await res.json();
      if (!data.ok) { setPwMsg({ type: 'error', text: data.error }); setPwBusy(false); return; }
      setPwMsg({ type: 'ok', text: 'Password changed.' });
      setPw({ current: '', next: '', confirm: '' });
    } catch (e) {
      setPwMsg({ type: 'error', text: 'Something went wrong.' });
    }
    setPwBusy(false);
  }

  function handleAvatarFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 512 * 1024) { setMsg({ type: 'error', text: 'Image must be under 512 KB.' }); return; }
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result);
    reader.readAsDataURL(file);
  }

  if (status === 'loading') {
    return <div className="editorial-width px-4 py-20 text-center muted">Loading...</div>;
  }
  if (!session?.user) return null;

  const initial = (username || session.user.email || '?').charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto">
      {welcome && (
        <div className="rounded-2xl px-5 py-4 mb-6 flex items-center gap-3" style={{ background: 'var(--mint-soft)', color: 'var(--mint)' }}>
          <Lucide.PartyPopper className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold text-sm">Account created and verified!</p>
            <p className="text-sm">Welcome to Craftora. You are all set.</p>
          </div>
          <button onClick={() => setWelcome(false)} className="ml-auto shrink-0"><Lucide.X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>Your profile</h1>
        <div className="mt-3 flex flex-wrap gap-2"><a href="/account/seo" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold hover:soft-surface" style={{ color: 'var(--ink)' }}><Lucide.Gauge className="w-4 h-4" /> SEO Dashboard</a></div>
        <button onClick={() => signOut({ callbackUrl: '/' })} className="rounded-xl px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}>
          <Lucide.LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>

      {/* Profile card */}
      <div className="border surface rounded-2xl p-6 mb-6" style={{ background: 'var(--surface)' }}>
        <form onSubmit={saveProfile}>
          <div className="flex items-center gap-5 mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ background: 'var(--surface-soft)', color: 'var(--brand)' }}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-extrabold">{initial}</span>
              )}
            </div>
            <div>
              <label className="rounded-xl px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2 cursor-pointer" style={{ color: 'var(--ink)' }}>
                <Lucide.Upload className="w-4 h-4" /> Change avatar
                <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
              </label>
              <p className="muted text-xs mt-2">PNG or JPG, under 512 KB.</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Email</label>
            <input value={session.user.email} disabled className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent opacity-60 cursor-not-allowed" style={{ color: 'var(--ink)' }} />
            <p className="muted text-xs mt-1.5">Email cannot be changed.</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
          </div>

          {msg.text && <p className="text-sm mb-3" style={{ color: msg.type === 'ok' ? 'var(--mint)' : '#b3261e' }}>{msg.text}</p>}
          <button type="submit" disabled={busy} className="rounded-xl px-6 py-2.5 font-bold text-sm disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
            {busy ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Password card */}
      <div className="border surface rounded-2xl p-6" style={{ background: 'var(--surface)' }}>
        <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--ink)' }}>Change password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Current password</label>
            <input type="password" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>New password</label>
            <input type="password" required value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} placeholder="At least 8 characters" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Confirm new password</label>
            <input type="password" required value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
          </div>
          {pwMsg.text && <p className="text-sm" style={{ color: pwMsg.type === 'ok' ? 'var(--mint)' : '#b3261e' }}>{pwMsg.text}</p>}
          <button type="submit" disabled={pwBusy} className="rounded-xl px-6 py-2.5 font-bold text-sm disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
            {pwBusy ? 'Changing...' : 'Change password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div>
      <Header />
      <main className="editorial-width px-4 sm:px-7 py-10 sm:py-14">
        <Suspense fallback={null}>
          <ProfileInner />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
