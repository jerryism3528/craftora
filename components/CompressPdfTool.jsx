'use client';

import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';

const QUALITY = {
  low: { label: 'Smaller file', scale: 1.0, jpeg: 0.5 },
  medium: { label: 'Balanced', scale: 1.3, jpeg: 0.7 },
  high: { label: 'Better quality', scale: 1.7, jpeg: 0.82 },
};

export default function CompressPdfTool() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('strong'); // 'strong' | 'light'
  const [quality, setQuality] = useState('medium');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  function loadFile(f) {
    setError('');
    setResult(null);
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

  // Light mode: repack + strip metadata (keeps text selectable, small savings).
  async function compressLight(bytes) {
    const { PDFDocument } = await import('pdf-lib');
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
    try {
      doc.setTitle(''); doc.setAuthor(''); doc.setSubject('');
      doc.setKeywords([]); doc.setProducer('Craftora'); doc.setCreator('Craftora');
    } catch (e) {}
    return doc.save({ useObjectStreams: true, addDefaultPage: false });
  }

  // Strong mode: render each page to canvas, re-encode as JPEG, rebuild PDF (big savings, text becomes image).
  async function compressStrong(bytes) {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    const { PDFDocument } = await import('pdf-lib');

    const q = QUALITY[quality];
    const loadingTask = pdfjs.getDocument({ data: bytes.slice(0) });
    const pdf = await loadingTask.promise;
    const out = await PDFDocument.create();

    for (let i = 1; i <= pdf.numPages; i++) {
      setProgress(`Compressing page ${i} of ${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: q.scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;

      const jpegDataUrl = canvas.toDataURL('image/jpeg', q.jpeg);
      const jpegBytes = await fetch(jpegDataUrl).then((r) => r.arrayBuffer());
      const img = await out.embedJpg(jpegBytes);
      const pageOut = out.addPage([viewport.width / q.scale * 72 / 72, viewport.height / q.scale * 72 / 72]);
      // Size the page to the original point size (scale back down from render scale).
      const w = viewport.width / q.scale;
      const h = viewport.height / q.scale;
      pageOut.setSize(w, h);
      pageOut.drawImage(img, { x: 0, y: 0, width: w, height: h });
    }
    return out.save({ useObjectStreams: true });
  }

  async function compress() {
    if (!file) { setError('Add a PDF file first.'); return; }
    setBusy(true);
    setError('');
    setResult(null);
    setProgress('');
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const originalSize = bytes.byteLength;
      const out = mode === 'strong' ? await compressStrong(bytes) : await compressLight(bytes);
      const newSize = out.byteLength;
      const blob = new Blob([out], { type: 'application/pdf' });
      const saved = originalSize - newSize;
      const pct = originalSize > 0 ? Math.round((saved / originalSize) * 100) : 0;
      setResult({ blob, originalSize, newSize, saved, pct });
    } catch (err) {
      setError('Something went wrong while compressing. The file may be password protected or corrupted.');
    } finally {
      setBusy(false);
      setProgress('');
    }
  }

  const formatSize = (b) => (b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / (1024 * 1024)).toFixed(2)} MB`);

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
          <p className="muted text-sm mt-2">Or choose a file from your device to compress.</p>
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
          <button onClick={() => inputRef.current?.click()} className="rounded-xl px-5 py-3 font-bold text-sm mt-6" style={{ background: 'var(--brand)', color: '#fff' }}>
            Choose PDF file
          </button>
          <p className="muted text-xs mt-5">Your file stays private. Compression happens in your browser and nothing is uploaded.</p>
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
            <button onClick={() => { setFile(null); setResult(null); setError(''); }} className="text-sm font-semibold muted hover:underline shrink-0">Change</button>
          </div>

          {!result && (
            <>
              <div className="mt-6">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Compression mode</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button onClick={() => setMode('strong')} className="text-left rounded-xl px-4 py-3 border surface flex-1" style={mode === 'strong' ? { borderColor: 'var(--brand)', background: 'var(--surface-soft)' } : { color: 'var(--ink)' }}>
                    <strong className="block text-sm" style={{ color: 'var(--ink)' }}>Strong compression</strong>
                    <span className="muted text-xs">Biggest size reduction. Best for scans and image-heavy PDFs. Text becomes part of the image.</span>
                  </button>
                  <button onClick={() => setMode('light')} className="text-left rounded-xl px-4 py-3 border surface flex-1" style={mode === 'light' ? { borderColor: 'var(--brand)', background: 'var(--surface-soft)' } : { color: 'var(--ink)' }}>
                    <strong className="block text-sm" style={{ color: 'var(--ink)' }}>Light compression</strong>
                    <span className="muted text-xs">Smaller savings, but keeps text sharp and selectable.</span>
                  </button>
                </div>
              </div>

              {mode === 'strong' && (
                <div className="mt-5">
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Quality</label>
                  <div className="flex gap-2">
                    {Object.entries(QUALITY).map(([key, val]) => (
                      <button key={key} onClick={() => setQuality(key)} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={quality === key ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>
                        {val.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={compress} disabled={busy} className="w-full sm:w-auto rounded-xl px-6 py-3 font-bold text-sm mt-6 inline-flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
                {busy ? (<><Lucide.Loader2 className="w-4 h-4 animate-spin" /> {progress || 'Compressing...'}</>) : (<><Lucide.Minimize2 className="w-4 h-4" /> Compress PDF</>)}
              </button>
            </>
          )}

          {result && (
            <div className="mt-6 border surface rounded-2xl p-6" style={{ background: 'var(--surface)' }}>
              {result.saved > 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Lucide.CircleCheckBig className="mint-text w-5 h-5" />
                    <strong style={{ color: 'var(--ink)' }}>Compressed. {result.pct}% smaller.</strong>
                  </div>
                  <div className="flex gap-6 text-sm mb-5">
                    <div><span className="muted block text-xs">Before</span><span style={{ color: 'var(--ink)' }}>{formatSize(result.originalSize)}</span></div>
                    <div><span className="muted block text-xs">After</span><span className="mint-text font-bold">{formatSize(result.newSize)}</span></div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 mb-4">
                  <Lucide.Info className="brand-text w-5 h-5" />
                  <strong style={{ color: 'var(--ink)' }}>This PDF is already well optimized.</strong>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button onClick={() => download(result.blob, 'craftora-compressed.pdf')} className="rounded-xl px-5 py-3 font-bold text-sm inline-flex items-center gap-2" style={{ background: 'var(--brand)', color: '#fff' }}>
                  <Lucide.Download className="w-4 h-4" /> Download compressed PDF
                </button>
                <button onClick={() => setResult(null)} className="rounded-xl px-5 py-3 font-bold text-sm border surface" style={{ color: 'var(--ink)' }}>
                  Try another mode
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
