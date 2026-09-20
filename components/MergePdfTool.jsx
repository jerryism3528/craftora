'use client';

import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';

export default function MergePdfTool() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  function addFiles(list) {
    setError('');
    const incoming = Array.from(list).filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (!incoming.length) {
      setError('Please choose PDF files only.');
      return;
    }
    setFiles((prev) => [...prev, ...incoming.map((f) => ({ id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2)}`, file: f }))]);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  function move(index, dir) {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(id) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function mergePdfs() {
    if (files.length < 2) {
      setError('Add at least two PDF files to merge.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const merged = await PDFDocument.create();
      for (const item of files) {
        const bytes = await item.file.arrayBuffer();
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const out = await merged.save();
      const blob = new Blob([out], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'craftora-merged.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Something went wrong while merging. One of the files may be password protected or corrupted.');
    } finally {
      setBusy(false);
    }
  }

  const formatSize = (bytes) => (bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`);

  return (
    <div>
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
        <h2 className="font-bold text-xl mt-5" style={{ color: 'var(--ink)' }}>Drop your PDF files here</h2>
        <p className="muted text-sm mt-2">Or choose files from your device. Add two or more PDFs to merge.</p>
        <input ref={inputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        <button onClick={() => inputRef.current?.click()} className="rounded-xl px-5 py-3 font-bold text-sm mt-6" style={{ background: 'var(--brand)', color: '#fff' }}>
          Choose PDF files
        </button>
        <p className="muted text-xs mt-5">Your files stay private. Merging happens in your browser and nothing is uploaded.</p>
      </div>

      {error && (
        <div className="mt-5 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#b3261e' }}>{error}</div>
      )}

      {files.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: 'var(--ink)' }}>{files.length} file{files.length === 1 ? '' : 's'} added</h3>
            <button onClick={() => setFiles([])} className="text-sm font-semibold muted hover:underline">Clear all</button>
          </div>
          <ul className="space-y-2">
            {files.map((item, i) => (
              <li key={item.id} className="flex items-center gap-3 border surface rounded-xl p-3" style={{ background: 'var(--surface)' }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--surface-soft)' }}>
                  <Lucide.FileText className="brand-text w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{item.file.name}</p>
                  <p className="muted text-xs">{formatSize(item.file.size)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="w-8 h-8 rounded-lg border surface inline-flex items-center justify-center disabled:opacity-30" style={{ color: 'var(--ink)' }} aria-label="Move up">
                    <Lucide.ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => move(i, 1)} disabled={i === files.length - 1} className="w-8 h-8 rounded-lg border surface inline-flex items-center justify-center disabled:opacity-30" style={{ color: 'var(--ink)' }} aria-label="Move down">
                    <Lucide.ChevronDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(item.id)} className="w-8 h-8 rounded-lg border surface inline-flex items-center justify-center" style={{ color: '#b3261e' }} aria-label="Remove">
                    <Lucide.X className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <button onClick={mergePdfs} disabled={busy || files.length < 2} className="w-full sm:w-auto rounded-xl px-6 py-3 font-bold text-sm mt-6 inline-flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
            {busy ? (<><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Merging...</>) : (<><Lucide.Combine className="w-4 h-4" /> Merge PDFs and download</>)}
          </button>
        </div>
      )}
    </div>
  );
}
