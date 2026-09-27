'use client';

import { useState, useMemo } from 'react';
import * as Lucide from 'lucide-react';

const COMMON = ['password', '123456', '123456789', 'qwerty', 'abc123', '111111', 'letmein', 'admin', 'welcome', 'monkey', 'iloveyou', 'dragon', 'password1', 'qwerty123'];

function analyze(pw) {
  if (!pw) return null;
  const length = pw.length;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pw);

  let pool = 0;
  if (hasLower) pool += 26;
  if (hasUpper) pool += 26;
  if (hasNumber) pool += 10;
  if (hasSymbol) pool += 32;
  const entropy = Math.round(length * Math.log2(pool || 1));

  const isCommon = COMMON.includes(pw.toLowerCase());
  const hasRepeats = /(.)\1{2,}/.test(pw);
  const hasSequence = /(abc|bcd|cde|def|123|234|345|456|567|678|789|987|876|765)/i.test(pw);

  // Score 0-4.
  let score = 0;
  if (length >= 8) score++;
  if (length >= 12) score++;
  if ((hasLower && hasUpper) && hasNumber) score++;
  if (hasSymbol && length >= 12) score++;
  if (isCommon || length < 6) score = 0;
  if (hasRepeats || hasSequence) score = Math.max(score - 1, 0);

  const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const colors = ['#b3261e', '#b3261e', '#c98a13', 'var(--mint)', 'var(--mint)'];

  // Crack time estimate (very rough): guesses = pool^length, at 10 billion/sec offline.
  const guesses = Math.pow(pool || 1, length);
  const seconds = guesses / 1e10;
  const crackTime = humanTime(seconds);

  const tips = [];
  if (length < 12) tips.push('Make it at least 12 characters long.');
  if (!hasUpper || !hasLower) tips.push('Mix uppercase and lowercase letters.');
  if (!hasNumber) tips.push('Add some numbers.');
  if (!hasSymbol) tips.push('Add symbols like ! @ # $.');
  if (isCommon) tips.push('This is a very common password. Avoid it entirely.');
  if (hasRepeats) tips.push('Avoid repeating the same character many times.');
  if (hasSequence) tips.push('Avoid sequences like "123" or "abc".');

  return { score, label: labels[score], color: colors[score], entropy, crackTime, tips, checks: { length: length >= 12, hasUpper, hasLower, hasNumber, hasSymbol } };
}

function humanTime(seconds) {
  if (seconds < 1) return 'less than a second';
  const units = [['thousand years', 3.15e10], ['centuries', 3.15e9], ['years', 3.15e7], ['days', 86400], ['hours', 3600], ['minutes', 60], ['seconds', 1]];
  for (const [name, size] of units) {
    if (seconds >= size) {
      const val = Math.floor(seconds / size);
      if (val > 1e6) return 'millions of years';
      return `about ${val.toLocaleString()} ${name}`;
    }
  }
  return 'instantly';
}

export default function PasswordStrengthTool() {
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const result = useMemo(() => analyze(pw), [pw]);

  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Enter a password to test</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Type or paste a password"
          className="w-full border surface rounded-xl px-4 py-3 pr-12 text-sm bg-transparent font-mono"
          style={{ color: 'var(--ink)' }}
        />
        <button onClick={() => setShow(!show)} className="absolute right-3 top-3 muted" aria-label="Toggle visibility">
          {show ? <Lucide.EyeOff className="w-5 h-5" /> : <Lucide.Eye className="w-5 h-5" />}
        </button>
      </div>

      {result && (
        <div className="mt-6">
          <div className="flex gap-1 mb-2">
            {[0, 1, 2, 3, 4].map((b) => (
              <div key={b} className="h-2 flex-1 rounded-full" style={{ background: b <= result.score ? result.color : 'var(--line)' }} />
            ))}
          </div>
          <div className="flex items-center justify-between mb-6">
            <span className="font-bold" style={{ color: result.color }}>{result.label}</span>
            <span className="muted text-sm">~{result.entropy} bits of entropy</span>
          </div>

          <div className="border surface rounded-xl p-4 mb-4" style={{ background: 'var(--surface)' }}>
            <p className="muted text-sm mb-1">Estimated time to crack (offline attack)</p>
            <p className="font-bold text-lg" style={{ color: 'var(--ink)' }}>{result.crackTime}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {[
              ['12+ characters', result.checks.length],
              ['Uppercase', result.checks.hasUpper],
              ['Lowercase', result.checks.hasLower],
              ['Numbers', result.checks.hasNumber],
              ['Symbols', result.checks.hasSymbol],
            ].map(([label, ok]) => (
              <div key={label} className="flex items-center gap-2 text-sm" style={{ color: 'var(--ink)' }}>
                {ok ? <Lucide.CheckCircle2 className="w-4 h-4" style={{ color: 'var(--mint)' }} /> : <Lucide.Circle className="w-4 h-4 muted" />}
                {label}
              </div>
            ))}
          </div>

          {result.tips.length > 0 && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-soft)', color: 'var(--ink)' }}>
              <strong>How to improve it:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside muted">
                {result.tips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <p className="muted text-xs mt-4">Your password is checked entirely in your browser. It is never sent to any server, logged, or stored.</p>
    </div>
  );
}
