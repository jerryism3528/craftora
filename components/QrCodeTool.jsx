'use client';

import { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';

export default function QrCodeTool() {
  const [text, setText] = useState('https://craftora.dev');
  const [size, setSize] = useState(300);
  const [fg, setFg] = useState('#202b58');
  const [bg, setBg] = useState('#ffffff');
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      setError('');
      if (!text.trim()) { setDataUrl(''); return; }
      try {
        const QRCode = (await import('qrcode')).default;
        const url = await QRCode.toDataURL(text, {
          width: parseInt(size, 10) || 300,
          margin: 2,
          color: { dark: fg, light: bg },
          errorCorrectionLevel: 'M',
        });
        if (!cancelled) setDataUrl(url);
      } catch (e) {
        if (!cancelled) { setDataUrl(''); setError('Could not generate a QR code for this input.'); }
      }
    }
    render();
    return () => { cancelled = true; };
  }, [text, size, fg, bg]);

  function downloadPng() {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'craftora-qr-code.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function downloadSvg() {
    if (!text.trim()) return;
    const QRCode = (await import('qrcode')).default;
    const svg = await QRCode.toString(text, {
      type: 'svg',
      margin: 2,
      color: { dark: fg, light: bg },
      errorCorrectionLevel: 'M',
    });
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'craftora-qr-code.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Text or URL</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Enter a link, text, or anything to encode"
          className="w-full border surface rounded-xl p-4 text-sm bg-transparent"
          style={{ color: 'var(--ink)' }}
        />

        <div className="mt-5">
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Size: {size}px</label>
          <input type="range" min="150" max="1000" step="50" value={size} onChange={(e) => setSize(e.target.value)} className="w-full max-w-xs" />
        </div>

        <div className="flex flex-wrap gap-6 mt-5">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>QR color</label>
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-16 h-9 rounded-lg border surface cursor-pointer bg-transparent" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Background</label>
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-16 h-9 rounded-lg border surface cursor-pointer bg-transparent" />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#b3261e' }}>{error}</div>
        )}
      </div>

      <div className="flex flex-col items-center">
        <div className="border surface rounded-2xl p-6" style={{ background: 'var(--surface)' }}>
          {dataUrl ? (
            <img src={dataUrl} alt="QR code" className="max-w-full" style={{ width: Math.min(parseInt(size, 10) || 300, 300) }} />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center muted text-sm">Enter text to see your QR code</div>
          )}
        </div>
        {dataUrl && (
          <div className="flex gap-3 mt-5">
            <button onClick={downloadPng} className="rounded-xl px-5 py-3 font-bold text-sm inline-flex items-center gap-2" style={{ background: 'var(--brand)', color: '#fff' }}>
              <Lucide.Download className="w-4 h-4" /> PNG
            </button>
            <button onClick={downloadSvg} className="rounded-xl px-5 py-3 font-bold text-sm border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}>
              <Lucide.Download className="w-4 h-4" /> SVG
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
