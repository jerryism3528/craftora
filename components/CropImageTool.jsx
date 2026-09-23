'use client';

import { useState, useRef, useEffect } from 'react';
import * as Lucide from 'lucide-react';

export default function CropImageTool() {
  const [file, setFile] = useState(null);
  const [imgUrl, setImgUrl] = useState('');
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [ratio, setRatio] = useState('free'); // 'free' | '1' | '1.7778' | '1.3333'
  const [crop, setCrop] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 }); // fractions of displayed image
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const drag = useRef(null);

  function loadFile(f) {
    setError('');
    if (!/^image\/(jpeg|png|webp)$/.test(f.type) && !/\.(jpe?g|png|webp)$/i.test(f.name)) {
      setError('Please choose a JPG, PNG, or WebP image.');
      return;
    }
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      setFile(f);
      setImgUrl(url);
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      setCrop({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
    };
    img.onerror = () => setError('Could not read this image.');
    img.src = url;
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) loadFile(e.dataTransfer.files[0]);
  }

  function applyRatio(r) {
    setRatio(r);
    if (r === 'free') return;
    const rv = parseFloat(r);
    const dispW = wrapRef.current?.clientWidth || 1;
    const dispH = (dispW * natural.h) / natural.w;
    // Fit a centered box with the target ratio.
    let w = 0.8, h = (0.8 * dispW) / rv / dispH;
    if (h > 0.9) { h = 0.9; w = (h * dispH * rv) / dispW; }
    setCrop({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
  }

  function startDrag(mode, e) {
    e.preventDefault();
    e.stopPropagation();
    const point = e.touches ? e.touches[0] : e;
    drag.current = { mode, startX: point.clientX, startY: point.clientY, orig: { ...crop } };
  }

  useEffect(() => {
    function move(e) {
      if (!drag.current) return;
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const point = e.touches ? e.touches[0] : e;
      const dx = (point.clientX - drag.current.startX) / rect.width;
      const dy = (point.clientY - drag.current.startY) / rect.height;
      const o = drag.current.orig;
      let c = { ...o };
      if (drag.current.mode === 'move') {
        c.x = Math.min(Math.max(o.x + dx, 0), 1 - o.w);
        c.y = Math.min(Math.max(o.y + dy, 0), 1 - o.h);
      } else {
        c.w = Math.min(Math.max(o.w + dx, 0.05), 1 - o.x);
        c.h = Math.min(Math.max(o.h + dy, 0.05), 1 - o.y);
        if (ratio !== 'free') {
          const rv = parseFloat(ratio);
          const dispW = rect.width, dispH = rect.height;
          c.h = (c.w * dispW) / rv / dispH;
          if (c.y + c.h > 1) c.h = 1 - c.y;
        }
      }
      setCrop(c);
    }
    function up() { drag.current = null; }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [ratio]);

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  async function run() {
    if (!file) { setError('Add an image first.'); return; }
    setBusy(true);
    setError('');
    try {
      const img = await loadImage(imgUrl);
      const sx = crop.x * natural.w;
      const sy = crop.y * natural.h;
      const sw = crop.w * natural.w;
      const sh = crop.h * natural.h;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(sw));
      canvas.height = Math.max(1, Math.round(sh));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      const isPng = /png$/i.test(file.name) || file.type === 'image/png';
      const mime = isPng ? 'image/png' : 'image/jpeg';
      const blob = await new Promise((res) => canvas.toBlob(res, mime, 0.92));
      const base = file.name.replace(/\.(jpe?g|png|webp)$/i, '');
      const ext = isPng ? 'png' : 'jpg';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${base}-cropped.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError('Something went wrong while cropping the image.');
    } finally {
      setBusy(false);
    }
  }

  const ratios = [['free', 'Free'], ['1', '1:1'], ['1.7778', '16:9'], ['1.3333', '4:3']];

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
            <Lucide.Crop className="brand-text w-8 h-8" />
          </span>
          <h2 className="font-bold text-xl mt-5" style={{ color: 'var(--ink)' }}>Drop your image here</h2>
          <p className="muted text-sm mt-2">Or choose a JPG, PNG, or WebP image to crop.</p>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
          <button onClick={() => inputRef.current?.click()} className="rounded-xl px-5 py-3 font-bold text-sm mt-6" style={{ background: 'var(--brand)', color: '#fff' }}>
            Choose image
          </button>
          <p className="muted text-xs mt-5">Your image stays private. Cropping happens in your browser and nothing is uploaded.</p>
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#b3261e' }}>{error}</div>
      )}

      {file && (
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{file.name}</p>
            <button onClick={() => { setFile(null); setError(''); }} className="text-sm font-semibold muted hover:underline shrink-0">Change</button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Aspect ratio</label>
            <div className="flex gap-2">
              {ratios.map(([key, label]) => (
                <button key={key} onClick={() => applyRatio(key)} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={ratio === key ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>{label}</button>
              ))}
            </div>
          </div>

          <div ref={wrapRef} className="relative inline-block max-w-full border surface rounded-xl overflow-hidden select-none" style={{ background: '#0002' }}>
            <img src={imgUrl} alt={file.name} className="block max-w-full pointer-events-none" style={{ maxHeight: '60vh' }} draggable={false} />
            <div
              onMouseDown={(e) => startDrag('move', e)}
              onTouchStart={(e) => startDrag('move', e)}
              className="absolute border-2 cursor-move"
              style={{ left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.w * 100}%`, height: `${crop.h * 100}%`, borderColor: 'var(--brand)', boxShadow: '0 0 0 9999px rgba(0,0,0,.4)' }}
            >
              <div
                onMouseDown={(e) => startDrag('resize', e)}
                onTouchStart={(e) => startDrag('resize', e)}
                className="absolute w-4 h-4 rounded-full cursor-se-resize"
                style={{ right: -8, bottom: -8, background: 'var(--brand)' }}
              />
            </div>
          </div>

          <div className="mt-6">
            <button onClick={run} disabled={busy} className="rounded-xl px-6 py-3 font-bold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
              {busy ? (<><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Cropping...</>) : (<><Lucide.Crop className="w-4 h-4" /> Crop and download</>)}
            </button>
            <p className="muted text-xs mt-3">Drag the box to move it, or drag the bottom-right handle to resize.</p>
          </div>
        </div>
      )}
    </div>
  );
}
