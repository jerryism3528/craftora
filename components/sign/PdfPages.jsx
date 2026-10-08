'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

// pdf.js is loaded from /public/pdfjs (v3.11.174) so the bundler never touches it.
let pdfjsPromise = null;
function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = new Promise((resolve, reject) => {
      if (window.pdfjsLib) return resolve(window.pdfjsLib);
      const s = document.createElement('script');
      s.src = '/pdfjs/pdf.min.js';
      s.async = true;
      s.onload = () => {
        const lib = window.pdfjsLib;
        if (!lib) return reject(new Error('pdf.js failed to load'));
        lib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.js';
        resolve(lib);
      };
      s.onerror = () => { pdfjsPromise = null; reject(new Error('pdf.js failed to load')); };
      document.head.appendChild(s);
    });
  }
  return pdfjsPromise;
}

// Renders every page of a PDF at the container width, with an overlay slot per page.
export default function PdfPages({ src, renderOverlay, onLoaded, maxWidth = 900, pageRefs }) {
  const wrapRef = useRef(null);
  const canvases = useRef([]);
  const pdfRef = useRef(null);
  const [sizes, setSizes] = useState([]);
  const [width, setWidth] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setSizes([]);
    setError('');
    (async () => {
      try {
        const pdfjs = await loadPdfjs();
        const pdf = await pdfjs.getDocument({ url: src, withCredentials: true }).promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        const list = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const vp = page.getViewport({ scale: 1 });
          list.push({ w: vp.width, h: vp.height });
        }
        if (!cancelled) { setSizes(list); onLoaded && onLoaded(list); }
      } catch (e) {
        if (!cancelled) setError('Could not load the document preview.');
      }
    })();
    return () => { cancelled = true; };
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(Math.min(maxWidth, el.clientWidth)));
    ro.observe(el);
    setWidth(Math.min(maxWidth, el.clientWidth));
    return () => ro.disconnect();
  }, [maxWidth]);

  useEffect(() => {
    if (!sizes.length || !width || !pdfRef.current) return;
    let cancelled = false;
    (async () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (let i = 0; i < sizes.length; i++) {
        if (cancelled) return;
        const canvas = canvases.current[i];
        if (!canvas) continue;
        const page = await pdfRef.current.getPage(i + 1);
        const scale = width / sizes[i].w;
        const vp = page.getViewport({ scale: scale * dpr });
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      }
    })();
    return () => { cancelled = true; };
  }, [sizes, width]);

  return (
    <div ref={wrapRef} className="w-full">
      {error && <div className="p-6 text-center text-red-600 dark:text-red-400">{error}</div>}
      {!sizes.length && !error && (
        <div className="flex items-center justify-center py-24 text-slate-500 dark:text-slate-400"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading document...</div>
      )}
      <div className="space-y-6">
        {width > 0 && sizes.map((s, i) => {
          const h = (width * s.h) / s.w;
          return (
            <div key={i} ref={(el) => { if (pageRefs) pageRefs.current[i] = el; }} className="mx-auto" style={{ width }}>
              <div className="relative bg-white shadow-md ring-1 ring-slate-200 dark:ring-slate-700 select-none" style={{ width, height: h }} data-page={i + 1}>
                <canvas ref={(el) => { canvases.current[i] = el; }} className="absolute inset-0 w-full h-full" />
                <div className="absolute inset-0">{renderOverlay && renderOverlay(i + 1, { width, height: h })}</div>
              </div>
              <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-1.5">Page {i + 1} of {sizes.length}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
