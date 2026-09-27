'use client';

import { useState } from 'react';
import * as Lucide from 'lucide-react';

function luhnValid(num) {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = parseInt(num[i], 10);
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    alt = !alt;
  }
  return num.length > 0 && sum % 10 === 0;
}

function detectBrand(num) {
  if (/^4/.test(num)) return 'Visa';
  if (/^(5[1-5]|22[2-9]|2[3-6]|27[01]|2720)/.test(num)) return 'Mastercard';
  if (/^3[47]/.test(num)) return 'American Express';
  if (/^(6011|65|64[4-9]|622)/.test(num)) return 'Discover';
  if (/^35(2[89]|[3-8])/.test(num)) return 'JCB';
  if (/^3(0[0-5]|[68])/.test(num)) return 'Diners Club';
  if (/^(50|5[6-9]|6[0-9])/.test(num)) return 'Maestro';
  return 'Unknown';
}

// Expected lengths per brand for a quick sanity note.
const LENGTHS = {
  Visa: [13, 16, 19],
  Mastercard: [16],
  'American Express': [15],
  Discover: [16, 19],
  JCB: [16, 17, 18, 19],
  'Diners Club': [14, 15, 16, 19],
  Maestro: [12, 13, 14, 15, 16, 17, 18, 19],
};

export default function CardValidatorTool() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  function check() {
    const digits = input.replace(/\D/g, '');
    if (!digits) { setResult(null); return; }
    const brand = detectBrand(digits);
    const valid = luhnValid(digits);
    const lengths = LENGTHS[brand];
    const lengthOk = lengths ? lengths.includes(digits.length) : null;
    setResult({ digits, brand, valid, length: digits.length, lengthOk });
  }

  function clearAll() {
    setInput('');
    setResult(null);
  }

  return (
    <div>
      <div className="rounded-xl px-4 py-3 text-sm mb-6" style={{ background: 'var(--surface-soft)', color: 'var(--ink)' }}>
        This checks a card number's format only (Luhn checksum and brand). It does not contact any bank and cannot tell you if a card is active or has funds. Everything runs in your browser.
      </div>

      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Card number</label>
      <div className="flex flex-wrap gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') check(); }}
          placeholder="e.g. 4242 4242 4242 4242"
          className="flex-1 min-w-0 rounded-xl border surface px-4 py-2.5 text-sm bg-transparent font-mono"
          style={{ color: 'var(--ink)' }}
          inputMode="numeric"
        />
        <button onClick={check} className="rounded-xl px-6 py-2.5 font-bold text-sm" style={{ background: 'var(--brand)', color: '#fff' }}>Validate</button>
        <button onClick={clearAll} className="rounded-xl px-4 py-2.5 font-semibold text-sm border surface" style={{ color: 'var(--ink)' }}>Clear</button>
      </div>

      {result && (
        <div className="mt-6 border surface rounded-2xl p-6" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center gap-3 mb-5">
            {result.valid ? (
              <>
                <Lucide.CheckCircle2 className="w-8 h-8" style={{ color: 'var(--mint)' }} />
                <div>
                  <p className="font-bold text-lg" style={{ color: 'var(--ink)' }}>Valid format</p>
                  <p className="muted text-sm">This number passes the Luhn check.</p>
                </div>
              </>
            ) : (
              <>
                <Lucide.XCircle className="w-8 h-8" style={{ color: '#b3261e' }} />
                <div>
                  <p className="font-bold text-lg" style={{ color: 'var(--ink)' }}>Invalid format</p>
                  <p className="muted text-sm">This number fails the Luhn check. Check for a typo.</p>
                </div>
              </>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="border surface rounded-xl p-4">
              <p className="muted mb-1">Card brand</p>
              <p className="font-bold" style={{ color: 'var(--ink)' }}>{result.brand}</p>
            </div>
            <div className="border surface rounded-xl p-4">
              <p className="muted mb-1">Length</p>
              <p className="font-bold" style={{ color: 'var(--ink)' }}>{result.length} digits</p>
            </div>
            <div className="border surface rounded-xl p-4">
              <p className="muted mb-1">Length check</p>
              <p className="font-bold" style={{ color: 'var(--ink)' }}>
                {result.lengthOk === null ? 'Unknown brand' : result.lengthOk ? 'Expected' : 'Unexpected'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
