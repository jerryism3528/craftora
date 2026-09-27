'use client';

import { useState, useEffect, useCallback } from 'react';
import * as Lucide from 'lucide-react';

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
};

function securePick(str) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return str[arr[0] % str.length];
}

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ lower: true, upper: true, numbers: true, symbols: true });
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    let pool = '';
    Object.keys(SETS).forEach((k) => { if (opts[k]) pool += SETS[k]; });
    if (!pool) { setPassword(''); return; }
    // Guarantee at least one of each selected type.
    const required = Object.keys(SETS).filter((k) => opts[k]).map((k) => securePick(SETS[k]));
    const rest = Array.from({ length: Math.max(length - required.length, 0) }, () => securePick(pool));
    const chars = [...required, ...rest];
    // Secure shuffle.
    for (let i = chars.length - 1; i > 0; i--) {
      const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    setPassword(chars.join(''));
    setCopied(false);
  }, [length, opts]);

  useEffect(() => { generate(); }, [generate]);

  function copyPassword() {
    if (!password) return;
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function toggle(k) {
    setOpts((o) => ({ ...o, [k]: !o[k] }));
  }

  // Strength estimate.
  const activeSets = Object.keys(SETS).filter((k) => opts[k]).length;
  let poolSize = 0;
  Object.keys(SETS).forEach((k) => { if (opts[k]) poolSize += SETS[k].length; });
  const entropy = password ? Math.round(length * Math.log2(poolSize || 1)) : 0;
  let strength = 'Weak', strengthColor = '#b3261e', bars = 1;
  if (entropy >= 100) { strength = 'Very strong'; strengthColor = 'var(--mint)'; bars = 4; }
  else if (entropy >= 70) { strength = 'Strong'; strengthColor = 'var(--mint)'; bars = 3; }
  else if (entropy >= 45) { strength = 'Fair'; strengthColor = '#c98a13'; bars = 2; }

  return (
    <div>
      <div className="border surface rounded-2xl p-5 mb-6" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center gap-3">
          <p className="text-lg sm:text-2xl font-mono font-bold flex-1 min-w-0 break-all" style={{ color: 'var(--ink)' }}>
            {password || 'Select at least one option'}
          </p>
          <button onClick={generate} className="border surface rounded-lg w-10 h-10 inline-flex items-center justify-center shrink-0" style={{ color: 'var(--ink)' }} aria-label="Regenerate">
            <Lucide.RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={copyPassword} className="rounded-lg px-4 h-10 inline-flex items-center gap-2 text-sm font-bold shrink-0" style={{ background: 'var(--brand)', color: '#fff' }}>
            {copied ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>
        {password && (
          <div className="flex items-center gap-3 mt-4">
            <div className="flex gap-1 flex-1 max-w-[200px]">
              {[1, 2, 3, 4].map((b) => (
                <div key={b} className="h-1.5 flex-1 rounded-full" style={{ background: b <= bars ? strengthColor : 'var(--line)' }} />
              ))}
            </div>
            <span className="text-sm font-semibold" style={{ color: strengthColor }}>{strength}</span>
            <span className="muted text-xs">~{entropy} bits</span>
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Length: {length}</label>
        <input type="range" min="6" max="64" value={length} onChange={(e) => setLength(parseInt(e.target.value, 10))} className="w-full" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          ['lower', 'Lowercase (a-z)'],
          ['upper', 'Uppercase (A-Z)'],
          ['numbers', 'Numbers (0-9)'],
          ['symbols', 'Symbols (!@#$)'],
        ].map(([k, label]) => (
          <label key={k} className="flex items-center gap-2 text-sm font-semibold cursor-pointer border surface rounded-xl px-4 py-3" style={{ color: 'var(--ink)' }}>
            <input type="checkbox" checked={opts[k]} onChange={() => toggle(k)} disabled={activeSets === 1 && opts[k]} /> {label}
          </label>
        ))}
      </div>

      <p className="muted text-xs mt-4">Passwords are generated in your browser using secure randomness. Nothing is sent anywhere or stored.</p>
    </div>
  );
}
