'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import * as Lucide from 'lucide-react';

const STATUS = {
  safe: { label: 'Safe', color: '#0f9d76', bg: 'rgba(16,185,129,0.12)' },
  disposable: { label: 'Disposable', color: '#e5484d', bg: 'rgba(229,72,77,0.12)' },
  invalid: { label: 'Invalid', color: '#8b93a7', bg: 'rgba(139,147,167,0.14)' },
};

const BATCH = 100;

export default function DisposableDetectorTool() {
  const { data: session, status } = useSession();
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  function parseEmails(text) {
    return [...new Set(text.split(/[\s,;]+/).map((s) => s.trim().toLowerCase()).filter(Boolean))];
  }

  async function check() {
    setError('');
    const emails = parseEmails(input);
    if (emails.length === 0) { setError('Paste at least one email address.'); return; }

    setRunning(true);
    setResults([]);
    const collected = [];

    for (let i = 0; i < emails.length; i += BATCH) {
      const batch = emails.slice(i, i + BATCH);
      try {
        const res = await fetch('/api/tools/disposable-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails: batch }),
        });
        const data = await res.json();
        if (!data.ok) {
          setError(data.error);
          if (data.needLogin) { setRunning(false); return; }
          break;
        }
        collected.push(...data.results);
        setResults([...collected]);
        if (typeof data.remaining === 'number') setRemaining(data.remaining);
        if (data.skipped > 0) { setError('You have reached your daily limit. Some addresses were not checked.'); break; }
      } catch (e) {
        setError('Network error.');
        break;
      }
    }
    setRunning(false);
  }

  function downloadClean() {
    const clean = results.filter((r) => r.status === 'safe').map((r) => r.email);
    const content = clean.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'clean-emails.txt';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const counts = {
    safe: results.filter((r) => r.status === 'safe').length,
    disposable: results.filter((r) => r.status === 'disposable').length,
    invalid: results.filter((r) => r.status === 'invalid').length,
  };
  const shown = filter === 'all' ? results : results.filter((r) => r.status === filter);

  if (status === 'loading') {
    return <div className="border surface rounded-2xl p-8 text-center muted" style={{ background: 'var(--surface)' }}>Loading...</div>;
  }
  if (!session?.user) {
    return (
      <div className="border surface rounded-2xl p-8 text-center" style={{ background: 'var(--surface)' }}>
        <Lucide.Lock className="w-8 h-8 mx-auto mb-4 brand-text" />
        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>Sign in to detect disposable emails</h3>
        <p className="muted text-sm mb-5 max-w-md mx-auto">A free account lets you check up to 100 emails per day against a database of over 9,000 disposable domains.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="rounded-xl px-5 py-2.5 font-bold text-sm" style={{ background: 'var(--brand)', color: '#fff' }}>Sign in</Link>
          <Link href="/signup" className="rounded-xl px-5 py-2.5 font-semibold text-sm border surface" style={{ color: 'var(--ink)' }}>Create account</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Paste email addresses (one per line, or comma-separated)</label>
        {remaining !== null && <span className="muted text-sm">{remaining >= 999999 ? 'Unlimited (admin)' : `${remaining} checks left today`}</span>}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={7}
        placeholder={"john@gmail.com\ntemp@mailinator.com\nuser@yopmail.com"}
        className="w-full border surface rounded-xl p-4 text-sm bg-transparent font-mono"
        style={{ color: 'var(--ink)' }}
      />

      <div className="flex gap-3 mt-4">
        <button onClick={check} disabled={running} className="rounded-xl px-6 py-3 font-bold text-sm inline-flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
          {running ? <><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Checking...</> : <><Lucide.ShieldAlert className="w-4 h-4" /> Detect disposable</>}
        </button>
        {counts.safe > 0 && (
          <button onClick={downloadClean} className="rounded-xl px-5 py-3 font-semibold text-sm border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}>
            <Lucide.Download className="w-4 h-4" /> Download clean list
          </button>
        )}
      </div>

      {error && <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#c98a13' }}>{error}</div>}

      {results.length > 0 && (
        <div className="mt-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => setFilter('all')} className="rounded-lg px-3 py-1.5 text-sm font-semibold border surface" style={filter === 'all' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>All {results.length}</button>
            {['safe', 'disposable', 'invalid'].map((s) => (
              <button key={s} onClick={() => setFilter(s)} className="rounded-lg px-3 py-1.5 text-sm font-semibold border surface" style={filter === s ? { background: STATUS[s].color, color: '#fff', borderColor: STATUS[s].color } : { color: 'var(--ink)' }}>
                {STATUS[s].label} {counts[s]}
              </button>
            ))}
          </div>

          <div className="border surface rounded-xl overflow-hidden">
            {shown.map((r, i) => {
              const st = STATUS[r.status] || STATUS.invalid;
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b surface last:border-0">
                  <span className="text-sm font-mono flex-1 min-w-0 truncate" style={{ color: 'var(--ink)' }}>{r.email}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.role && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-soft)', color: 'var(--muted)' }}>role</span>}
                    <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="muted text-xs mt-6">Checked against a database of over 9,000 known disposable and temporary email domains. This checks the domain only, not whether the mailbox exists. To confirm deliverability, use the Email Verifier.</p>
    </div>
  );
}
