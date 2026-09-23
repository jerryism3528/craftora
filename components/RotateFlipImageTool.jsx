'use client';

import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';

export default function RotateFlipImageTool() {
  const [file, setFile] = useState(null);
  const [imgUrl, setImgUrl] = useState('');
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
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
    setFile(f);
    setImgUrl(URL.createObjectURL(f));
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) loadFile(e.dataTransfer.files[0]);
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
    setBusy(true);
    setError('');
    try {
      const img = await loadImage(imgUrl);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const swap = rotation === 90 || rotation === 270;
      const canvas = document.createElement('canvas');
      canvas.width = swap ? h : w;
      canvas.height = swap ? w : h;
      const ctx = canvas.getContext('2d');
      const isPng = /png$/i.test(file.name) || file.type === 'image/png';
      if (!isPng) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -w / 2, -h / 2);
      const mime = isPng ? 'image/png' : 'image/jpeg';
      const blob = await new Promise((res) => canvas.toBlob(res, mime, 0.92));
      const base = file.name.replace(/\.(jpe?g|png|webp)$/i, '');
      const ext = isPng ? 'png' : 'jpg';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${base}-edited.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError('Something went wrong while editing the image.');
    } finally {
      setBusy(false);
    }
  }

  const previewTransform = `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`;

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
            <Lucide.RotateCw className="brand-text w-8 h-8" />
          </span>
          <h2 className="font-bold text-xl mt-5" style={{ color: 'var(--ink)' }}>Drop your image here</h2>
          <p className="muted text-sm mt-2">Or choose a JPG, PNG, or WebP image to rotate or flip.</p>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
          <button onClick={() => inputRef.current?.click()} className="rounded-xl px-5 py-3 font-bold text-sm mt-6" style={{ background: 'var(--brand)', color: '#fff' }}>
            Choose image
          </button>
          <p className="muted text-xs mt-5">Your image stays private. Everything happens in your browser and nothing is uploaded.</p>
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

          <div className="border surface rounded-xl p-6 flex items-center justify-center overflow-hidden" style={{ background: '#0001', minHeight: 200 }}>
            <img src={imgUrl} alt={file.name} className="max-w-full transition-transform duration-200" style={{ maxHeight: '45vh', transform: previewTransform }} />
          </div>

          <div className="mt-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Rotate</label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setRotation((r) => (r + 270) % 360)} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}><Lucide.RotateCcw className="w-4 h-4" /> Left 90</button>
              <button onClick={() => setRotation((r) => (r + 90) % 360)} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}><Lucide.RotateCw className="w-4 h-4" /> Right 90</button>
              <button onClick={() => setRotation((r) => (r + 180) % 360)} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}><Lucide.RefreshCw className="w-4 h-4" /> 180</button>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Flip</label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFlipH((v) => !v)} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={flipH ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}><Lucide.FlipHorizontal className="w-4 h-4" /> Flip horizontal</button>
              <button onClick={() => setFlipV((v) => !v)} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={flipV ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}><Lucide.FlipVertical className="w-4 h-4" /> Flip vertical</button>
            </div>
          </div>

          <button onClick={run} disabled={busy} className="w-full sm:w-auto rounded-xl px-6 py-3 font-bold text-sm mt-6 inline-flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
            {busy ? (<><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Saving...</>) : (<><Lucide.Download className="w-4 h-4" /> Apply and download</>)}
          </button>
        </div>
      )}
    </div>
  );
}
