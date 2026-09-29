'use client';

import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';

export default function ImageUpscalerTool() {
  const [src, setSrc] = useState('');
  const [original, setOriginal] = useState(null);
  const [scale, setScale] = useState(2);
  const [sharpen, setSharpen] = useState(true);
  const [result, setResult] = useState('');
  const [busy, setBusy] = useState(false);
  const [outSize, setOutSize] = useState(null);
  const fileRef = useRef(null);

  function loadImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setOriginal({ w: img.naturalWidth, h: img.naturalHeight });
        setSrc(reader.result);
        setResult('');
        setOutSize(null);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function applySharpen(ctx, w, h) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const d = imageData.data;
    const copy = new Uint8ClampedArray(d);
    // Light sharpen kernel.
    const kernel = [0, -0.4, 0, -0.4, 2.6, -0.4, 0, -0.4, 0];
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0, ki = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * w + (x + kx)) * 4 + c;
              sum += copy[idx] * kernel[ki++];
            }
          }
          d[(y * w + x) * 4 + c] = sum;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  async function upscale() {
    if (!src || !original) return;
    setBusy(true);
    setResult('');
    await new Promise((r) => setTimeout(r, 50));

    const img = new Image();
    img.onload = () => {
      const outW = Math.round(original.w * scale);
      const outH = Math.round(original.h * scale);
      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      // Step-up scaling for smoother enlargement.
      let cw = original.w, ch = original.h;
      let tmp = document.createElement('canvas');
      tmp.width = cw; tmp.height = ch;
      tmp.getContext('2d').drawImage(img, 0, 0);
      while (cw * 2 <= outW) {
        const next = document.createElement('canvas');
        next.width = cw * 2; next.height = ch * 2;
        const nctx = next.getContext('2d');
        nctx.imageSmoothingEnabled = true;
        nctx.imageSmoothingQuality = 'high';
        nctx.drawImage(tmp, 0, 0, cw * 2, ch * 2);
        tmp = next; cw *= 2; ch *= 2;
      }
      ctx.drawImage(tmp, 0, 0, outW, outH);
      if (sharpen) applySharpen(ctx, outW, outH);
      const url = canvas.toDataURL('image/png');
      setResult(url);
      setOutSize({ w: outW, h: outH });
      setBusy(false);
    };
    img.src = src;
  }

  function download() {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result;
    a.download = `upscaled-${scale}x.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  function reset() {
    setSrc(''); setOriginal(null); setResult(''); setOutSize(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div>
      <div className="rounded-xl px-4 py-3 text-sm mb-6" style={{ background: 'var(--surface-soft)', color: 'var(--ink)' }}>
        This upscaler enlarges your image with high-quality smoothing and sharpening, right in your browser. It is great for making small images bigger without heavy pixelation. For photo-realistic AI upscaling of very low-resolution images, a dedicated AI service will go further.
      </div>

      {!src ? (
        <label className="border surface rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer text-center" style={{ background: 'var(--surface)' }}>
          <Lucide.ImagePlus className="w-10 h-10 muted mb-3" />
          <span className="font-semibold" style={{ color: 'var(--ink)' }}>Upload an image to upscale</span>
          <span className="muted text-sm mt-1">JPG, PNG, or WebP</span>
          <input ref={fileRef} type="file" accept="image/*" onChange={loadImage} className="hidden" />
        </label>
      ) : (
        <div>
          <div className="flex flex-wrap items-end gap-5 mb-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Scale</label>
              <div className="flex gap-2">
                {[2, 3, 4].map((s) => (
                  <button key={s} onClick={() => setScale(s)} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={scale === s ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>{s}x</button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer pb-2" style={{ color: 'var(--ink)' }}>
              <input type="checkbox" checked={sharpen} onChange={(e) => setSharpen(e.target.checked)} /> Sharpen
            </label>
            <button onClick={upscale} disabled={busy} className="rounded-xl px-6 py-2.5 font-bold text-sm inline-flex items-center gap-2 mb-0.5 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
              {busy ? <><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Upscaling...</> : <><Lucide.Maximize2 className="w-4 h-4" /> Upscale {scale}x</>}
            </button>
            <button onClick={reset} className="rounded-xl px-4 py-2.5 font-semibold text-sm border surface mb-0.5" style={{ color: 'var(--ink)' }}>New image</button>
          </div>

          {original && (
            <p className="muted text-sm mb-4">Original: {original.w} x {original.h} px{outSize && ` → Upscaled: ${outSize.w} x ${outSize.h} px`}</p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Original</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="Original" className="w-full rounded-xl border surface" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Upscaled</p>
                {result && <button onClick={download} className="text-sm font-semibold brand-text inline-flex items-center gap-1"><Lucide.Download className="w-4 h-4" /> Download PNG</button>}
              </div>
              {result ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={result} alt="Upscaled" className="w-full rounded-xl border surface" />
              ) : (
                <div className="w-full rounded-xl border surface flex items-center justify-center muted text-sm" style={{ minHeight: 200, background: 'var(--surface)' }}>Click Upscale to see the result</div>
              )}
            </div>
          </div>
        </div>
      )}

      <p className="muted text-xs mt-6">Everything runs in your browser. Your image is never uploaded. Larger scales and bigger images take a moment to process.</p>
    </div>
  );
}
