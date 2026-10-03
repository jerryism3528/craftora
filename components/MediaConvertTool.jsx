'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import * as Lucide from 'lucide-react';

const MAX_MB = 100;

function Segment({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([v, l]) => (
        <button key={v} type="button" onClick={() => onChange(v)} className="rounded-lg px-3.5 py-2 text-sm font-semibold border surface"
          style={value === v ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>
          {l}
        </button>
      ))}
    </div>
  );
}

export default function MediaConvertTool({ tool, accept, label, formatsText, outputs, defaultTo, option, dailyLimit = 20, note, icon = 'FileVideo' }) {
  const { data: session, status } = useSession();
  const [file, setFile] = useState(null);
  const [to, setTo] = useState(defaultTo || outputs[0][0]);
  const [opt, setOpt] = useState(option.default);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);
  const Icon = Lucide[icon] || Lucide.FileVideo;

  function pick(f) {
    setError(''); setResult(null);
    if (!f) return;
    const ext = '.' + (f.name.split('.').pop() || '').toLowerCase();
    if (!accept.split(',').includes(ext)) { setError(`Please choose a ${formatsText} file.`); return; }
    if (f.size > MAX_MB * 1024 * 1024) { setError(`File is too large. The limit is ${MAX_MB} MB.`); return; }
    setFile(f);
  }

  async function convert() {
    if (!file) return;
    setBusy(true); setError(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('to', to);
      fd.append('option', opt);
      const res = await fetch(`/api/tools/media-convert?tool=${tool}`, { method: 'POST', body: fd });
      const type = res.headers.get('content-type') || '';
      if (!res.ok || type.includes('application/json')) {
        let msg = 'Conversion failed. Please try again.';
        try { const data = await res.json(); if (data.error) msg = data.error; } catch (e) {}
        setError(msg); setBusy(false); return;
      }
      const rem = res.headers.get('x-remaining');
      if (rem !== null) setRemaining(Number(rem));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const name = file.name.replace(/\.[^.]+$/, '') + '.' + to;
      setResult({ url, name, size: blob.size });
      const a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (e) {
      setError('Network error. Please try again.');
    }
    setBusy(false);
  }

  function reset() {
    if (result?.url) URL.revokeObjectURL(result.url);
    setFile(null); setResult(null); setError('');
    if (inputRef.current) inputRef.current.value = '';
  }

  const size = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

  if (status === 'loading') {
    return <div className="border surface rounded-2xl p-8 text-center muted" style={{ background: 'var(--surface)' }}>Loading...</div>;
  }
  if (!session?.user) {
    return (
      <div className="border surface rounded-2xl p-8 text-center" style={{ background: 'var(--surface)' }}>
        <Lucide.Lock className="w-8 h-8 mx-auto mb-4 brand-text" />
        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>Sign in to convert {label} files</h3>
        <p className="muted text-sm mb-5 max-w-md mx-auto">Conversion runs on our servers, so a free account is needed. You get {dailyLimit} conversions per day, files up to {MAX_MB} MB.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="rounded-xl px-5 py-2.5 font-bold text-sm" style={{ background: 'var(--brand)', color: '#fff' }}>Sign in</Link>
          <Link href="/signup" className="rounded-xl px-5 py-2.5 font-semibold text-sm border surface" style={{ color: 'var(--ink)' }}>Create account</Link>
        </div>
      </div>
    );
  }

  const showOption = !(option.hideFor || []).includes(to);

  return (
    <div>
      {note && (
        <div className="rounded-xl px-4 py-3 text-sm mb-5 flex gap-2" style={{ background: 'var(--surface-soft)', color: 'var(--ink)' }}>
          <Lucide.Info className="w-4 h-4 shrink-0 mt-0.5 brand-text" />
          <span>{note}</span>
        </div>
      )}

      {remaining !== null && (
        <p className="muted text-sm text-right mb-2">{remaining >= 999999 ? 'Unlimited (admin)' : `${remaining} conversions left today`}</p>
      )}

      {!file ? (
        <label
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
          className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer text-center"
          style={{ background: 'var(--surface)', borderColor: drag ? 'var(--brand)' : 'var(--line, #d6d9e6)' }}
        >
          <Icon className="w-10 h-10 mb-3 brand-text" />
          <span className="font-bold" style={{ color: 'var(--ink)' }}>Choose a {label} file or drop it here</span>
          <span className="muted text-sm mt-1">{formatsText}, up to {MAX_MB} MB</span>
          <input ref={inputRef} type="file" accept={accept} onChange={(e) => pick(e.target.files?.[0])} className="hidden" />
        </label>
      ) : (
        <div className="border surface rounded-2xl p-5" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center gap-3">
            <Icon className="w-8 h-8 brand-text shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate" style={{ color: 'var(--ink)' }}>{file.name}</p>
              <p className="muted text-xs">{size(file.size)}</p>
            </div>
            {!busy && <button onClick={reset} className="muted" title="Remove"><Lucide.X className="w-5 h-5" /></button>}
          </div>

          {!result && (
            <div className="mt-5 grid sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide muted mb-2">Convert to</p>
                <Segment options={outputs} value={to} onChange={setTo} />
              </div>
              {showOption && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide muted mb-2">{option.label}</p>
                  <Segment options={option.values} value={opt} onChange={setOpt} />
                </div>
              )}
            </div>
          )}

          {!result ? (
            <button onClick={convert} disabled={busy} className="mt-6 w-full rounded-xl px-6 py-3 font-bold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: 'var(--brand)', color: '#fff' }}>
              {busy ? <><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Converting, longer files can take a few minutes...</> : <><Lucide.RefreshCw className="w-4 h-4" /> Convert to {to.toUpperCase()}</>}
            </button>
          ) : (
            <div className="mt-5 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3" style={{ background: 'rgba(16,185,129,0.12)' }}>
              <div className="flex items-center gap-2 min-w-0">
                <Lucide.CircleCheck className="w-5 h-5 shrink-0" style={{ color: '#0f9d76' }} />
                <span className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{result.name} ({size(result.size)})</span>
              </div>
              <div className="flex gap-2">
                <a href={result.url} download={result.name} className="rounded-lg px-4 py-2 text-sm font-bold inline-flex items-center gap-2" style={{ background: 'var(--brand)', color: '#fff' }}><Lucide.Download className="w-4 h-4" /> Download</a>
                <button onClick={reset} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={{ color: 'var(--ink)' }}>Convert another</button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#e5484d' }}>{error}</div>}

      <p className="muted text-xs mt-6">Your file is converted on our server and deleted right after. It is never stored or shared.</p>
    </div>
  );
}
