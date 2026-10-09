'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, ChevronLeft, ChevronRight, X, CheckCircle2, AlertTriangle } from 'lucide-react';

export function useApi(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    try {
      const r = await fetch(url, { cache: 'no-store' });
      const d = await r.json();
      if (!r.ok || d.ok === false) { setError(d.error || `Request failed (${r.status})`); }
      else { setData(d); setError(''); }
    } catch { setError('Could not reach the server.'); }
    setLoading(false);
  }, [url]);
  useEffect(() => { load(); }, [load]);
  return { data, error, loading, reload: load };
}

export async function post(url, body) {
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.ok === false) return { ok: false, error: d.error || `Request failed (${r.status})` };
    return d;
  } catch { return { ok: false, error: 'Could not reach the server.' }; }
}

export function fmtBytes(n) {
  n = Number(n) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}
export function fmtNum(n) { return (Number(n) || 0).toLocaleString(); }
export function fmtDate(d, time = false) {
  if (!d) return '';
  const x = new Date(d);
  return time ? x.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : x.toLocaleDateString(undefined, { dateStyle: 'medium' });
}
export function ago(d) {
  if (!d) return 'never';
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.round(s / 86400)}d ago`;
  return fmtDate(d);
}

export function Card({ title, action, children, className = '', pad = true }) {
  return (
    <section className={`rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pt-4">
          {title && <h2 className="font-bold text-slate-900 dark:text-white">{title}</h2>}
          {action}
        </div>
      )}
      <div className={pad ? 'p-4 sm:p-5' : ''}>{children}</div>
    </section>
  );
}

export function Stat({ icon: Icon, label, value, sub, tone = 'indigo', onClick }) {
  const tones = {
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',
    red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50',
    sky: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50',
    teal: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50',
  };
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} className={`text-left rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 ${onClick ? 'hover:border-indigo-400 transition' : ''}`}>
      <div className="flex items-center gap-2">
        {Icon && <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${tones[tone]}`}><Icon className="w-4 h-4" /></span>}
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{value}</div>
      {sub && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</div>}
    </Tag>
  );
}

const BADGES = {
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
  teal: 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
};
export function Badge({ tone = 'slate', children, className = '' }) {
  return <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${BADGES[tone] || BADGES.slate} ${className}`}>{children}</span>;
}

export const PLAN_TONE = { free: 'slate', pro: 'indigo', business: 'teal' };
export function PlanBadge({ plan, expires }) {
  const p = plan || 'free';
  return <Badge tone={PLAN_TONE[p] || 'sky'}>{p.charAt(0).toUpperCase() + p.slice(1)}{p !== 'free' && (expires ? ` until ${fmtDate(expires)}` : ' lifetime')}</Badge>;
}

export const STATUS_TONE = {
  open: 'amber', resolved: 'emerald', dismissed: 'slate',
  running: 'sky', done: 'emerald', failed: 'red',
  draft: 'slate', sent: 'amber', completed: 'emerald', declined: 'red', voided: 'slate', expired: 'slate', finalizing: 'sky',
};

export function Btn({ children, onClick, tone = 'default', size = 'sm', disabled, busy, type = 'button', className = '', title }) {
  const tones = {
    default: 'border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700',
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-600',
    danger: 'border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40',
    warn: 'border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40',
    ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700',
  };
  const sizes = { xs: 'px-2 py-1 text-xs', sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm' };
  return (
    <button type={type} title={title} onClick={onClick} disabled={disabled || busy} className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition disabled:opacity-50 ${tones[tone]} ${sizes[size]} ${className}`}>
      {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{children}
    </button>
  );
}

export const inputCls = 'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500';

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-1">{hint}</span>}
    </label>
  );
}

export function Toolbar({ children }) {
  return <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">{children}</div>;
}

export function Tabs({ value, onChange, items }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {items.map(([k, label, n]) => (
        <button key={k} onClick={() => onChange(k)} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-semibold ${value === k ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
          {label}{n !== undefined && <span className={`ml-1.5 text-xs ${value === k ? 'text-indigo-100' : 'text-slate-400'}`}>{n}</span>}
        </button>
      ))}
    </div>
  );
}

export function Table({ head, children, empty }) {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            {head.map((h, i) => <th key={i} className={`py-2 px-3 font-semibold ${h.right ? 'text-right' : ''}`}>{h.label ?? h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-800 dark:text-slate-100">{children}</tbody>
      </table>
      {empty}
    </div>
  );
}

export function Empty({ children = 'Nothing here yet.' }) {
  return <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">{children}</p>;
}

export function Loading({ text = 'Loading...' }) {
  return <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400 text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" />{text}</div>;
}

export function ErrorBox({ children }) {
  return <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-4 py-3 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />{children}</div>;
}

export function Notice({ msg, onClose }) {
  if (!msg) return null;
  const err = msg.error;
  return (
    <div className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 rounded-xl shadow-lg px-4 py-3 text-sm flex items-start gap-2 ${err ? 'bg-red-600 text-white' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'}`} role="status">
      {err ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> : <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />}
      <span className="flex-1">{msg.text}</span>
      <button onClick={onClose} aria-label="Close"><X className="w-4 h-4" /></button>
    </div>
  );
}

// Toast state helper: const [toast, show] = useToast();
export function useToast() {
  const [msg, setMsg] = useState(null);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 4500); return () => clearTimeout(t); }, [msg]);
  const show = useCallback((r) => {
    if (typeof r === 'string') setMsg({ text: r });
    else if (r && r.ok === false) setMsg({ text: r.error || 'Something went wrong.', error: true });
    else if (r?.message) setMsg({ text: r.message });
  }, []);
  return [<Notice key="toast" msg={msg} onClose={() => setMsg(null)} />, show];
}

export function Pager({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 mt-4 text-sm text-slate-600 dark:text-slate-300">
      <Btn size="xs" onClick={() => onChange(page - 1)} disabled={page <= 1}><ChevronLeft className="w-4 h-4" /></Btn>
      <span>Page {page} of {pages}</span>
      <Btn size="xs" onClick={() => onChange(page + 1)} disabled={page >= pages}><ChevronRight className="w-4 h-4" /></Btn>
    </div>
  );
}

// Simple accessible bar chart (SVG). series: [{ label, value }]
export function BarChart({ series, height = 140, color = '#4f46e5', label = 'value' }) {
  const max = Math.max(1, ...series.map((s) => s.value));
  const w = 100 / Math.max(1, series.length);
  return (
    <div>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }} role="img" aria-label={`${label} per day`}>
        {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2="100" y1={height * f} y2={height * f} stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />)}
        {series.map((s, i) => {
          const h = (s.value / max) * (height - 6);
          return <rect key={i} x={i * w + w * 0.15} y={height - h} width={w * 0.7} height={Math.max(h, s.value ? 1 : 0)} rx="0.6" fill={color}><title>{`${s.label}: ${s.value.toLocaleString()}`}</title></rect>;
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        <span>{series[0]?.label}</span><span>max {max.toLocaleString()}</span><span>{series[series.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className={`relative h-full w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} bg-slate-50 dark:bg-slate-900 shadow-2xl overflow-y-auto`}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-bold text-slate-900 dark:text-white truncate">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-5">{children}</div>
      </div>
    </div>
  );
}

export function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}
