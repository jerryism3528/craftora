'use client';

import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';

export default function RotatePdfTool() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [angle, setAngle] = useState(90); // 90 | -90 | 180
  const [scope, setScope] = useState('all'); // 'all' | 'some'
  const [ranges, setRanges] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  async function loadFile(f) {
    setError('');
    if (!(f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))) {
      setError('Please choose a PDF file.');
      return;
    }
    try {
      const { PDFDocument } = await import('pdf-lib');
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setFile({ file: f, bytes });
      setPageCount(doc.getPageCount());
    } catch (err) {
      setError('Could not read this PDF. It may be password protected or corrupted.');
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) loadFile(e.dataTransfer.files[0]);
  }

  function parseRanges(text, max) {
    const out = new Set();
    const parts = text.split(',').map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (part.includes('-')) {
        const [a, b] = part.split('-').map((n) => parseInt(n.trim(), 10));
        if (Number.isInteger(a) && Number.isInteger(b)) {
          const lo = Math.min(a, b), hi = Math.max(a, b);
          for (let i = lo; i <= hi; i++) if (i >= 1 && i <= max) out.add(i - 1);
        }
      } else {
        const n = parseInt(part, 10);
        if (Number.isInteger(n) && n >= 1 && n <= max) out.add(n - 1);
      }
    }
    return out;
  }

  async function run() {
    if (!file) { setError('Add a PDF file first.'); return; }
    setBusy(true);
    setError('');
    try {
      const { PDFDocument, degrees } = await import('pdf-lib');
      const doc = await PDFDocument.load(file.bytes, { ignoreEncryption: true });
      const pages = doc.getPages();

      let targets;
      if (scope === 'some') {
        const set = parseRanges(ranges, pageCount);
        if (!set.size) {
          setError('Enter valid pages to rotate, for example 1-2, 4.');
          setBusy(false);
          return;
        }
        targets = [...set];
      } else {
        targets = pages.map((_, i) => i);
      }

      for (const i of targets) {
        const current = pages[i].getRotation().angle || 0;
        pages[i].setRotation(degrees((current + angle + 360) % 360));
      }

      const out = await doc.save();
      const blob = new Blob([out], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'craftora-rotated.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Something went wrong while rotating. The file may be protected or corrupted.');
    } finally {
      setBusy(false);
    }
  }

  const formatSize = (b) => (b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`);

  const angleOptions = [
    { val: -90, label: 'Left 90', icon: 'RotateCcw' },
    { val: 90, label: 'Right 90', icon: 'RotateCw' },
    { val: 180, label: 'Flip 180', icon: 'RefreshCw' },
  ];

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
          <p className="muted text-sm mt-2">Or choose a file from your device to rotate.</p>
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
          <button onClick={() => inputRef.current?.click()} className="rounded-xl px-5 py-3 font-bold text-sm mt-6" style={{ background: 'var(--brand)', color: '#fff' }}>
            Choose PDF file
          </button>
          <p className="muted text-xs mt-5">Your file stays private. Rotation happens in your browser and nothing is uploaded.</p>
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
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{file.file.name}</p>
              <p className="muted text-xs">{pageCount} page{pageCount === 1 ? '' : 's'} · {formatSize(file.file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setRanges(''); setError(''); }} className="text-sm font-semibold muted hover:underline shrink-0">Change</button>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Rotation</label>
            <div className="flex gap-2">
              {angleOptions.map((opt) => {
                const Ico = Lucide[opt.icon];
                return (
                  <button key={opt.val} onClick={() => setAngle(opt.val)} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={angle === opt.val ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>
                    <Ico className="w-4 h-4" /> {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Apply to</label>
            <div className="flex gap-2">
              <button onClick={() => setScope('all')} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={scope === 'all' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>All pages</button>
              <button onClick={() => setScope('some')} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={scope === 'some' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>Specific pages</button>
            </div>
            {scope === 'some' && (
              <div className="mt-3">
                <input
                  value={ranges}
                  onChange={(e) => setRanges(e.target.value)}
                  placeholder={`e.g. 1-2, 4`}
                  className="w-full max-w-sm rounded-xl border surface px-4 py-3 text-sm bg-transparent"
                  style={{ color: 'var(--ink)' }}
                />
                <p className="muted text-xs mt-2">Enter page numbers and ranges, separated by commas. This PDF has {pageCount} pages.</p>
              </div>
            )}
          </div>

          <button onClick={run} disabled={busy} className="w-full sm:w-auto rounded-xl px-6 py-3 font-bold text-sm mt-6 inline-flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
            {busy ? (<><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Rotating...</>) : (<><Lucide.RotateCw className="w-4 h-4" /> Rotate and download</>)}
          </button>
        </div>
      )}
    </div>
  );
}
