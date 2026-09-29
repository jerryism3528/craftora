'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import * as Lucide from 'lucide-react';

const STATUS = {
  safe: { label: 'Safe', color: '#0f9d76', bg: 'rgba(16,185,129,0.12)' },
  risky: { label: 'Risky', color: '#c98a13', bg: 'rgba(201,138,19,0.14)' },
  invalid: { label: 'Invalid', color: '#e5484d', bg: 'rgba(229,72,77,0.12)' },
  unknown: { label: 'Unknown', color: '#8b93a7', bg: 'rgba(139,147,167,0.14)' },
};

const BATCH = 25;

export default function BulkEmailVerifierTool() {
  const { data: session, status } = useSession();
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [remaining, setRemaining] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  function parseEmails(text) {
    return [...new Set(text.split(/[\s,;]+/).map((s) => s.trim().toLowerCase()).filter(Boolean))];
  }

  async function verifyAll() {
    setError('');
    const emails = parseEmails(input);
    if (emails.length === 0) { setError('Paste at least one email address.'); return; }

    setRunning(true);
    setResults([]);
    setProgress({ done: 0, total: emails.length });
    const collected = [];

    for (let i = 0; i < emails.length; i += BATCH) {
      const batch = emails.slice(i, i + BATCH);
      try {
        const res = await fetch('/api/tools/verify-email-bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails: batch }),
        });
        const data = await res.json();
        if (!data.ok) {
          setError(data.error);
          if (data.needLogin) { setRunning(false); return; }
          break; // limit hit or error: stop
        }
        collected.push(...data.results);
        setResults([...collected]);
        setProgress({ done: Math.min(i + batch.length, emails.length), total: emails.length });
        if (typeof data.remaining === 'number') setRemaining(data.remaining);
        // If the server skipped some (daily limit), stop here.
        if (data.skipped > 0) { setError('You have reached your daily limit. Some addresses were not checked.'); break; }
      } catch (e) {
        setError('Network error during verification.');
        break;
      }
    }
    setRunning(false);
  }

  function downloadCsv() {
    const rows = [['Email', 'Status', 'Reason', 'Flags']];
    results.forEach((r) => rows.push([r.email, r.status, r.reason || '', (r.flags || []).join(' ')]));
    const csv = rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'craftora-bulk-verification.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const counts = {
    safe: results.filter((r) => r.status === 'safe').length,
    risky: results.filter((r) => r.status === 'risky').length,
    invalid: results.filter((r) => r.status === 'invalid').length,
    unknown: results.filter((r) => r.status === 'unknown').length,
  };
  const shown = filter === 'all' ? results : results.filter((r) => r.status === filter);
  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  if (status === 'loading') {
    return <div className="border surface rounded-2xl p-8 text-center muted" style={{ background: 'var(--surface)' }}>Loading...</div>;
  }
  if (!session?.user) {
    return (
      <div className="border surface rounded-2xl p-8 text-center" style={{ background: 'var(--surface)' }}>
        <Lucide.Lock className="w-8 h-8 mx-auto mb-4 brand-text" />
        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>Sign in to verify email lists</h3>
        <p className="muted text-sm mb-5 max-w-md mx-auto">A free account lets you verify up to 50 emails per day in batches. This keeps the tool fast and free for everyone.</p>
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
        <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Paste your email list (one per line, or comma-separated)</label>
        {remaining !== null && <span className="muted text-sm">{remaining >= 999999 ? 'Unlimited (admin)' : `${remaining} checks left today`}</span>}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={8}
        placeholder={"john@example.com\njane@company.com\nsales@business.com"}
        className="w-full border surface rounded-xl p-4 text-sm bg-transparent font-mono"
        style={{ color: 'var(--ink)' }}
      />
      <p className="muted text-xs mt-2">Processed in batches of {BATCH}. Free accounts get 50 checks per day.</p>

      <div className="flex gap-3 mt-4">
        <button onClick={verifyAll} disabled={running} className="rounded-xl px-6 py-3 font-bold text-sm inline-flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
          {running ? <><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : <><Lucide.Mail className="w-4 h-4" /> Verify list</>}
        </button>
        {results.length > 0 && (
          <button onClick={downloadCsv} className="rounded-xl px-5 py-3 font-semibold text-sm border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}>
            <Lucide.Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      {running && (
        <div className="mt-5">
          <div className="flex justify-between text-sm mb-1">
            <span className="muted">Verifying {progress.done} of {progress.total}</span>
            <span className="font-semibold" style={{ color: 'var(--brand)' }}>{pct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-soft)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--brand)' }} />
          </div>
        </div>
      )}

      {error && <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#c98a13' }}>{error}</div>}

      {results.length > 0 && (
        <div className="mt-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => setFilter('all')} className="rounded-lg px-3 py-1.5 text-sm font-semibold border surface" style={filter === 'all' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>All {results.length}</button>
            {['safe', 'risky', 'invalid', 'unknown'].map((s) => (
              <button key={s} onClick={() => setFilter(s)} className="rounded-lg px-3 py-1.5 text-sm font-semibold border surface" style={filter === s ? { background: STATUS[s].color, color: '#fff', borderColor: STATUS[s].color } : { color: 'var(--ink)' }}>
                {STATUS[s].label} {counts[s]}
              </button>
            ))}
          </div>

          <div className="border surface rounded-xl overflow-hidden">
            {shown.map((r, i) => {
              const st = STATUS[r.status] || STATUS.unknown;
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b surface last:border-0">
                  <span className="text-sm font-mono flex-1 min-w-0 truncate" style={{ color: 'var(--ink)' }}>{r.email}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.flags?.map((f) => <span key={f} className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-soft)', color: 'var(--muted)' }}>{f}</span>)}
                    <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="muted text-xs mt-6">Each address is checked against its real mail server. No email is ever sent. Verify only lists you have the right to check.</p>
    </div>
  );
}
