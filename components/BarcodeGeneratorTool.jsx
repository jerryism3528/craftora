'use client';

import { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';

const FORMATS = [
  ['CODE128', 'CODE128 (general purpose)'],
  ['EAN13', 'EAN-13 (retail, 12-13 digits)'],
  ['EAN8', 'EAN-8 (small retail, 7-8 digits)'],
  ['UPC', 'UPC-A (US retail, 11-12 digits)'],
  ['CODE39', 'CODE39 (letters and numbers)'],
  ['ITF14', 'ITF-14 (shipping, 13-14 digits)'],
];

export default function BarcodeGeneratorTool() {
  const [text, setText] = useState('CRAFTORA123');
  const [format, setFormat] = useState('CODE128');
  const [showText, setShowText] = useState(true);
  const [error, setError] = useState('');
  const svgRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      setError('');
      if (!text.trim() || !svgRef.current) return;
      try {
        const JsBarcode = (await import('jsbarcode')).default;
        if (cancelled) return;
        JsBarcode(svgRef.current, text, {
          format,
          displayValue: showText,
          lineColor: '#111111',
          background: '#ffffff',
          width: 2,
          height: 90,
          margin: 12,
          fontOptions: 'bold',
          fontSize: 16,
        });
      } catch (e) {
        setError(`This value is not valid for ${format}. Check the format's requirements below.`);
      }
    }
    render();
    return () => { cancelled = true; };
  }, [text, format, showText]);

  function downloadSvg() {
    if (!svgRef.current || error) return;
    const data = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([data], { type: 'image/svg+xml' });
    triggerDownload(URL.createObjectURL(blob), 'barcode.svg');
  }

  function downloadPng() {
    if (!svgRef.current || error) return;
    const data = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([data], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      triggerDownload(canvas.toDataURL('image/png'), 'barcode.png');
    };
    img.src = url;
  }

  function triggerDownload(href, name) {
    const a = document.createElement('a');
    a.href = href;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Barcode value</label>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter the value to encode" className="w-full border surface rounded-xl px-4 py-2.5 text-sm bg-transparent font-mono" style={{ color: 'var(--ink)' }} />

        <div className="mt-5">
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }}>
            {FORMATS.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer mt-5" style={{ color: 'var(--ink)' }}>
          <input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} /> Show value under barcode
        </label>

        {error && <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#b3261e' }}>{error}</div>}
      </div>

      <div className="flex flex-col items-center">
        <div className="border surface rounded-2xl p-4 w-full flex items-center justify-center" style={{ background: '#ffffff', minHeight: 160 }}>
          <svg ref={svgRef} style={{ maxWidth: '100%', display: error ? 'none' : 'block' }} />
          {error && <span className="text-sm" style={{ color: '#b3261e' }}>Invalid value for this format</span>}
        </div>
        {!error && (
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
