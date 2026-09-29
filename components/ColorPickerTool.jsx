'use client';

import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';

function hexToRgb(hex) {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return { r, g, b };
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function ColorPickerTool() {
  const [color, setColor] = useState('#3430a8');
  const [palette, setPalette] = useState([]);
  const [copied, setCopied] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const formats = {
    HEX: color.toUpperCase(),
    RGB: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    HSL: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
  };

  function copy(key, value) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 1500);
    });
  }

  function addToPalette() {
    if (!palette.includes(color)) setPalette([...palette, color]);
  }

  function loadImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImgSrc(reader.result);
    reader.readAsDataURL(file);
  }

  function pickFromImage(e) {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const rect = img.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (img.naturalWidth / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (img.naturalHeight / rect.height));
    const p = ctx.getImageData(x, y, 1, 1).data;
    const hex = '#' + [p[0], p[1], p[2]].map((v) => v.toString(16).padStart(2, '0')).join('');
    setColor(hex);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Pick a color</label>
        <div className="flex items-center gap-4 mb-5">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-20 h-20 rounded-2xl border surface cursor-pointer bg-transparent" />
          <div className="w-full h-20 rounded-2xl border surface" style={{ background: color }} />
        </div>

        <div className="space-y-2">
          {Object.entries(formats).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3 border surface rounded-xl px-4 py-2.5" style={{ background: 'var(--surface)' }}>
              <span className="text-xs font-bold uppercase tracking-wide muted w-10">{key}</span>
              <span className="text-sm font-mono flex-1" style={{ color: 'var(--ink)' }}>{value}</span>
              <button onClick={() => copy(key, value)} className="brand-text shrink-0">
                {copied === key ? <Lucide.Check className="w-4 h-4" /> : <Lucide.Copy className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>

        <button onClick={addToPalette} className="rounded-xl px-5 py-2.5 font-bold text-sm mt-4 inline-flex items-center gap-2" style={{ background: 'var(--brand)', color: '#fff' }}>
          <Lucide.Plus className="w-4 h-4" /> Save to palette
        </button>

        {palette.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Your palette</p>
            <div className="flex flex-wrap gap-2">
              {palette.map((c, i) => (
                <div key={i} className="relative group">
                  <button onClick={() => setColor(c)} className="w-10 h-10 rounded-lg border surface" style={{ background: c }} title={c} />
                  <button onClick={() => setPalette(palette.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--ink)', color: 'var(--surface)' }}><Lucide.X className="w-2.5 h-2.5" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Or pick from an image</label>
        {imgSrc ? (
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={imgRef} src={imgSrc} alt="Pick colors" onClick={pickFromImage} className="w-full rounded-xl border surface cursor-crosshair" crossOrigin="anonymous" />
            <p className="muted text-xs mt-2">Click anywhere on the image to pick that color.</p>
            <button onClick={() => setImgSrc('')} className="text-sm font-semibold muted mt-2 inline-flex items-center gap-1"><Lucide.Trash2 className="w-4 h-4" /> Remove image</button>
          </div>
        ) : (
          <label className="border surface rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer text-center" style={{ background: 'var(--surface)', minHeight: 200 }}>
            <Lucide.ImagePlus className="w-8 h-8 muted mb-3" />
            <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Upload an image</span>
            <span className="muted text-xs mt-1">Then click it to pick any color</span>
            <input type="file" accept="image/*" onChange={loadImage} className="hidden" />
          </label>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
