'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import * as Lucide from 'lucide-react';

const STATUS = {
  safe: { label: 'Safe to send', color: '#0f9d76', bg: 'rgba(16,185,129,0.12)', icon: 'CircleCheck', desc: 'This address is valid and can receive email.' },
  risky: { label: 'Risky', color: '#c98a13', bg: 'rgba(201,138,19,0.14)', icon: 'TriangleAlert', desc: 'This address may work, but delivery is not guaranteed.' },
  invalid: { label: 'Invalid', color: '#e5484d', bg: 'rgba(229,72,77,0.12)', icon: 'CircleX', desc: 'This address cannot receive email.' },
  unknown: { label: 'Unknown', color: '#8b93a7', bg: 'rgba(139,147,167,0.14)', icon: 'CircleHelp', desc: 'The mail server did not respond clearly.' },
};

function Detail({ label, value, good }) {
  const color = good === true ? '#0f9d76' : good === false ? '#e5484d' : 'var(--muted)';
  return (
    <div className="flex items-center justify-between py-2.5 border-b surface last:border-0">
      <span className="text-sm muted">{label}</span>
      <span className="text-sm font-semibold inline-flex items-center gap-1.5" style={{ color }}>
        {good === true && <Lucide.Check className="w-4 h-4" />}
        {good === false && <Lucide.X className="w-4 h-4" />}
        {value}
      </span>
    </div>
  );
}

export default function EmailVerifierTool() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(null);
  const [error, setError] = useState('');

  async function verify() {
    setError('');
    const e = email.trim().toLowerCase();
    if (!e) { setError('Enter an email address.'); return; }
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch('/api/tools/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error); setRunning(false); return; }
      setResult(data.result);
      if (typeof data.remaining === 'number') setRemaining(data.remaining);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setRunning(false);
  }

  if (status === 'loading') {
    return <div className="border surface rounded-2xl p-8 text-center muted" style={{ background: 'var(--surface)' }}>Loading...</div>;
  }
  if (!session?.user) {
    return (
      <div className="border surface rounded-2xl p-8 text-center" style={{ background: 'var(--surface)' }}>
        <Lucide.Lock className="w-8 h-8 mx-auto mb-4 brand-text" />
        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>Sign in to verify emails</h3>
        <p className="muted text-sm mb-5 max-w-md mx-auto">A free account gives you 50 email checks per day. This keeps the tool fast and free for everyone.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="rounded-xl px-5 py-2.5 font-bold text-sm" style={{ background: 'var(--brand)', color: '#fff' }}>Sign in</Link>
          <Link href="/signup" className="rounded-xl px-5 py-2.5 font-semibold text-sm border surface" style={{ color: 'var(--ink)' }}>Create account</Link>
        </div>
      </div>
    );
  }

  const st = result ? (STATUS[result.status] || STATUS.unknown) : null;
  const StIcon = st ? (Lucide[st.icon] || Lucide.CircleHelp) : null;
  const d = result?.details || {};

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Email address</label>
        {remaining !== null && <span className="muted text-sm">{remaining >= 999999 ? 'Unlimited (admin)' : `${remaining} checks left today`}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') verify(); }}
          placeholder="name@example.com"
          className="flex-1 min-w-0 border surface rounded-xl px-4 py-3 text-sm bg-transparent font-mono"
          style={{ color: 'var(--ink)' }}
          inputMode="email"
        />
        <button onClick={verify} disabled={running} className="rounded-xl px-6 py-3 font-bold text-sm inline-flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
          {running ? <><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Checking...</> : <><Lucide.MailCheck className="w-4 h-4" /> Verify</>}
        </button>
      </div>

      {error && <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#e5484d' }}>{error}</div>}

      {result && st && (
        <div className="mt-6">
          {/* Big status banner */}
          <div className="rounded-2xl p-6 flex items-start gap-4" style={{ background: st.bg }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: st.color }}>
              <StIcon className="w-6 h-6" style={{ color: '#fff' }} />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-sm mb-1 truncate" style={{ color: 'var(--ink)' }}>{result.email}</p>
              <p className="font-extrabold text-xl" style={{ color: st.color }}>{st.label}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--ink)' }}>{result.reason || st.desc}</p>
              {result.flags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {result.flags.map((f) => (
                    <span key={f} className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-md" style={{ background: 'var(--surface)', color: st.color }}>{f}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detailed breakdown */}
          <div className="border surface rounded-2xl p-5 mt-4" style={{ background: 'var(--surface)' }}>
            <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--ink)' }}>Full breakdown</h3>
            <Detail label="Valid format" value={d.validSyntax ? 'Yes' : 'No'} good={d.validSyntax} />
            <Detail label="Domain accepts mail (MX)" value={d.acceptsMail ? 'Yes' : 'No'} good={d.acceptsMail} />
            <Detail label="Mailbox exists" value={d.deliverable === null ? 'Unknown' : d.deliverable ? 'Yes' : 'No'} good={d.deliverable} />
            <Detail label="Catch-all domain" value={d.catchAll ? 'Yes' : 'No'} good={d.catchAll === false ? true : d.catchAll === true ? false : null} />
            <Detail label="Disposable address" value={d.disposable ? 'Yes' : 'No'} good={d.disposable === false ? true : d.disposable === true ? false : null} />
            <Detail label="Role account (info@, etc.)" value={d.roleAccount ? 'Yes' : 'No'} good={d.roleAccount === false ? true : d.roleAccount === true ? false : null} />
            <Detail label="Full mailbox" value={d.fullInbox ? 'Yes' : 'No'} good={d.fullInbox === false ? true : d.fullInbox === true ? false : null} />
            {d.mxRecords?.length > 0 && (
              <div className="pt-3">
                <p className="text-sm muted mb-2">Mail servers (MX)</p>
                <div className="space-y-1">
                  {d.mxRecords.slice(0, 5).map((m, i) => <p key={i} className="text-xs font-mono" style={{ color: 'var(--ink)' }}>{m}</p>)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <p className="muted text-xs mt-6">The address is checked against its real mail server. No email is ever sent. Verify only addresses you have the right to check. For lists, use the Bulk Email Verifier.</p>
    </div>
  );
}
