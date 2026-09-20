'use client';

import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';

export default function OrganizePdfTool() {
  const [srcBytes, setSrcBytes] = useState(null);
  const [fileName, setFileName] = useState('');
  const [pages, setPages] = useState([]); // { origIndex, rotation, thumb }
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      const bytes = new Uint8Array(await f.arrayBuffer());
      setSrcBytes(bytes.slice(0));
      setFileName(f.name);
      const pdf = await pdfjs.getDocument({ data: bytes }).promise;
      const list = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
        list.push({ origIndex: i - 1, rotation: 0, thumb: canvas.toDataURL('image/jpeg', 0.7) });
      }
      setPages(list);
    } catch (err) {
      setError('Could not read this PDF. It may be password protected or corrupted.');
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) loadFile(e.dataTransfer.files[0]);
  }

  function move(index, dir) {
    setPages((prev) => {
      const next = [...prev];
      const t = index + dir;
      if (t < 0 || t >= next.length) return prev;
      [next[index], next[t]] = [next[t], next[index]];
      return next;
    });
  }

  function rotate(index) {
    setPages((prev) => prev.map((p, i) => (i === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p)));
  }

  function remove(index) {
    setPages((prev) => prev.filter((_, i) => i !== index));
  }

  function reset() {
    setSrcBytes(null);
    setFileName('');
    setPages([]);
    setError('');
  }

  async function save() {
    if (!pages.length) { setError('There are no pages left to save.'); return; }
    setBusy(true);
    setError('');
    try {
      const { PDFDocument, degrees } = await import('pdf-lib');
      const src = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, pages.map((p) => p.origIndex));
      copied.forEach((page, i) => {
        const base = page.getRotation().angle || 0;
        page.setRotation(degrees((base + pages[i].rotation + 360) % 360));
        out.addPage(page);
      });
      const bytes = await out.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'craftora-organized.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Something went wrong while saving. The file may be protected or corrupted.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {!srcBytes && (
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
          <p className="muted text-sm mt-2">Or choose a file to reorder, rotate, and delete pages.</p>
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
          <button onClick={() => inputRef.current?.click()} className="rounded-xl px-5 py-3 font-bold text-sm mt-6" style={{ background: 'var(--brand)', color: '#fff' }}>
            Choose PDF file
          </button>
          <p className="muted text-xs mt-5">Your file stays private. Everything happens in your browser and nothing is uploaded.</p>
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#b3261e' }}>{error}</div>
      )}

      {loading && (
        <div className="mt-6 flex items-center gap-2 muted text-sm">
          <Lucide.Loader2 className="w-4 h-4 animate-spin" /> Loading pages...
        </div>
      )}

      {srcBytes && !loading && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{fileName}</p>
              <p className="muted text-xs">{pages.length} page{pages.length === 1 ? '' : 's'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={reset} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={{ color: 'var(--ink)' }}>Change file</button>
              <button onClick={save} disabled={busy || !pages.length} className="rounded-lg px-5 py-2 text-sm font-bold inline-flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
                {busy ? (<><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Saving...</>) : (<><Lucide.Download className="w-4 h-4" /> Save PDF</>)}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {pages.map((p, i) => (
              <div key={i} className="border surface rounded-xl overflow-hidden" style={{ background: 'var(--surface)' }}>
                <div className="aspect-[3/4] bg-black/5 flex items-center justify-center overflow-hidden">
                  <img src={p.thumb} alt={`Page ${i + 1}`} className="max-w-full max-h-full object-contain transition-transform" style={{ transform: `rotate(${p.rotation}deg)` }} />
                </div>
                <div className="p-2">
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--ink)' }}>Page {i + 1}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="w-7 h-7 rounded-md border surface inline-flex items-center justify-center disabled:opacity-30" style={{ color: 'var(--ink)' }} aria-label="Move left"><Lucide.ChevronLeft className="w-3.5 h-3.5" /></button>
                    <button onClick={() => move(i, 1)} disabled={i === pages.length - 1} className="w-7 h-7 rounded-md border surface inline-flex items-center justify-center disabled:opacity-30" style={{ color: 'var(--ink)' }} aria-label="Move right"><Lucide.ChevronRight className="w-3.5 h-3.5" /></button>
                    <button onClick={() => rotate(i)} className="w-7 h-7 rounded-md border surface inline-flex items-center justify-center" style={{ color: 'var(--ink)' }} aria-label="Rotate"><Lucide.RotateCw className="w-3.5 h-3.5" /></button>
                    <button onClick={() => remove(i)} className="w-7 h-7 rounded-md border surface inline-flex items-center justify-center ml-auto" style={{ color: '#b3261e' }} aria-label="Delete page"><Lucide.Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pages.length === 0 && (
            <p className="muted text-sm mt-6">All pages removed. Add the file again to start over.</p>
          )}
        </div>
      )}
    </div>
  );
}
