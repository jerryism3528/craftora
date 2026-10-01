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

const LENGTHS = {
  Visa: [13, 16, 19],
  Mastercard: [16],
  'American Express': [15],
  Discover: [16, 19],
  JCB: [16, 17, 18, 19],
  'Diners Club': [14, 15, 16, 19],
  Maestro: [12, 13, 14, 15, 16, 17, 18, 19],
};

function titleCase(s) {
  return s ? s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : '';
}

export default function CardValidatorTool() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [bin, setBin] = useState(null); // null | 'loading' | {found, data} | 'error'

  async function check() {
    const digits = input.replace(/\D/g, '');
    if (!digits) { setResult(null); setBin(null); return; }
    const brand = detectBrand(digits);
    const valid = luhnValid(digits);
    const lengths = LENGTHS[brand];
    const lengthOk = lengths ? lengths.includes(digits.length) : null;
    setResult({ digits, brand, valid, length: digits.length, lengthOk });

    // Fetch BIN details if we have at least 6 digits.
    if (digits.length >= 6) {
      setBin('loading');
      try {
        const res = await fetch('/api/tools/bin-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bin: digits }),
        });
        const data = await res.json();
        if (!data.ok) { setBin('error'); return; }
        setBin(data.found ? { found: true, data: data.data } : { found: false });
      } catch (e) {
        setBin('error');
      }
    } else {
      setBin(null);
    }
  }

  function clearAll() {
    setInput('');
    setResult(null);
    setBin(null);
  }

  return (
    <div>
      <div className="rounded-xl px-4 py-3 text-sm mb-6" style={{ background: 'var(--surface-soft)', color: 'var(--ink)' }}>
        This checks a card number's format (Luhn checksum and brand) and looks up its issuing bank, country, and card type from the BIN. It does not contact any bank and cannot tell you if a card is active or has funds.
      </div>

      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Card number or BIN (first 6-8 digits)</label>
      <div className="flex flex-wrap gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') check(); }}
          placeholder="e.g. 4242 4242 4242 4242 or 424242"
          className="flex-1 min-w-0 rounded-xl border surface px-4 py-2.5 text-sm bg-transparent font-mono"
          style={{ color: 'var(--ink)' }}
          inputMode="numeric"
        />
        <button onClick={check} className="rounded-xl px-6 py-2.5 font-bold text-sm" style={{ background: 'var(--brand)', color: '#fff' }}>Check</button>
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

          <div className="grid sm:grid-cols-3 gap-4 text-sm mb-4">
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

          {/* BIN details */}
          {bin === 'loading' && (
            <div className="border surface rounded-xl p-4 flex items-center gap-2 text-sm muted"><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Looking up card details...</div>
          )}
          {bin && bin.found && (
            <div>
              <p className="text-sm font-bold mb-2" style={{ color: 'var(--ink)' }}>Card details (from BIN)</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="border surface rounded-xl p-4">
                  <p className="muted mb-1">Issuing bank</p>
                  <p className="font-bold" style={{ color: 'var(--ink)' }}>{bin.data.bank || 'Unknown'}</p>
                </div>
                <div className="border surface rounded-xl p-4">
                  <p className="muted mb-1">Country</p>
                  <p className="font-bold" style={{ color: 'var(--ink)' }}>{bin.data.country || 'Unknown'}</p>
                </div>
                <div className="border surface rounded-xl p-4">
                  <p className="muted mb-1">Card type</p>
                  <p className="font-bold" style={{ color: 'var(--ink)' }}>{titleCase(bin.data.type) || 'Unknown'}</p>
                </div>
                <div className="border surface rounded-xl p-4">
                  <p className="muted mb-1">Network</p>
                  <p className="font-bold" style={{ color: 'var(--ink)' }}>{titleCase(bin.data.brand) || result.brand}</p>
                </div>
              </div>
              {bin.data.category && <p className="muted text-xs mt-3">Category: {titleCase(bin.data.category)}</p>}
            </div>
          )}
          {bin && bin.found === false && (
            <div className="border surface rounded-xl p-4 text-sm muted">This BIN is not in our database. Brand is detected from the number, but bank details are not available for this card.</div>
          )}
        </div>
      )}
    </div>
  );
}
