'use client';

import { useState, useMemo } from 'react';
import * as Lucide from 'lucide-react';

export default function WordCounterTool() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const sentences = trimmed ? (trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed]).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n+/).filter((p) => p.trim()).length : 0;
    const readingTime = Math.ceil(words / 200); // ~200 wpm
    const speakingTime = Math.ceil(words / 130); // ~130 wpm
    return { words, chars, charsNoSpaces, sentences, paragraphs, readingTime, speakingTime };
  }, [text]);

  function copyText() {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const cards = [
    ['Words', stats.words],
    ['Characters', stats.chars],
    ['Characters (no spaces)', stats.charsNoSpaces],
    ['Sentences', stats.sentences],
    ['Paragraphs', stats.paragraphs],
    ['Reading time', `${stats.readingTime} min`],
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {cards.map(([label, value]) => (
          <div key={label} className="border surface rounded-xl p-4 text-center" style={{ background: 'var(--surface)' }}>
            <p className="text-2xl font-extrabold" style={{ color: 'var(--brand)' }}>{value}</p>
            <p className="muted text-xs mt-1 leading-4">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Your text</label>
        <div className="flex gap-3">
          {text && (
            <>
              <button onClick={copyText} className="text-sm font-semibold brand-text inline-flex items-center gap-1">
                {copied ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy</>}
              </button>
              <button onClick={() => setText('')} className="text-sm font-semibold brand-text inline-flex items-center gap-1"><Lucide.Trash2 className="w-4 h-4" /> Clear</button>
            </>
          )}
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={14}
        placeholder="Start typing or paste your text here. The counts update as you go."
        className="w-full border surface rounded-xl p-4 text-sm bg-transparent leading-6"
        style={{ color: 'var(--ink)' }}
      />
      <p className="muted text-xs mt-3">Speaking time: about {stats.speakingTime} min at a normal pace. Everything is counted in your browser, nothing is uploaded.</p>
    </div>
  );
}
