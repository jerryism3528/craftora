'use client';

import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';

export default function WatermarkPdfTool() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [text, setText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(20);
  const [size, setSize] = useState(50);
  const [diagonal, setDiagonal] = useState(true);
  const [tiled, setTiled] = useState(false);
  const [color, setColor] = useState('#3430a8');
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

  function hexToRgb(hex) {
    const m = hex.replace('#', '');
    const n = parseInt(m.length === 3 ? m.split('').map((c) => c + c).join('') : m, 16);
    return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
  }

  async function run() {
    if (!file) { setError('Add a PDF file first.'); return; }
    if (!text.trim()) { setError('Enter the watermark text.'); return; }
    setBusy(true);
    setError('');
    try {
      const { PDFDocument, StandardFonts, rgb, degrees } = await import('pdf-lib');
      const doc = await PDFDocument.load(file.bytes, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const c = hexToRgb(color);
      const op = Math.min(Math.max(opacity / 100, 0.05), 1);
      const fontSize = parseInt(size, 10) || 50;
      const angle = diagonal ? 45 : 0;

      for (const page of doc.getPages()) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);

        if (tiled) {
          const stepX = textWidth + 120;
          const stepY = fontSize + 120;
          for (let y = 0; y < height + stepY; y += stepY) {
            for (let x = -textWidth; x < width + stepX; x += stepX) {
              page.drawText(text, { x, y, size: fontSize, font, color: rgb(c.r, c.g, c.b), opacity: op, rotate: degrees(angle) });
            }
          }
        } else {
          const x = (width - textWidth * Math.cos(angle * Math.PI / 180)) / 2;
          const y = (height - fontSize) / 2;
          page.drawText(text, { x, y, size: fontSize, font, color: rgb(c.r, c.g, c.b), opacity: op, rotate: degrees(angle) });
        }
      }

      const out = await doc.save();
      const blob = new Blob([out], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'craftora-watermarked.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Something went wrong while adding the watermark. The file may be protected or corrupted.');
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
          <p className="muted text-sm mt-2">Or choose a file from your device to add a watermark.</p>
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
          <button onClick={() => inputRef.current?.click()} className="rounded-xl px-5 py-3 font-bold text-sm mt-6" style={{ background: 'var(--brand)', color: '#fff' }}>
            Choose PDF file
          </button>
          <p className="muted text-xs mt-5">Your file stays private. The watermark is added in your browser and nothing is uploaded.</p>
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
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Watermark text</label>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. CONFIDENTIAL" className="w-full max-w-md rounded-xl border surface px-4 py-3 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mt-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Opacity: {opacity}%</label>
              <input type="range" min="5" max="80" value={opacity} onChange={(e) => setOpacity(e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Text size: {size}</label>
              <input type="range" min="20" max="120" value={size} onChange={(e) => setSize(e.target.value)} className="w-full" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 mt-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-16 h-9 rounded-lg border surface cursor-pointer bg-transparent" />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer mt-6" style={{ color: 'var(--ink)' }}>
              <input type="checkbox" checked={diagonal} onChange={(e) => setDiagonal(e.target.checked)} /> Diagonal
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer mt-6" style={{ color: 'var(--ink)' }}>
              <input type="checkbox" checked={tiled} onChange={(e) => setTiled(e.target.checked)} /> Tile across page
            </label>
          </div>

          <button onClick={run} disabled={busy} className="w-full sm:w-auto rounded-xl px-6 py-3 font-bold text-sm mt-6 inline-flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
            {busy ? (<><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Adding watermark...</>) : (<><Lucide.Stamp className="w-4 h-4" /> Add watermark and download</>)}
          </button>
        </div>
      )}
    </div>
  );
}
