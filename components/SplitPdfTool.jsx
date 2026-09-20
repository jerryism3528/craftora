'use client';

import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';

export default function SplitPdfTool() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState('extract'); // 'extract' | 'all'
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

  // Parse "1-3, 5, 8-10" into a sorted, de-duplicated array of 0-based indices.
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
    return [...out].sort((a, b) => a - b);
  }

  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function run() {
    if (!file) { setError('Add a PDF file first.'); return; }
    setBusy(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const src = await PDFDocument.load(file.bytes, { ignoreEncryption: true });

      if (mode === 'extract') {
        const indices = parseRanges(ranges, pageCount);
        if (!indices.length) {
          setError('Enter valid pages to extract, for example 1-3, 5.');
          setBusy(false);
          return;
        }
        const out = await PDFDocument.create();
        const copied = await out.copyPages(src, indices);
        copied.forEach((p) => out.addPage(p));
        const bytes = await out.save();
        download(new Blob([bytes], { type: 'application/pdf' }), 'craftora-extracted.pdf');
      } else {
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        for (let i = 0; i < pageCount; i++) {
          const out = await PDFDocument.create();
          const [page] = await out.copyPages(src, [i]);
          out.addPage(page);
          const bytes = await out.save();
          zip.file(`page-${i + 1}.pdf`, bytes);
        }
        const blob = await zip.generateAsync({ type: 'blob' });
        download(blob, 'craftora-split-pages.zip');
      }
    } catch (err) {
      setError('Something went wrong while splitting. The file may be protected or corrupted.');
    } finally {
      setBusy(false);
    }
  }

  const formatSize = (bytes) => (bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`);

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
          <p className="muted text-sm mt-2">Or choose a file from your device to split.</p>
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
          <button onClick={() => inputRef.current?.click()} className="rounded-xl px-5 py-3 font-bold text-sm mt-6" style={{ background: 'var(--brand)', color: '#fff' }}>
            Choose PDF file
          </button>
          <p className="muted text-xs mt-5">Your file stays private. Splitting happens in your browser and nothing is uploaded.</p>
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

          <div className="mt-6 flex gap-2">
            <button onClick={() => setMode('extract')} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={mode === 'extract' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>
              Extract pages
            </button>
            <button onClick={() => setMode('all')} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={mode === 'all' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>
              Split every page
            </button>
          </div>

          {mode === 'extract' ? (
            <div className="mt-5">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Pages to extract</label>
              <input
                value={ranges}
                onChange={(e) => setRanges(e.target.value)}
                placeholder={`e.g. 1-3, 5, 8-${pageCount}`}
                className="w-full max-w-sm rounded-xl border surface px-4 py-3 text-sm bg-transparent"
                style={{ color: 'var(--ink)' }}
              />
              <p className="muted text-xs mt-2">Enter page numbers and ranges, separated by commas. This PDF has {pageCount} pages.</p>
            </div>
          ) : (
            <p className="muted text-sm mt-5">Every page becomes its own PDF file, delivered together in a single zip download.</p>
          )}

          <button onClick={run} disabled={busy} className="w-full sm:w-auto rounded-xl px-6 py-3 font-bold text-sm mt-6 inline-flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
            {busy ? (<><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Working...</>) : (<><Lucide.Scissors className="w-4 h-4" /> {mode === 'extract' ? 'Extract and download' : 'Split and download zip'}</>)}
          </button>
        </div>
      )}
    </div>
  );
}
