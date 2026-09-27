'use client';

import { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';

function pad(n) { return String(n).padStart(2, '0'); }

function formatDate(d, utc) {
  const y = utc ? d.getUTCFullYear() : d.getFullYear();
  const mo = (utc ? d.getUTCMonth() : d.getMonth()) + 1;
  const da = utc ? d.getUTCDate() : d.getDate();
  const h = utc ? d.getUTCHours() : d.getHours();
  const mi = utc ? d.getUTCMinutes() : d.getMinutes();
  const s = utc ? d.getUTCSeconds() : d.getSeconds();
  return `${y}-${pad(mo)}-${pad(da)} ${pad(h)}:${pad(mi)}:${pad(s)}`;
}

export default function TimestampConverterTool() {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [tsInput, setTsInput] = useState('');
  const [tsResult, setTsResult] = useState(null);
  const [tsError, setTsError] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [dateResult, setDateResult] = useState(null);
  const [dateError, setDateError] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  function convertTs() {
    setTsError('');
    const raw = tsInput.trim();
    if (!raw || isNaN(Number(raw))) { setTsResult(null); setTsError('Enter a valid number.'); return; }
    let num = Number(raw);
    // Detect milliseconds (13+ digits) vs seconds (10).
    const ms = raw.replace('-', '').length > 11 ? num : num * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) { setTsResult(null); setTsError('That is not a valid timestamp.'); return; }
    setTsResult({
      local: formatDate(d, false),
      utc: formatDate(d, true),
      iso: d.toISOString(),
      relative: relativeTime(Math.floor(ms / 1000)),
    });
  }

  function convertDate() {
    setDateError('');
    if (!dateInput) { setDateResult(null); setDateError('Pick a date and time.'); return; }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) { setDateResult(null); setDateError('That is not a valid date.'); return; }
    const secs = Math.floor(d.getTime() / 1000);
    setDateResult({ seconds: secs, millis: d.getTime() });
  }

  function relativeTime(secs) {
    const diff = secs - Math.floor(Date.now() / 1000);
    const abs = Math.abs(diff);
    const units = [['year', 31536000], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]];
    for (const [name, size] of units) {
      if (abs >= size || name === 'second') {
        const val = Math.floor(abs / size);
        const label = `${val} ${name}${val === 1 ? '' : 's'}`;
        return diff >= 0 ? `in ${label}` : `${label} ago`;
      }
    }
  }

  function copy(key, value) {
    navigator.clipboard.writeText(String(value)).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 1500);
    });
  }

  const Row = ({ label, value, ck }) => (
    <div className="flex items-center justify-between gap-3 py-2 border-b surface last:border-0">
      <span className="text-sm muted">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-mono truncate" style={{ color: 'var(--ink)' }}>{value}</span>
        <button onClick={() => copy(ck, value)} className="brand-text shrink-0">
          {copied === ck ? <Lucide.Check className="w-4 h-4" /> : <Lucide.Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="border surface rounded-xl p-4 mb-6 flex items-center justify-between" style={{ background: 'var(--surface)' }}>
        <div>
          <p className="text-sm muted mb-1">Current Unix timestamp</p>
          <p className="text-2xl font-bold font-mono" style={{ color: 'var(--ink)' }}>{now}</p>
        </div>
        <button onClick={() => copy('now', now)} className="rounded-lg px-4 py-2 text-sm font-semibold border surface inline-flex items-center gap-2" style={{ color: 'var(--ink)' }}>
          {copied === 'now' ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy</>}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border surface rounded-xl p-5">
          <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--ink)' }}>Timestamp to date</h3>
          <div className="flex gap-2">
            <input value={tsInput} onChange={(e) => setTsInput(e.target.value)} placeholder="e.g. 1790459537" className="flex-1 rounded-xl border surface px-4 py-2 text-sm bg-transparent font-mono" style={{ color: 'var(--ink)' }} />
            <button onClick={convertTs} className="rounded-xl px-4 py-2 text-sm font-bold" style={{ background: 'var(--brand)', color: '#fff' }}>Convert</button>
          </div>
          {tsError && <p className="text-sm mt-2" style={{ color: '#b3261e' }}>{tsError}</p>}
          {tsResult && (
            <div className="mt-4">
              <Row label="Local time" value={tsResult.local} ck="l" />
              <Row label="UTC time" value={tsResult.utc} ck="u" />
              <Row label="ISO 8601" value={tsResult.iso} ck="i" />
              <Row label="Relative" value={tsResult.relative} ck="r" />
            </div>
          )}
        </div>

        <div className="border surface rounded-xl p-5">
          <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--ink)' }}>Date to timestamp</h3>
          <div className="flex gap-2">
            <input type="datetime-local" step="1" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="flex-1 rounded-xl border surface px-4 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
            <button onClick={convertDate} className="rounded-xl px-4 py-2 text-sm font-bold" style={{ background: 'var(--brand)', color: '#fff' }}>Convert</button>
          </div>
          {dateError && <p className="text-sm mt-2" style={{ color: '#b3261e' }}>{dateError}</p>}
          {dateResult && (
            <div className="mt-4">
              <Row label="Seconds" value={dateResult.seconds} ck="s" />
              <Row label="Milliseconds" value={dateResult.millis} ck="m" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
