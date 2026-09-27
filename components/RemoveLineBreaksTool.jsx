'use client';

import { useState } from 'react';
import * as Lucide from 'lucide-react';

export default function RemoveLineBreaksTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [keepParagraphs, setKeepParagraphs] = useState(true);
  const [trimSpaces, setTrimSpaces] = useState(true);
  const [copied, setCopied] = useState(false);

  function process() {
    let text = input.replace(/\r\n/g, '\n');
    if (keepParagraphs) {
      // Collapse single breaks to spaces, keep double breaks as paragraph gaps.
      text = text
        .replace(/\n{2,}/g, '\u0000')       // mark paragraph breaks
        .replace(/\n/g, ' ')                // single breaks to space
        .replace(/\u0000/g, '\n\n');        // restore paragraph breaks
    } else {
      text = text.replace(/\n+/g, ' ');     // all breaks to space
    }
    if (trimSpaces) {
      text = text.replace(/[ \t]{2,}/g, ' ').replace(/ *\n */g, '\n').trim();
    }
    setOutput(text);
    setCopied(false);
  }

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function clearAll() {
    setInput(''); setOutput('');
  }

  return (
    <div>
      <div className="flex flex-wrap gap-5 mb-4">
        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer" style={{ color: 'var(--ink)' }}>
          <input type="checkbox" checked={keepParagraphs} onChange={(e) => setKeepParagraphs(e.target.checked)} /> Keep paragraph breaks
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer" style={{ color: 'var(--ink)' }}>
          <input type="checkbox" checked={trimSpaces} onChange={(e) => setTrimSpaces(e.target.checked)} /> Remove extra spaces
        </label>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Input</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={12} placeholder="Paste text with messy line breaks here" className="w-full border surface rounded-xl p-4 text-sm bg-transparent leading-6" style={{ color: 'var(--ink)' }} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Output</label>
            {output && (
              <button onClick={copyOutput} className="text-sm font-semibold brand-text inline-flex items-center gap-1">
                {copied ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy</>}
              </button>
            )}
          </div>
          <textarea value={output} readOnly rows={12} placeholder="Clean text appears here" className="w-full border surface rounded-xl p-4 text-sm bg-transparent leading-6" style={{ color: 'var(--ink)' }} />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={process} className="rounded-xl px-6 py-2.5 font-bold text-sm inline-flex items-center gap-2" style={{ background: 'var(--brand)', color: '#fff' }}>
          <Lucide.Eraser className="w-4 h-4" /> Remove line breaks
        </button>
        <button onClick={clearAll} className="rounded-xl px-4 py-2.5 font-semibold text-sm border surface" style={{ color: 'var(--ink)' }}>Clear</button>
      </div>
    </div>
  );
}
