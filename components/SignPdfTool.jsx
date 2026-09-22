'use client';

import { useState, useRef, useEffect } from 'react';
import * as Lucide from 'lucide-react';

const POSITIONS = [
  { key: 'bottom-right', label: 'Bottom right' },
  { key: 'bottom-left', label: 'Bottom left' },
  { key: 'bottom-center', label: 'Bottom center' },
  { key: 'top-right', label: 'Top right' },
  { key: 'top-left', label: 'Top left' },
  { key: 'center', label: 'Center' },
];

export default function SignPdfTool() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState('draw'); // 'draw' | 'type'
  const [typed, setTyped] = useState('');
  const [targetPage, setTargetPage] = useState(1);
  const [position, setPosition] = useState('bottom-right');
  const [sigSize, setSigSize] = useState(160);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const hasDrawn = useRef(false);

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
      setTargetPage(1);
    } catch (err) {
      setError('Could not read this PDF. It may be password protected or corrupted.');
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) loadFile(e.dataTransfer.files[0]);
  }

  // Canvas drawing setup.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mode !== 'draw') return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1a1a2e';

    function pos(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: (clientX - rect.left) * (canvas.width / rect.width), y: (clientY - rect.top) * (canvas.height / rect.height) };
    }
    function start(e) { e.preventDefault(); drawing.current = true; hasDrawn.current = true; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }
    function draw(e) { if (!drawing.current) return; e.preventDefault(); const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); }
    function end() { drawing.current = false; }

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', end);
    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', draw);
      window.removeEventListener('mouseup', end);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', end);
    };
  }, [mode, file]);

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn.current = false;
  }

  // Build a PNG data URL of the signature (from canvas or typed text).
  async function getSignaturePng() {
    if (mode === 'draw') {
      if (!hasDrawn.current) return null;
      return canvasRef.current.toDataURL('image/png');
    }
    if (!typed.trim()) return null;
    const c = document.createElement('canvas');
    c.width = 600; c.height = 200;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'italic 90px Georgia, serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(typed, 20, c.height / 2);
    return c.toDataURL('image/png');
  }

  async function run() {
    if (!file) { setError('Add a PDF file first.'); return; }
    const sigPng = await getSignaturePng();
    if (!sigPng) { setError(mode === 'draw' ? 'Draw your signature first.' : 'Type your signature first.'); return; }
    setBusy(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.load(file.bytes, { ignoreEncryption: true });
      const pngBytes = await fetch(sigPng).then((r) => r.arrayBuffer());
      const png = await doc.embedPng(pngBytes);

      const pages = doc.getPages();
      const idx = Math.min(Math.max(parseInt(targetPage, 10) || 1, 1), pages.length) - 1;
      const page = pages[idx];
      const { width, height } = page.getSize();

      const w = parseInt(sigSize, 10) || 160;
      const h = (png.height / png.width) * w;
      const margin = 24;
      let x, y;

      if (position.includes('left')) x = margin;
      else if (position.includes('right')) x = width - margin - w;
      else x = (width - w) / 2;

      if (position === 'center') { x = (width - w) / 2; y = (height - h) / 2; }
      else if (position.includes('top')) y = height - margin - h;
      else y = margin;

      page.drawImage(png, { x, y, width: w, height: h });

      const out = await doc.save();
      const blob = new Blob([out], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'craftora-signed.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Something went wrong while signing. The file may be protected or corrupted.');
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
          <p className="muted text-sm mt-2">Or choose a file from your device to sign.</p>
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
          <button onClick={() => inputRef.current?.click()} className="rounded-xl px-5 py-3 font-bold text-sm mt-6" style={{ background: 'var(--brand)', color: '#fff' }}>
            Choose PDF file
          </button>
          <p className="muted text-xs mt-5">Your file stays private. Signing happens in your browser and nothing is uploaded.</p>
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
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Your signature</label>
            <div className="flex gap-2 mb-3">
              <button onClick={() => setMode('draw')} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={mode === 'draw' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>Draw</button>
              <button onClick={() => setMode('type')} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={mode === 'type' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>Type</button>
            </div>

            {mode === 'draw' ? (
              <div>
                <canvas ref={canvasRef} width={600} height={200} className="w-full max-w-md border surface rounded-xl touch-none" style={{ background: '#fff', cursor: 'crosshair' }} />
                <button onClick={clearCanvas} className="text-sm font-semibold muted hover:underline mt-2">Clear</button>
              </div>
            ) : (
              <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type your name" className="w-full max-w-md rounded-xl border surface px-4 py-3 text-lg bg-transparent" style={{ color: 'var(--ink)', fontFamily: 'Georgia, serif', fontStyle: 'italic' }} />
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mt-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Page to sign</label>
              <input type="number" min="1" max={pageCount} value={targetPage} onChange={(e) => setTargetPage(e.target.value)} className="w-28 rounded-xl border surface px-4 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
              <p className="muted text-xs mt-1">of {pageCount}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Signature width: {sigSize}px</label>
              <input type="range" min="80" max="300" value={sigSize} onChange={(e) => setSigSize(e.target.value)} className="w-full max-w-xs" />
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Position</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg">
              {POSITIONS.map((p) => (
                <button key={p.key} onClick={() => setPosition(p.key)} className="rounded-lg px-3 py-2 text-sm font-semibold border surface" style={position === p.key ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>{p.label}</button>
              ))}
            </div>
          </div>

          <button onClick={run} disabled={busy} className="w-full sm:w-auto rounded-xl px-6 py-3 font-bold text-sm mt-6 inline-flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
            {busy ? (<><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Signing...</>) : (<><Lucide.PenTool className="w-4 h-4" /> Sign PDF and download</>)}
          </button>
        </div>
      )}
    </div>
  );
}
