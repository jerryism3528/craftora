'use client';

import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';

const SIZES = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
];

const HTML_SNIPPET = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">`;

export default function FaviconGeneratorTool() {
  const [file, setFile] = useState(null);
  const [imgUrl, setImgUrl] = useState('');
  const [previews, setPreviews] = useState([]); // { size, url }
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  function loadFile(f) {
    setError('');
    setPreviews([]);
    if (!/^image\/(jpeg|png|webp|svg\+xml)$/.test(f.type) && !/\.(jpe?g|png|webp|svg)$/i.test(f.name)) {
      setError('Please choose a JPG, PNG, WebP, or SVG image.');
      return;
    }
    setFile(f);
    setImgUrl(URL.createObjectURL(f));
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

  function renderSize(img, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    // Cover-fit the image into the square.
    const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    return canvas;
  }

  async function generate() {
    if (!file) { setError('Add an image first.'); return; }
    setBusy(true);
    setError('');
    try {
      const img = await loadImage(imgUrl);
      const out = [];
      for (const s of SIZES) {
        const canvas = renderSize(img, s.size);
        const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
        out.push({ size: s.size, name: s.name, blob, url: URL.createObjectURL(blob) });
      }
      setPreviews(out);
    } catch (e) {
      setError('Something went wrong while generating the favicons.');
    } finally {
      setBusy(false);
    }
  }

  async function downloadZip() {
    if (!previews.length) return;
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    previews.forEach((p) => zip.file(p.name, p.blob));
    zip.file('favicon-html-snippet.txt', HTML_SNIPPET);
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'craftora-favicons.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function copySnippet() {
    navigator.clipboard.writeText(HTML_SNIPPET).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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
            <Lucide.Image className="brand-text w-8 h-8" />
          </span>
          <h2 className="font-bold text-xl mt-5" style={{ color: 'var(--ink)' }}>Drop your logo or image here</h2>
          <p className="muted text-sm mt-2">Or choose an image. A square image works best for favicons.</p>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
          <button onClick={() => inputRef.current?.click()} className="rounded-xl px-5 py-3 font-bold text-sm mt-6" style={{ background: 'var(--brand)', color: '#fff' }}>
            Choose image
          </button>
          <p className="muted text-xs mt-5">Your image stays private. Favicons are generated in your browser and nothing is uploaded.</p>
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
              <p className="muted text-xs">Generates 16, 32, 48, 180, 192, and 512 px icons</p>
            </div>
            <button onClick={() => { setFile(null); setPreviews([]); setError(''); }} className="text-sm font-semibold muted hover:underline shrink-0">Change</button>
          </div>

          {previews.length === 0 ? (
            <button onClick={generate} disabled={busy} className="rounded-xl px-6 py-3 font-bold text-sm mt-6 inline-flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
              {busy ? (<><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Generating...</>) : (<><Lucide.Sparkles className="w-4 h-4" /> Generate favicons</>)}
            </button>
          ) : (
            <div className="mt-6">
              <div className="flex flex-wrap items-end gap-5">
                {previews.map((p) => (
                  <div key={p.size} className="text-center">
                    <div className="border surface rounded-lg p-2 inline-flex items-center justify-center" style={{ background: '#fff' }}>
                      <img src={p.url} alt={`${p.size}px`} style={{ width: Math.min(p.size, 64), height: Math.min(p.size, 64) }} />
                    </div>
                    <p className="muted text-xs mt-1">{p.size}px</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <button onClick={downloadZip} className="rounded-xl px-6 py-3 font-bold text-sm inline-flex items-center gap-2" style={{ background: 'var(--brand)', color: '#fff' }}>
                  <Lucide.Download className="w-4 h-4" /> Download favicon pack (zip)
                </button>
                <button onClick={() => setPreviews([])} className="rounded-xl px-5 py-3 font-bold text-sm border surface" style={{ color: 'var(--ink)' }}>Regenerate</button>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>HTML to paste in your &lt;head&gt;</label>
                  <button onClick={copySnippet} className="text-sm font-semibold brand-text inline-flex items-center gap-1">
                    {copied ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy</>}
                  </button>
                </div>
                <pre className="border surface rounded-xl p-4 text-xs overflow-x-auto" style={{ background: 'var(--surface-soft)', color: 'var(--ink)' }}>{HTML_SNIPPET}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
