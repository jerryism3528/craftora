'use client';

import { useState, useRef, useEffect } from 'react';
import * as Lucide from 'lucide-react';

export default function ResizeImageTool() {
  const [file, setFile] = useState(null);
  const [imgUrl, setImgUrl] = useState('');
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [lock, setLock] = useState(true);
  const [format, setFormat] = useState('jpeg');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

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
      setWidth(String(img.naturalWidth));
      setHeight(String(img.naturalHeight));
    };
    img.onerror = () => setError('Could not read this image.');
    img.src = url;
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) loadFile(e.dataTransfer.files[0]);
  }

  function onWidth(val) {
    setWidth(val);
    if (lock && natural.w) {
      const w = parseInt(val, 10);
      if (w > 0) setHeight(String(Math.round(w * (natural.h / natural.w))));
    }
  }
  function onHeight(val) {
    setHeight(val);
    if (lock && natural.h) {
      const h = parseInt(val, 10);
      if (h > 0) setWidth(String(Math.round(h * (natural.w / natural.h))));
    }
  }

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
    const w = parseInt(width, 10);
    const h = parseInt(height, 10);
    if (!(w > 0) || !(h > 0)) { setError('Enter a valid width and height.'); return; }
    setBusy(true);
    setError('');
    try {
      const img = await loadImage(imgUrl);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      if (format === 'jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); }
      ctx.drawImage(img, 0, 0, w, h);
      const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
      const blob = await new Promise((res) => canvas.toBlob(res, mime, 0.9));
      const base = file.name.replace(/\.(jpe?g|png|webp)$/i, '');
      const ext = format === 'jpeg' ? 'jpg' : format;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${base}-${w}x${h}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError('Something went wrong while resizing the image.');
    } finally {
      setBusy(false);
    }
  }

  const presets = [
    ['1920 x 1080', 1920, 1080],
    ['1280 x 720', 1280, 720],
    ['1080 x 1080', 1080, 1080],
    ['800 x 600', 800, 600],
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
            <Lucide.Expand className="brand-text w-8 h-8" />
          </span>
          <h2 className="font-bold text-xl mt-5" style={{ color: 'var(--ink)' }}>Drop your image here</h2>
          <p className="muted text-sm mt-2">Or choose a JPG, PNG, or WebP image to resize.</p>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
          <button onClick={() => inputRef.current?.click()} className="rounded-xl px-5 py-3 font-bold text-sm mt-6" style={{ background: 'var(--brand)', color: '#fff' }}>
            Choose image
          </button>
          <p className="muted text-xs mt-5">Your image stays private. Resizing happens in your browser and nothing is uploaded.</p>
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#b3261e' }}>{error}</div>
      )}

      {file && (
        <div>
          <div className="flex items-center gap-3 border surface rounded-xl p-3 mt-2" style={{ background: 'var(--surface)' }}>
            <img src={imgUrl} alt={file.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{file.name}</p>
              <p className="muted text-xs">Original: {natural.w} x {natural.h} px</p>
            </div>
            <button onClick={() => { setFile(null); setError(''); }} className="text-sm font-semibold muted hover:underline shrink-0">Change</button>
          </div>

          <div className="flex flex-wrap items-end gap-4 mt-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Width (px)</label>
              <input type="number" min="1" value={width} onChange={(e) => onWidth(e.target.value)} className="w-32 rounded-xl border surface px-4 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Height (px)</label>
              <input type="number" min="1" value={height} onChange={(e) => onHeight(e.target.value)} className="w-32 rounded-xl border surface px-4 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer pb-2" style={{ color: 'var(--ink)' }}>
              <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} /> Lock aspect ratio
            </label>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Common sizes</label>
            <div className="flex flex-wrap gap-2">
              {presets.map(([label, pw, ph]) => (
                <button key={label} onClick={() => { setLock(false); setWidth(String(pw)); setHeight(String(ph)); }} className="rounded-lg px-3 py-1.5 text-sm font-semibold border surface" style={{ color: 'var(--ink)' }}>{label}</button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Save as</label>
            <div className="flex gap-2">
              {[['jpeg', 'JPG'], ['png', 'PNG'], ['webp', 'WebP']].map(([key, label]) => (
                <button key={key} onClick={() => setFormat(key)} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={format === key ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>{label}</button>
              ))}
            </div>
          </div>

          <button onClick={run} disabled={busy} className="w-full sm:w-auto rounded-xl px-6 py-3 font-bold text-sm mt-6 inline-flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
            {busy ? (<><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Resizing...</>) : (<><Lucide.Expand className="w-4 h-4" /> Resize and download</>)}
          </button>
        </div>
      )}
    </div>
  );
}
