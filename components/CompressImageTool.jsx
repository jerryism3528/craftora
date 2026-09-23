'use client';

import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';

const QUALITY = {
  small: { label: 'Smaller file', q: 0.5 },
  balanced: { label: 'Balanced', q: 0.72 },
  high: { label: 'Better quality', q: 0.88 },
};

export default function CompressImageTool() {
  const [items, setItems] = useState([]); // { id, file, url, status, outBlob, outUrl, outSize }
  const [quality, setQuality] = useState('balanced');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  function addFiles(list) {
    setError('');
    const incoming = Array.from(list).filter((f) => /^image\/(jpeg|png|webp)$/.test(f.type) || /\.(jpe?g|png|webp)$/i.test(f.name));
    if (!incoming.length) {
      setError('Please choose JPG, PNG, or WebP images.');
      return;
    }
    setItems((prev) => [
      ...prev,
      ...incoming.map((f) => ({ id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2)}`, file: f, url: URL.createObjectURL(f), status: 'ready', outBlob: null, outUrl: null, outSize: 0 })),
    ]);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  function removeItem(id) {
    setItems((prev) => {
      const found = prev.find((i) => i.id === id);
      if (found) { URL.revokeObjectURL(found.url); if (found.outUrl) URL.revokeObjectURL(found.outUrl); }
      return prev.filter((i) => i.id !== id);
    });
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  async function compressOne(item, q) {
    const img = await loadImage(item.url);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    // White background for PNGs with transparency being saved as JPEG.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', q));
    return blob;
  }

  async function compressAll() {
    if (!items.length) { setError('Add at least one image.'); return; }
    setBusy(true);
    setError('');
    const q = QUALITY[quality].q;
    const updated = await Promise.all(items.map(async (item) => {
      try {
        const blob = await compressOne(item, q);
        if (item.outUrl) URL.revokeObjectURL(item.outUrl);
        return { ...item, status: 'done', outBlob: blob, outUrl: URL.createObjectURL(blob), outSize: blob.size };
      } catch (e) {
        return { ...item, status: 'error' };
      }
    }));
    setItems(updated);
    setBusy(false);
  }

  function downloadOne(item) {
    if (!item.outBlob) return;
    const base = item.file.name.replace(/\.(jpe?g|png|webp)$/i, '');
    const a = document.createElement('a');
    a.href = item.outUrl;
    a.download = `${base}-compressed.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function downloadZip() {
    const done = items.filter((i) => i.outBlob);
    if (!done.length) return;
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    done.forEach((item) => {
      const base = item.file.name.replace(/\.(jpe?g|png|webp)$/i, '');
      zip.file(`${base}-compressed.jpg`, item.outBlob);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'craftora-compressed-images.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const formatSize = (b) => (b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / (1024 * 1024)).toFixed(2)} MB`);
  const anyDone = items.some((i) => i.status === 'done');

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
          <Lucide.ImagePlus className="brand-text w-8 h-8" />
        </span>
        <h2 className="font-bold text-xl mt-5" style={{ color: 'var(--ink)' }}>Drop your images here</h2>
        <p className="muted text-sm mt-2">Or choose JPG, PNG, or WebP images from your device. Add one or more.</p>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        <button onClick={() => inputRef.current?.click()} className="rounded-xl px-5 py-3 font-bold text-sm mt-6" style={{ background: 'var(--brand)', color: '#fff' }}>
          Choose images
        </button>
        <p className="muted text-xs mt-5">Your images stay private. Compression happens in your browser and nothing is uploaded.</p>
      </div>

      {error && (
        <div className="mt-5 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#b3261e' }}>{error}</div>
      )}

      {items.length > 0 && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="font-bold" style={{ color: 'var(--ink)' }}>{items.length} image{items.length === 1 ? '' : 's'}</h3>
            <button onClick={() => { items.forEach((i) => { URL.revokeObjectURL(i.url); if (i.outUrl) URL.revokeObjectURL(i.outUrl); }); setItems([]); }} className="text-sm font-semibold muted hover:underline">Clear all</button>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Quality</label>
            <div className="flex gap-2">
              {Object.entries(QUALITY).map(([key, val]) => (
                <button key={key} onClick={() => setQuality(key)} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={quality === key ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>{val.label}</button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {items.map((item) => {
              const saved = item.outSize > 0 ? Math.round(((item.file.size - item.outSize) / item.file.size) * 100) : 0;
              return (
                <div key={item.id} className="flex items-center gap-3 border surface rounded-xl p-3" style={{ background: 'var(--surface)' }}>
                  <img src={item.url} alt={item.file.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{item.file.name}</p>
                    <p className="muted text-xs">
                      {formatSize(item.file.size)}
                      {item.status === 'done' && <> → <span className="mint-text font-bold">{formatSize(item.outSize)}</span> {saved > 0 && `(${saved}% smaller)`}</>}
                    </p>
                  </div>
                  {item.status === 'done' ? (
                    <button onClick={() => downloadOne(item)} className="rounded-lg px-3 py-2 text-sm font-bold inline-flex items-center gap-1 shrink-0" style={{ background: 'var(--brand)', color: '#fff' }}><Lucide.Download className="w-4 h-4" /></button>
                  ) : (
                    <button onClick={() => removeItem(item.id)} className="w-8 h-8 rounded-lg border surface inline-flex items-center justify-center shrink-0" style={{ color: '#b3261e' }} aria-label="Remove"><Lucide.X className="w-4 h-4" /></button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={compressAll} disabled={busy} className="rounded-xl px-6 py-3 font-bold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
              {busy ? (<><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Compressing...</>) : (<><Lucide.Minimize2 className="w-4 h-4" /> Compress {items.length > 1 ? 'all' : 'image'}</>)}
            </button>
            {anyDone && items.filter((i) => i.outBlob).length > 1 && (
              <button onClick={downloadZip} className="rounded-xl px-6 py-3 font-bold text-sm border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                <Lucide.FileArchive className="w-4 h-4" /> Download all as zip
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
