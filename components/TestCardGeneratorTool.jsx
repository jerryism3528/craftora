'use client';

import { useState } from 'react';
import * as Lucide from 'lucide-react';

const NETWORKS = {
  Visa: { prefixes: ['4'], length: 16 },
  Mastercard: { prefixes: ['51', '52', '53', '54', '55', '2221', '2720'], length: 16 },
  Amex: { prefixes: ['34', '37'], length: 15 },
  Discover: { prefixes: ['6011', '65'], length: 16 },
  JCB: { prefixes: ['3528', '3538', '3556'], length: 16 },
};

function randDigit() { return Math.floor(Math.random() * 10); }

function luhnCheckDigit(partial) {
  let sum = 0;
  let alt = true;
  for (let i = partial.length - 1; i >= 0; i--) {
    let d = parseInt(partial[i], 10);
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    alt = !alt;
  }
  return (10 - (sum % 10)) % 10;
}

function makeCard(network) {
  const cfg = NETWORKS[network];
  const prefix = cfg.prefixes[Math.floor(Math.random() * cfg.prefixes.length)];
  let num = prefix;
  while (num.length < cfg.length - 1) num += randDigit();
  num += luhnCheckDigit(num);
  return num;
}

function formatCard(num, network) {
  if (network === 'Amex') return num.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
  return num.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function makeExpiry() {
  const mm = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const yy = String((new Date().getFullYear() % 100) + 2 + Math.floor(Math.random() * 4));
  return `${mm}/${yy}`;
}

function makeCvv(network) {
  const len = network === 'Amex' ? 4 : 3;
  let c = '';
  for (let i = 0; i < len; i++) c += randDigit();
  return c;
}

export default function TestCardGeneratorTool() {
  const [network, setNetwork] = useState('Visa');
  const [count, setCount] = useState(1);
  const [cards, setCards] = useState([]);
  const [copied, setCopied] = useState('');

  function generate() {
    const n = Math.min(Math.max(parseInt(count, 10) || 1, 1), 20);
    const list = Array.from({ length: n }, () => {
      const num = makeCard(network);
      return { number: num, display: formatCard(num, network), expiry: makeExpiry(), cvv: makeCvv(network) };
    });
    setCards(list);
    setCopied('');
  }

  function copy(key, value) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 1500);
    });
  }

  return (
    <div>

      <div className="flex flex-wrap items-end gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Card network</label>
          <select value={network} onChange={(e) => setNetwork(e.target.value)} className="rounded-xl border surface px-4 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }}>
            {Object.keys(NETWORKS).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>How many</label>
          <input type="number" min="1" max="20" value={count} onChange={(e) => setCount(e.target.value)} className="w-24 rounded-xl border surface px-4 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
        </div>
        <button onClick={generate} className="rounded-xl px-6 py-2.5 font-bold text-sm inline-flex items-center gap-2" style={{ background: 'var(--brand)', color: '#fff' }}>
          <Lucide.CreditCard className="w-4 h-4" /> Generate
        </button>
      </div>

      {cards.length > 0 && (
        <div className="mt-6 space-y-3">
          {cards.map((c, i) => (
            <div key={i} className="border surface rounded-xl p-4" style={{ background: 'var(--surface)' }}>
              <div className="flex items-center justify-between mb-3 gap-3">
                <p className="text-base sm:text-lg font-mono font-bold break-all" style={{ color: 'var(--ink)' }}>{c.display}</p>
                <button onClick={() => copy(`n${i}`, c.number)} className="text-sm font-semibold brand-text inline-flex items-center gap-1 shrink-0">
                  {copied === `n${i}` ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy</>}
                </button>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm muted">
                <span>Expiry: <strong style={{ color: 'var(--ink)' }}>{c.expiry}</strong></span>
                <span>CVV: <strong style={{ color: 'var(--ink)' }}>{c.cvv}</strong></span>
                <span>{network}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

