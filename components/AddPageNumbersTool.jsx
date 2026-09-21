'use client';

import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';

const POSITIONS = [
  { key: 'bottom-center', label: 'Bottom center' },
  { key: 'bottom-right', label: 'Bottom right' },
  { key: 'bottom-left', label: 'Bottom left' },
  { key: 'top-center', label: 'Top center' },
  { key: 'top-right', label: 'Top right' },
  { key: 'top-left', label: 'Top left' },
];

const FORMATS = [
  { key: 'plain', label: '1' },
  { key: 'of', label: '1 / N' },
  { key: 'page', label: 'Page 1' },
];

export default function AddPageNumbersTool() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [position, setPosition] = useState('bottom-center');
  const [format, setFormat] = useState('plain');
  const [start, setStart] = useState(1);
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

  async function run() {
    if (!file) { setError('Add a PDF file first.'); return; }
    setBusy(true);
    setError('');
    try {
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const doc = await PDFDocument.load(file.bytes, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const total = pages.length;
      const size = 11;
      const margin = 28;
      const startNum = parseInt(start, 10) || 1;

      pages.forEach((page, i) => {
        const num = startNum + i;
        let text;
        if (format === 'of') text = `${num} / ${total}`;
        else if (format === 'page') text = `Page ${num}`;
        else text = `${num}`;

        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, size);
        let x, y;

        if (position.includes('left')) x = margin;
        else if (position.includes('right')) x = width - margin - textWidth;
        else x = (width - textWidth) / 2;

        if (position.includes('top')) y = height - margin;
        else y = margin - size / 2;

        page.drawText(text, { x, y, size, font, color: rgb(0.25, 0.25, 0.3) });
      });

      const out = await doc.save();
      const blob = new Blob([out], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'craftora-numbered.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Something went wrong while adding page numbers. The file may be protected or corrupted.');
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
          <p className="muted text-sm mt-2">Or choose a file from your device to add page numbers.</p>
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
          <button onClick={() => inputRef.current?.click()} className="rounded-xl px-5 py-3 font-bold text-sm mt-6" style={{ background: 'var(--brand)', color: '#fff' }}>
            Choose PDF file
          </button>
          <p className="muted text-xs mt-5">Your file stays private. Page numbers are added in your browser and nothing is uploaded.</p>
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
            <button onClick={() => { setFile(null); setError(''); }} className="text-sm font-semibold muted hover:underline shrink-0">Change</button>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Position</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POSITIONS.map((p) => (
                <button key={p.key} onClick={() => setPosition(p.key)} className="rounded-lg px-3 py-2 text-sm font-semibold border surface" style={position === p.key ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>{p.label}</button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Format</label>
            <div className="flex gap-2">
              {FORMATS.map((f) => (
                <button key={f.key} onClick={() => setFormat(f.key)} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={format === f.key ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>{f.label}</button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Start numbering at</label>
            <input type="number" min="0" value={start} onChange={(e) => setStart(e.target.value)} className="w-28 rounded-xl border surface px-4 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
          </div>

          <button onClick={run} disabled={busy} className="w-full sm:w-auto rounded-xl px-6 py-3 font-bold text-sm mt-6 inline-flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
            {busy ? (<><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Adding numbers...</>) : (<><Lucide.Hash className="w-4 h-4" /> Add page numbers and download</>)}
          </button>
        </div>
      )}
    </div>
  );
}
