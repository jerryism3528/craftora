'use client';

import { useEffect, useRef, useState } from 'react';
import { X, PenLine, Type, Upload, Eraser } from 'lucide-react';
import '@fontsource/dancing-script/400.css';
import '@fontsource/dancing-script/700.css';

const W = 600;
const H = 200;
const STYLES = [
  { key: 'script', label: 'Script', font: (s) => `700 ${s}px "Dancing Script", cursive` },
  { key: 'script-light', label: 'Light script', font: (s) => `400 ${s}px "Dancing Script", cursive` },
  { key: 'italic', label: 'Italic', font: (s) => `italic 600 ${s}px Georgia, "Times New Roman", serif` },
];

// Crop transparent edges so the signature fills its box nicely.
function trimCanvas(src) {
  const ctx = src.getContext('2d');
  const { width, height } = src;
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width; let minY = height; let maxX = -1; let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 10) {
        if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  const pad = 6;
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad); maxY = Math.min(height - 1, maxY + pad);
  const out = document.createElement('canvas');
  out.width = maxX - minX + 1;
  out.height = maxY - minY + 1;
  out.getContext('2d').drawImage(src, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
  return out.toDataURL('image/png');
}

export default function SignatureModal({ open, kind = 'signature', defaultText = '', color = '#1a1f4e', onClose, onSave }) {
  const [tab, setTab] = useState('draw');
  const [text, setText] = useState(defaultText);
  const [style, setStyle] = useState('script');
  const [error, setError] = useState('');
  const [hasInk, setHasInk] = useState(false);
  const canvasRef = useRef(null);
  const uploadRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);

  useEffect(() => { if (open) { setText(defaultText); setError(''); setHasInk(false); } }, [open, defaultText]);

  useEffect(() => {
    if (!open || tab !== 'draw') return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.2;
    const pos = (e) => {
      const r = c.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
    };
    const down = (e) => { e.preventDefault(); c.setPointerCapture(e.pointerId); drawing.current = true; last.current = pos(e); setHasInk(true); };
    const move = (e) => {
      if (!drawing.current) return;
      e.preventDefault();
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.quadraticCurveTo(last.current.x, last.current.y, (last.current.x + p.x) / 2, (last.current.y + p.y) / 2);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last.current = p;
    };
    const up = () => { drawing.current = false; };
    c.addEventListener('pointerdown', down);
    c.addEventListener('pointermove', move);
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
    return () => {
      c.removeEventListener('pointerdown', down);
      c.removeEventListener('pointermove', move);
      c.removeEventListener('pointerup', up);
      c.removeEventListener('pointercancel', up);
    };
  }, [open, tab, color]);

  if (!open) return null;

  async function renderTyped(styleKey) {
    const st = STYLES.find((s) => s.key === styleKey) || STYLES[0];
    try { await document.fonts.load(st.font(80)); } catch {}
    const c = document.createElement('canvas');
    c.width = 900; c.height = 220;
    const ctx = c.getContext('2d');
    let size = kind === 'initials' ? 120 : 96;
    ctx.font = st.font(size);
    while (ctx.measureText(text).width > 860 && size > 30) { size -= 4; ctx.font = st.font(size); }
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 20, 115);
    return trimCanvas(c);
  }

  async function save() {
    setError('');
    let url = null;
    if (tab === 'draw') {
      if (!hasInk) return setError('Draw your signature in the box first.');
      url = trimCanvas(canvasRef.current);
    } else if (tab === 'type') {
      if (!text.trim()) return setError(`Type your ${kind === 'initials' ? 'initials' : 'name'} first.`);
      url = await renderTyped(style);
    }
    if (!url) return setError('Nothing to save yet.');
    onSave(url);
  }

  function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) return setError('Upload a PNG, JPG, or WebP image.');
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 800 / img.width, 300 / img.height);
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, c.width, c.height);
      // Make near-white pixels transparent so scans look clean.
      const d = ctx.getImageData(0, 0, c.width, c.height);
      for (let i = 0; i < d.data.length; i += 4) if (d.data[i] > 225 && d.data[i + 1] > 225 && d.data[i + 2] > 225) d.data[i + 3] = 0;
      ctx.putImageData(d, 0, 0);
      const url = trimCanvas(c);
      if (url) onSave(url); else setError('The image looks empty.');
    };
    img.onerror = () => setError('Could not read that image.');
    img.src = URL.createObjectURL(file);
  }

  const tabBtn = (k, Icon, label) => (
    <button type="button" onClick={() => setTab(k)} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold ${tab === k ? 'bg-white dark:bg-slate-700 shadow text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300'}`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full sm:max-w-xl bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{kind === 'initials' ? 'Add your initials' : 'Add your signature'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Close"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mt-4">
          {tabBtn('draw', PenLine, 'Draw')}
          {tabBtn('type', Type, 'Type')}
          {tabBtn('upload', Upload, 'Upload')}
        </div>

        {tab === 'draw' && (
          <div className="mt-4">
            <div className="relative rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white">
              <canvas ref={canvasRef} width={W} height={H} className="w-full h-auto touch-none cursor-crosshair rounded-xl" style={{ aspectRatio: `${W}/${H}` }} />
              <div className="absolute left-6 right-6 bottom-10 border-b border-slate-300 pointer-events-none" />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Use your mouse, finger, or stylus.</span>
              <button type="button" onClick={() => { canvasRef.current.getContext('2d').clearRect(0, 0, W, H); setHasInk(false); }} className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600"><Eraser className="w-3.5 h-3.5" /> Clear</button>
            </div>
          </div>
        )}

        {tab === 'type' && (
          <div className="mt-4 space-y-3">
            <input value={text} onChange={(e) => setText(e.target.value.slice(0, 60))} placeholder={kind === 'initials' ? 'Your initials' : 'Your full name'}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <div className="grid gap-2">
              {STYLES.map((s) => (
                <button key={s.key} type="button" onClick={() => setStyle(s.key)} className={`text-left px-4 py-3 rounded-xl border-2 bg-white ${style === s.key ? 'border-indigo-500' : 'border-slate-200 dark:border-slate-600'}`}>
                  <span style={{ font: s.font(30), color }}>{text || (kind === 'initials' ? 'AB' : 'Your Name')}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'upload' && (
          <div className="mt-4">
            <button type="button" onClick={() => uploadRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 py-10 text-center hover:border-indigo-400">
              <Upload className="w-7 h-7 mx-auto text-indigo-500" />
              <div className="font-semibold text-slate-900 dark:text-white mt-2">Upload an image of your signature</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, or WebP. A white background is removed automatically.</div>
            </button>
            <input ref={uploadRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onUpload} />
          </div>
        )}

        {error && <p className="text-sm text-red-600 dark:text-red-400 mt-3">{error}</p>}
        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 mt-4">By selecting Adopt and sign, I agree that this mark is my electronic signature and has the same effect as my handwritten signature.</p>
        {tab !== 'upload' && (
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-slate-800 dark:text-slate-100">Cancel</button>
            <button type="button" onClick={save} className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Adopt and sign</button>
          </div>
        )}
      </div>
    </div>
  );
}
