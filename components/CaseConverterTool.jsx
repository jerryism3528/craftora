'use client';

import { useState } from 'react';
import * as Lucide from 'lucide-react';

function toTitle(s) {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
function toSentence(s) {
  return s.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
}
function words(s) {
  return s.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim().split(/\s+/).filter(Boolean);
}
function toCamel(s) {
  const w = words(s);
  return w.map((x, i) => (i === 0 ? x.toLowerCase() : x.charAt(0).toUpperCase() + x.slice(1).toLowerCase())).join('');
}
function toPascal(s) {
  return words(s).map((x) => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join('');
}
function toSnake(s) {
  return words(s).map((x) => x.toLowerCase()).join('_');
}
function toKebab(s) {
  return words(s).map((x) => x.toLowerCase()).join('-');
}

const MODES = [
  ['UPPERCASE', (s) => s.toUpperCase()],
  ['lowercase', (s) => s.toLowerCase()],
  ['Title Case', toTitle],
  ['Sentence case', toSentence],
  ['camelCase', toCamel],
  ['PascalCase', toPascal],
  ['snake_case', toSnake],
  ['kebab-case', toKebab],
];

export default function CaseConverterTool() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState('');

  function apply(fn) {
    setText(fn(text));
    setCopied('');
  }

  function copyText() {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied('main');
      setTimeout(() => setCopied(''), 2000);
    });
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Your text</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="Type or paste your text, then pick a case below."
        className="w-full border surface rounded-xl p-4 text-sm bg-transparent leading-6"
        style={{ color: 'var(--ink)' }}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
        {MODES.map(([label, fn]) => (
          <button
            key={label}
            onClick={() => apply(fn)}
            className="rounded-xl border surface px-3 py-2.5 text-sm font-semibold"
            style={{ color: 'var(--ink)' }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={copyText} className="rounded-xl px-5 py-2.5 font-bold text-sm inline-flex items-center gap-2" style={{ background: 'var(--brand)', color: '#fff' }}>
          {copied === 'main' ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy result</>}
        </button>
        <button onClick={() => setText('')} className="rounded-xl px-4 py-2.5 font-semibold text-sm border surface" style={{ color: 'var(--ink)' }}>Clear</button>
      </div>
    </div>
  );
}
