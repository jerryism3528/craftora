'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as Lucide from 'lucide-react';

function deviceId() {
  try {
    let id = localStorage.getItem('cdid');
    if (!id) { id = crypto.randomUUID(); localStorage.setItem('cdid', id); }
    document.cookie = `cdid=${id}; path=/; max-age=31536000; SameSite=Lax; Secure`;
    return id;
  } catch { return ''; }
}

const sizeOf = (f) => Number(f?.size ?? f?.byteLength ?? f?.length ?? 0) || 0;

// Counts one use of a browser tool before it runs. Only the tool name, the number of files and
// their sizes are sent. The files themselves stay on the device.
export function useUsageGate(tool) {
  const [block, setBlock] = useState(null);

  async function check(list) {
    const files = (Array.isArray(list) ? list : [list]).filter(Boolean);
    if (!files.length) return true;
    const sizes = files.map(sizeOf);
    try {
      const res = await fetch('/api/tools/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Device-Id': deviceId() },
        body: JSON.stringify({ tool, files: files.length, maxBytes: Math.max(0, ...sizes) }),
      });
      if (res.status >= 500) return true;
      const d = await res.json().catch(() => ({ ok: true }));
      if (d.ok) { setBlock(null); return true; }
      setBlock(d);
      return false;
    } catch {
      return true; // never break a tool because the counter could not be reached
    }
  }

  const notice = block ? <LimitNotice info={block} onClose={() => setBlock(null)} /> : null;
  return { check, notice };
}

function resetText(iso) {
  if (!iso) return 'It resets 24 hours after your first use.';
  const mins = Math.max(1, Math.round((new Date(iso).getTime() - Date.now()) / 60000));
  if (mins < 60) return `It resets in about ${mins} minute${mins === 1 ? '' : 's'}.`;
  const h = Math.round(mins / 60);
  return `It resets in about ${h} hour${h === 1 ? '' : 's'}.`;
}

export function LimitNotice({ info, onClose }) {
  const guest = info.plan === 'guest';
  let title, body;
  if (info.reason === 'limit') {
    title = `You have used your ${info.limit} free uses of this tool today`;
    body = guest
      ? `Create a free account for ${info.freeLimit || 5} uses a day, or go Pro for unlimited use and files up to 200 MB. ${resetText(info.resetAt)}`
      : `Pro gives you unlimited use of every browser tool and files up to 200 MB. ${resetText(info.resetAt)}`;
  } else if (info.reason === 'size') {
    title = `This file is ${info.fileMb} MB`;
    body = guest
      ? `Files up to ${info.limitMb} MB work without an account. A free account allows 25 MB, Pro 200 MB and Business 500 MB.`
      : `Your plan allows files up to ${info.limitMb} MB. Pro allows 200 MB and Business 500 MB.`;
  } else if (info.reason === 'files') {
    title = `Up to ${info.maxFiles} files at a time`;
    body = guest
      ? `Remove a few files, or create a free account to add up to 10 at once. Pro handles 50 at a time.`
      : `Remove a few files and try again, or upgrade for bigger batches (Pro 50, Business 100).`;
  } else {
    title = 'Please try again shortly';
    body = info.message || 'This tool is busy right now.';
  }
  const showSignup = guest && info.reason !== 'busy' && info.reason !== 'disabled';
  const showPro = ['limit', 'size', 'files'].includes(info.reason) && info.plan !== 'business';
  return (
    <div role="alert" className="mt-5 rounded-2xl border surface p-5" style={{ borderColor: '#3430a8' }}>
      <div className="flex items-start gap-3">
        <Lucide.Gauge className="w-5 h-5 mt-0.5 shrink-0 brand-text" />
        <div className="flex-1">
          <p className="font-bold" style={{ color: 'var(--ink)' }}>{title}</p>
          <p className="muted text-sm mt-1 leading-6">{body}</p>
          <p className="muted text-xs mt-2 inline-flex items-center gap-1"><Lucide.ShieldCheck className="w-3.5 h-3.5 mint-text" />Your files were not uploaded. They stay on your device.</p>
          {(showSignup || showPro) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {showSignup && <Link href="/signup" className="rounded-xl px-4 py-2 text-sm font-bold" style={{ background: 'var(--brand)', color: '#fff' }}>Create a free account</Link>}
              {showPro && <Link href="/pricing" className={`rounded-xl px-4 py-2 text-sm font-bold ${showSignup ? 'border surface' : ''}`} style={showSignup ? { color: 'var(--ink)' } : { background: 'var(--brand)', color: '#fff' }}>{info.plan === 'pro' ? 'See Business' : 'See Pro plans'}</Link>}
            </div>
          )}
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="muted hover:opacity-70"><Lucide.X className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
