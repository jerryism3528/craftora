'use client';

import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';

export default function ProtectPdfTool() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  function loadFile(f) {
    setError('');
    if (!(f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))) {
      setError('Please choose a PDF file.');
      return;
    }
    setFile(f);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) loadFile(e.dataTransfer.files[0]);
  }

  async function run() {
    if (!file) { setError('Add a PDF file first.'); return; }
    if (!password) { setError('Enter a password.'); return; }
    if (password.length < 4) { setError('Use a password of at least 4 characters.'); return; }
    if (password !== confirm) { setError('The passwords do not match.'); return; }
    setBusy(true);
    setError('');
    try {
      const mupdf = await import('mupdf');
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = mupdf.Document.openDocument(bytes, 'application/pdf');

                 const buffer = doc.saveToBuffer(
        `compress,encrypt=aes-256,user-password=${password},owner-password=${password}`
      );
      const out = buffer.asUint8Array();

      const blob = new Blob([out], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'craftora-protected.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Something went wrong while protecting the PDF. The file may already be encrypted or corrupted.');
    } finally {
      setBusy(false);
    }
  }

  const formatSize = (b) => (b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`);

  return (
    <div>
      {!file && (
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-[28px] p-8 sm:p-12 text-center surface ${dragging ? 'upload-zone dragging' : ''}`}
          style={{ background: 'var(--surface)' }}
        >
          <span className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'var(--surface-soft)' }}>
            <Lucide.FileUp className="brand-text w-8 h-8" />
          </span>
          <h2 className="font-bold text-xl mt-5" style={{ color: 'var(--ink)' }}>Drop your PDF here</h2>
          <p className="muted text-sm mt-2">Or choose a file from your device to password protect.</p>
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
          <button onClick={() => inputRef.current?.click()} className="rounded-xl px-5 py-3 font-bold text-sm mt-6" style={{ background: 'var(--brand)', color: '#fff' }}>
            Choose PDF file
          </button>
          <p className="muted text-xs mt-5">Your file stays private. The PDF is encrypted in your browser and nothing is uploaded.</p>
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#b3261e' }}>{error}</div>
      )}

      {file && (
        <div>
          <div className="flex items-center gap-3 border surface rounded-xl p-3 mt-2" style={{ background: 'var(--surface)' }}>
            <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--surface-soft)' }}>
              <Lucide.FileText className="brand-text w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{file.name}</p>
              <p className="muted text-xs">{formatSize(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setError(''); }} className="text-sm font-semibold muted hover:underline shrink-0">Change</button>
          </div>

          <div className="mt-6 max-w-md">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Password</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter a password" className="w-full rounded-xl border surface px-4 py-3 pr-11 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
              <button onClick={() => setShow((s) => !s)} className="absolute right-3 top-3 muted" aria-label="Show password">
                {show ? <Lucide.EyeOff className="w-4 h-4" /> : <Lucide.Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="mt-4 max-w-md">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Confirm password</label>
            <input type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter the password" className="w-full rounded-xl border surface px-4 py-3 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
          </div>

          <div className="mt-4 rounded-xl px-4 py-3 text-xs muted max-w-md" style={{ background: 'var(--surface-soft)' }}>
            Keep your password somewhere safe. If you lose it, the PDF cannot be opened, and Craftora cannot recover it because nothing is stored.
          </div>

          <button onClick={run} disabled={busy} className="w-full sm:w-auto rounded-xl px-6 py-3 font-bold text-sm mt-6 inline-flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
            {busy ? (<><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Protecting...</>) : (<><Lucide.Lock className="w-4 h-4" /> Protect PDF and download</>)}
          </button>
        </div>
      )}
    </div>
  );
}
