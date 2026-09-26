'use client';

import { useState } from 'react';
import * as Lucide from 'lucide-react';

export default function JsonFormatterTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function process(mode) {
    setError('');
    setCopied(false);
    if (!input.trim()) { setError('Paste some JSON first.'); setOutput(''); return; }
    try {
      const parsed = JSON.parse(input);
      if (mode === 'pretty') setOutput(JSON.stringify(parsed, null, 2));
      else setOutput(JSON.stringify(parsed));
    } catch (e) {
      setOutput('');
      setError(`Invalid JSON: ${e.message}`);
    }
  }

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function downloadOutput() {
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function clearAll() {
    setInput('');
    setOutput('');
    setError('');
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => process('pretty')} className="rounded-lg px-4 py-2 text-sm font-bold inline-flex items-center gap-2" style={{ background: 'var(--brand)', color: '#fff' }}>
          <Lucide.Braces className="w-4 h-4" /> Format
        </button>
        <button onClick={() => process('minify')} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}>
          <Lucide.Minimize2 className="w-4 h-4" /> Minify
        </button>
        <button onClick={clearAll} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={{ color: 'var(--ink)' }}>Clear</button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Input JSON</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={16}
            placeholder='{"name": "Craftora", "free": true}'
            className="w-full border surface rounded-xl p-4 text-sm bg-transparent font-mono"
            style={{ color: 'var(--ink)' }}
            spellCheck={false}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Output</label>
            {output && (
              <div className="flex gap-3">
                <button onClick={copyOutput} className="text-sm font-semibold brand-text inline-flex items-center gap-1">
                  {copied ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy</>}
                </button>
                <button onClick={downloadOutput} className="text-sm font-semibold brand-text inline-flex items-center gap-1"><Lucide.Download className="w-4 h-4" /> Download</button>
              </div>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            rows={16}
            placeholder="Formatted JSON appears here"
            className="w-full border surface rounded-xl p-4 text-sm bg-transparent font-mono"
            style={{ color: 'var(--ink)' }}
            spellCheck={false}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: '#b3261e' }}>{error}</div>
      )}
    </div>
  );
}
