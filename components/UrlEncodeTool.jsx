'use client';

import { useState } from 'react';
import * as Lucide from 'lucide-react';

export default function UrlEncodeTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('component'); // 'component' | 'full'
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function encode() {
    setError('');
    setCopied(false);
    try {
      setOutput(mode === 'full' ? encodeURI(input) : encodeURIComponent(input));
    } catch (e) {
      setOutput('');
      setError('Could not encode this text.');
    }
  }

  function decode() {
    setError('');
    setCopied(false);
    try {
      setOutput(mode === 'full' ? decodeURI(input) : decodeURIComponent(input));
    } catch (e) {
      setOutput('');
      setError('This is not a valid encoded string. Check the input and try again.');
    }
  }

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function swap() {
    setInput(output);
    setOutput('');
    setError('');
  }

  function clearAll() {
    setInput('');
    setOutput('');
    setError('');
  }

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Mode</label>
        <div className="flex gap-2">
          <button onClick={() => setMode('component')} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={mode === 'component' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>Component (query values)</button>
          <button onClick={() => setMode('full')} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={mode === 'full' ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : { color: 'var(--ink)' }}>Full URL</button>
        </div>
        <p className="muted text-xs mt-2">
          {mode === 'component'
            ? 'Component encodes everything, best for a single query parameter value.'
            : 'Full URL keeps characters like : / ? # intact, best for encoding a whole address.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={encode} className="rounded-lg px-4 py-2 text-sm font-bold inline-flex items-center gap-2" style={{ background: 'var(--brand)', color: '#fff' }}>
          <Lucide.ArrowRight className="w-4 h-4" /> Encode
        </button>
        <button onClick={decode} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}>
          <Lucide.ArrowLeft className="w-4 h-4" /> Decode
        </button>
        <button onClick={clearAll} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={{ color: 'var(--ink)' }}>Clear</button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            placeholder="Type text or a URL to encode, or paste an encoded string to decode"
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
                <button onClick={swap} className="text-sm font-semibold brand-text inline-flex items-center gap-1"><Lucide.ArrowLeftRight className="w-4 h-4" /> Use as input</button>
                <button onClick={copyOutput} className="text-sm font-semibold brand-text inline-flex items-center gap-1">
                  {copied ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy</>}
                </button>
              </div>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            rows={10}
            placeholder="Result appears here"
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
