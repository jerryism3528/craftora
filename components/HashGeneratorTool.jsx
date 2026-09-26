'use client';

import { useState } from 'react';
import * as Lucide from 'lucide-react';

// Minimal self-contained MD5 (browsers have no built-in MD5).
function md5(str) {
  function rotl(n, c) { return (n << c) | (n >>> (32 - c)); }
  function toHex(n) {
    let s = '';
    for (let i = 0; i < 4; i++) s += ('0' + ((n >> (i * 8)) & 0xff).toString(16)).slice(-2);
    return s;
  }
  const bytes = new TextEncoder().encode(str);
  const len = bytes.length;
  const withOne = new Uint8Array(((len + 8) >> 6) * 64 + 64);
  withOne.set(bytes);
  withOne[len] = 0x80;
  const bitLen = len * 8;
  for (let i = 0; i < 8; i++) withOne[withOne.length - 8 + i] = (bitLen / Math.pow(2, 8 * i)) & 0xff;

  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  const S = [7,12,17,22, 5,9,14,20, 4,11,16,23, 6,10,15,21];
  const K = [];
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * Math.pow(2, 32));

  for (let off = 0; off < withOne.length; off += 64) {
    const M = [];
    for (let i = 0; i < 16; i++) {
      M[i] = withOne[off + i*4] | (withOne[off + i*4 + 1] << 8) | (withOne[off + i*4 + 2] << 16) | (withOne[off + i*4 + 3] << 24);
    }
    let A = a, B = b, C = c, D = d;
    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5*i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3*i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7*i) % 16; }
      F = (F + A + K[i] + M[g]) | 0;
      A = D; D = C; C = B;
      B = (B + rotl(F, S[(Math.floor(i/16)*4) + (i%4)])) | 0;
    }
    a = (a + A) | 0; b = (b + B) | 0; c = (c + C) | 0; d = (d + D) | 0;
  }
  return toHex(a) + toHex(b) + toHex(c) + toHex(d);
}

async function sha(algo, str) {
  const data = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest(algo, data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function HashGeneratorTool() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState('');

  async function generate() {
    if (!input) { setHashes(null); return; }
    setBusy(true);
    const out = {
      MD5: md5(input),
      'SHA-1': await sha('SHA-1', input),
      'SHA-256': await sha('SHA-256', input),
      'SHA-512': await sha('SHA-512', input),
    };
    setHashes(out);
    setBusy(false);
  }

  function copy(label, value) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    });
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Text to hash</label>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={5}
        placeholder="Type or paste text to hash"
        className="w-full border surface rounded-xl p-4 text-sm bg-transparent font-mono"
        style={{ color: 'var(--ink)' }}
        spellCheck={false}
      />

      <button onClick={generate} disabled={busy || !input} className="rounded-xl px-6 py-3 font-bold text-sm mt-4 inline-flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--brand)', color: '#fff' }}>
        {busy ? (<><Lucide.Loader2 className="w-4 h-4 animate-spin" /> Generating...</>) : (<><Lucide.Hash className="w-4 h-4" /> Generate hashes</>)}
      </button>

      {hashes && (
        <div className="mt-6 space-y-3">
          {Object.entries(hashes).map(([label, value]) => (
            <div key={label} className="border surface rounded-xl p-4" style={{ background: 'var(--surface)' }}>
              <div className="flex items-center justify-between mb-2">
                <strong className="text-sm" style={{ color: 'var(--ink)' }}>{label}</strong>
                <button onClick={() => copy(label, value)} className="text-sm font-semibold brand-text inline-flex items-center gap-1">
                  {copied === label ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy</>}
                </button>
              </div>
              <p className="text-sm font-mono break-all muted">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
