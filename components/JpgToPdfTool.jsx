'use client';

import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';

export default function JpgToPdfTool() {
  const [images, setImages] = useState([]);
  const [pageSize, setPageSize] = useState('fit'); // 'fit' | 'a4'
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  function addFiles(list) {
    setError('');
    const incoming = Array.from(list).filter((f) => f.type === 'image/jpeg' || f.type === 'image/png' || /\.(jpe?g|png)$/i.test(f.name));
    if (!incoming.length) {
      setError('Please choose JPG or PNG images.');
      return;
    }
    setImages((prev) => [...prev, ...incoming.map((f) => ({ id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2)}`, file: f, url: URL.createObjectURL(f) }))]);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  function move(index, dir) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(id) {
    setImages((prev) => {
      const found = prev.find((i) => i.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((i) => i.id !== id);
    });
  }

  async function convert() {
    if (!images.length) { setError('Add at least one image.'); return; }
    setBusy(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.create();
      const A4 = { w: 595.28, h: 841.89 };

      for (const item of images) {
        const bytes = await item.file.arrayBuffer();
        const isPng = item.file.type === 'image/png' || /\.png$/i.test(item.file.name);
        const img = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);

        if (pageSize === 'a4') {
          const page = doc.addPage([A4.w, A4.h]);
          const margin = 20;
          const maxW = A4.w - margin * 2;
          const maxH = A4.h - margin * 2;
          const scale = Math.min(maxW / img.width, maxH / img.height, 1);
          const w = img.width * scale;
          const h = img.height * scale;
          page.drawImage(img, { x: (A4.w - w) / 2, y: (A4.h - h) / 2, width: w, height: h });
        } else {
          const page = doc.addPage([img.width, img.height]);
          page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        }
      }

      const out = await doc.save();
      const blob = new Blob([out], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'craftora-images.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Something went wrong while creating the PDF. One of the images may be corrupted or an unsupported format.');
    } finally {
      setBusy(false);
    }
  }

  const formatSize = (b) => (b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`);

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
        <p className="muted text-sm mt-2">Or choose JPG and PNG images from your device. Add one or more.</p>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        <button onClick={() => inputRef.current?.click()} className="rounded-xl px-5 py-3 font-bold text-sm mt-6" style={{ background: 'var(--brand)', color: '#fff' }}>
          Choose images
        </button>
        <p className="muted text-xs mt-5">Your images stay private. The PDF is built in your browser and nothing is uploaded.</p>
      </div>

      {error && (
        <div className="mt-5 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#b3261e' }}>{error}</div>
      )}

      {images.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: 'var(--ink)' }}>{images.length} image{images.length === 1 ? '' : 's'} added</h3>
            <button onClick={() => { images.forEach((i) => URL.revokeObjectURL(i.url)); setImages([]); }} className="text-sm font-semibold muted hover:underline">Clear all</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((item, i) => (
              <div key={item.id} className="border surface rounded-xl overflow-hidden" style={{ background: 'var(--surface)' }}>
                <div className="aspect-[3/4] bg-black/5 flex items-center justify-center overflow-hidden">
                  <img src={item.url} alt={item.file.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="p-2">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--ink)' }}>{item.file.name}</p>
                  <p className="muted text-[11px]">{formatSize(item.file.size)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="w-7 h-7 rounded-md border surface inline-flex items-center justify-center disabled:opacity-30" style={{ color: 'var(--ink)' }} aria-label="Move left"><Lucide.ChevronLeft className="w-3.5 h-3.5" /></button>
                    <button onClick={() => move(i, 1)} disabled={i === images.length - 1} className="w-7 h-7 rounded-md border surface inline-flex items-center justify-center disabled:opacity-30" style={{ color: 'var(--ink)' }} aria-label="Move right"><Lucide.ChevronRight className="w-3.5 h-3.5" /></button>
                    <button onClick={() => remove(item.id)} className="w-7 h-7 rounded-md border surface inline-flex items-center justify-center ml-auto" style={{ color: '#b3261e' }} aria-label="Remove"><Lucide.X className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Page size</label>
            <div className="flex gap-2">
              <button onClick={() => setPageSize('fit')} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={pageSize === 'fit' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>Fit to image</button>
              <button onClick={() => setPageSize('a4')} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={pageSize === 'a4' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>A4 page</button>
            </div>
            <p className="muted text-xs mt-2">Fit to image makes each page match the image. A4 centers each image on a standard page.</p>
          </div>

          <button onClick={convert} disabled={busy} className="w-full sm:w-auto rounded-xl px-6 py-3 font-bold text-sm mt-6 inline-flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
            {busy ? (<><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Creating PDF...</>) : (<><Lucide.FileText className="w-4 h-4" /> Convert to PDF and download</>)}
          </button>
        </div>
      )}
    </div>
  );
}
