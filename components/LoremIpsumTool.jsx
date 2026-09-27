'use client';

import { useState } from 'react';
import * as Lucide from 'lucide-react';

const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick() { return WORDS[Math.floor(Math.random() * WORDS.length)]; }

function makeSentence() {
  const len = rand(6, 14);
  const words = Array.from({ length: len }, pick);
  let s = words.join(' ');
  // Occasional comma.
  if (len > 8) {
    const pos = rand(3, len - 3);
    words[pos] = words[pos] + ',';
    s = words.join(' ');
  }
  return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}

function makeParagraph() {
  const count = rand(3, 6);
  return Array.from({ length: count }, makeSentence).join(' ');
}

export default function LoremIpsumTool() {
  const [type, setType] = useState('paragraphs');
  const [count, setCount] = useState(3);
  const [startClassic, setStartClassic] = useState(true);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  function generate() {
    const n = Math.min(Math.max(parseInt(count, 10) || 1, 1), 100);
    let result = '';
    if (type === 'paragraphs') {
      const paras = Array.from({ length: n }, makeParagraph);
      if (startClassic) paras[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' + paras[0];
      result = paras.join('\n\n');
    } else if (type === 'sentences') {
      const sents = Array.from({ length: n }, makeSentence);
      if (startClassic) sents[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
      result = sents.join(' ');
    } else {
      let w = Array.from({ length: n }, pick);
      if (startClassic) {
        const classic = 'lorem ipsum dolor sit amet'.split(' ');
        w = classic.concat(w).slice(0, n);
      }
      result = w.join(' ');
      result = result.charAt(0).toUpperCase() + result.slice(1) + '.';
    }
    setOutput(result);
    setCopied(false);
  }

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Amount</label>
          <input type="number" min="1" max="100" value={count} onChange={(e) => setCount(e.target.value)} className="w-24 rounded-xl border surface px-4 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border surface px-4 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }}>
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer pb-2" style={{ color: 'var(--ink)' }}>
          <input type="checkbox" checked={startClassic} onChange={(e) => setStartClassic(e.target.checked)} /> Start with "Lorem ipsum"
        </label>
        <button onClick={generate} className="rounded-xl px-6 py-2.5 font-bold text-sm inline-flex items-center gap-2 mb-0.5" style={{ background: 'var(--brand)', color: '#fff' }}>
          <Lucide.Type className="w-4 h-4" /> Generate
        </button>
      </div>

      {output && (
        <div className="mt-6">
          <div className="flex justify-end mb-2">
            <button onClick={copyOutput} className="text-sm font-semibold brand-text inline-flex items-center gap-1">
              {copied ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>
          <div className="border surface rounded-xl p-5 text-sm leading-7 whitespace-pre-wrap" style={{ color: 'var(--ink)', background: 'var(--surface)' }}>{output}</div>
        </div>
      )}
    </div>
  );
}
