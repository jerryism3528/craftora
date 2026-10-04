'use client';

import { useState } from 'react';
import * as Lucide from 'lucide-react';

const REASONS = [
  ['nudity', 'Nudity or sexual content'], ['violence', 'Violence or gore'], ['hate', 'Hate or harassment'],
  ['illegal', 'Illegal content'], ['copyright', 'Copyright violation'], ['spam', 'Spam or scam'], ['other', 'Other'],
];

export default function ReportButton({ type = 'image', code }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [state, setState] = useState('');
  const [msg, setMsg] = useState('');

  async function send() {
    if (!reason) { setMsg('Please choose a reason.'); return; }
    setState('sending'); setMsg('');
    try {
      const r = await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, code, reason, details }) });
      const d = await r.json();
      if (d.ok) setState('done'); else { setState(''); setMsg(d.error || 'Could not send the report.'); }
    } catch (e) { setState(''); setMsg('Network error.'); }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-semibold muted inline-flex items-center gap-1">
        <Lucide.Flag className="w-3.5 h-3.5" /> Report
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
            {state === 'done' ? (
              <div className="text-center">
                <Lucide.CircleCheck className="w-10 h-10 mx-auto mb-3" style={{ color: '#0f9d76' }} />
                <p className="font-bold" style={{ color: 'var(--ink)' }}>Thanks for reporting</p>
                <p className="muted text-sm mt-1">Our team will review it and remove it if it breaks our rules.</p>
                <button onClick={() => setOpen(false)} className="mt-5 rounded-xl px-5 py-2.5 font-bold text-sm" style={{ background: 'var(--brand)', color: '#fff' }}>Close</button>
              </div>
            ) : (
              <>
                <p className="font-extrabold text-lg mb-1" style={{ color: 'var(--ink)' }}>Report this {type === 'image' ? 'image' : 'link'}</p>
                <p className="muted text-sm mb-4">Tell us what's wrong. Reports are reviewed by our team.</p>
                <div className="space-y-2">
                  {REASONS.map(([v, l]) => (
                    <label key={v} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--ink)' }}>
                      <input type="radio" name="reason" checked={reason === v} onChange={() => setReason(v)} /> {l}
                    </label>
                  ))}
                </div>
                <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} placeholder="More details (optional)" className="mt-4 w-full rounded-lg border surface p-3 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
                {msg && <p className="text-sm mt-2" style={{ color: '#e5484d' }}>{msg}</p>}
                <div className="flex gap-2 mt-4 justify-end">
                  <button onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 font-semibold text-sm border surface" style={{ color: 'var(--ink)' }}>Cancel</button>
                  <button onClick={send} disabled={state === 'sending'} className="rounded-xl px-5 py-2.5 font-bold text-sm disabled:opacity-60" style={{ background: '#e5484d', color: '#fff' }}>
                    {state === 'sending' ? 'Sending...' : 'Send report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
