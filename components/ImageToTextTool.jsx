'use client';

import { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';

const LANGS = [
  ['eng', 'English'],
  ['spa', 'Spanish'],
  ['fra', 'French'],
  ['deu', 'German'],
  ['por', 'Portuguese'],
  ['ara', 'Arabic'],
];

export default function ImageToTextTool() {
  const [file, setFile] = useState(null);
  const [imgUrl, setImgUrl] = useState('');
  const [lang, setLang] = useState('eng');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  function loadFile(f) {
    setError('');
    setText('');
    if (!/^image\/(jpeg|png|webp|bmp)$/.test(f.type) && !/\.(jpe?g|png|webp|bmp)$/i.test(f.name)) {
      setError('Please choose a JPG, PNG, WebP, or BMP image.');
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

  async function run() {
    if (!file) { setError('Add an image first.'); return; }
    setBusy(true);
    setError('');
    setText('');
    setProgress('Loading language data...');
    try {
      const Tesseract = (await import('tesseract.js')).default;
      const result = await Tesseract.recognize(imgUrl, lang, {
        logger: (m) => {
          if (m.status === 'recognizing text') setProgress(`Reading text... ${Math.round(m.progress * 100)}%`);
          else if (m.status) setProgress(m.status.charAt(0).toUpperCase() + m.status.slice(1) + '...');
        },
      });
      const out = (result?.data?.text || '').trim();
      if (!out) setError('No readable text was found in this image. Try a clearer or higher contrast image.');
      setText(out);
    } catch (e) {
      setError('Something went wrong while reading the image. Please try again.');
    } finally {
      setBusy(false);
      setProgress('');
    }
  }

  function copyText() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function downloadText() {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'craftora-extracted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            <Lucide.ScanText className="brand-text w-8 h-8" />
          </span>
          <h2 className="font-bold text-xl mt-5" style={{ color: 'var(--ink)' }}>Drop your image here</h2>
          <p className="muted text-sm mt-2">Or choose an image with text to extract (JPG, PNG, WebP).</p>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/bmp" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
          <button onClick={() => inputRef.current?.click()} className="rounded-xl px-5 py-3 font-bold text-sm mt-6" style={{ background: 'var(--brand)', color: '#fff' }}>
            Choose image
          </button>
          <p className="muted text-xs mt-5">Your image stays private. Text is extracted in your browser and nothing is uploaded.</p>
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
            </div>
            <button onClick={() => { setFile(null); setText(''); setError(''); }} className="text-sm font-semibold muted hover:underline shrink-0">Change</button>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Language of the text</label>
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-xl border surface px-4 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }}>
              {LANGS.map(([code, label]) => <option key={code} value={code} style={{ color: '#000' }}>{label}</option>)}
            </select>
          </div>

          <button onClick={run} disabled={busy} className="w-full sm:w-auto rounded-xl px-6 py-3 font-bold text-sm mt-6 inline-flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
            {busy ? (<><Lucide.Loader2 className="w-4 h-4 animate-spin" /> {progress || 'Reading...'}</>) : (<><Lucide.ScanText className="w-4 h-4" /> Extract text</>)}
          </button>

          {busy && (
            <p className="muted text-xs mt-3">The first scan loads the language data, which can take a few seconds. Later scans are faster.</p>
          )}

          {text && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Extracted text</label>
                <div className="flex gap-3">
                  <button onClick={copyText} className="text-sm font-semibold brand-text inline-flex items-center gap-1">
                    {copied ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy</>}
                  </button>
                  <button onClick={downloadText} className="text-sm font-semibold brand-text inline-flex items-center gap-1"><Lucide.Download className="w-4 h-4" /> Download</button>
                </div>
              </div>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} className="w-full border surface rounded-xl p-4 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
