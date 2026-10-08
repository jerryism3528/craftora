'use client';

import { AlertTriangle, AlertCircle, Info, CheckCircle2, EyeOff } from 'lucide-react';
import { CATEGORIES, SEVERITY_WEIGHT } from '../../lib/seo-checks';

export function scoreColor(s) {
  if (s >= 80) return { ring: '#10b981', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', label: s >= 90 ? 'Excellent' : 'Good' };
  if (s >= 50) return { ring: '#f59e0b', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', label: 'Needs work' };
  return { ring: '#ef4444', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40', label: 'Poor' };
}

export function ScoreRing({ score, size = 144, label = true }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const col = scoreColor(score);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-slate-200 dark:stroke-slate-700" />
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" strokeLinecap="round" stroke={col.ring}
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-extrabold ${col.text}`} style={{ fontSize: size * 0.28 }}>{score}</span>
        {label && <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{col.label}</span>}
      </div>
    </div>
  );
}

export const SEV = {
  critical: { label: 'Critical', Icon: AlertCircle, cls: 'text-red-600 dark:text-red-400', pill: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' },
  warning: { label: 'Warning', Icon: AlertTriangle, cls: 'text-amber-600 dark:text-amber-400', pill: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  notice: { label: 'Notice', Icon: Info, cls: 'text-sky-600 dark:text-sky-400', pill: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800' },
  pass: { label: 'Passed', Icon: CheckCircle2, cls: 'text-emerald-600 dark:text-emerald-400', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
  info: { label: 'Info', Icon: EyeOff, cls: 'text-slate-500 dark:text-slate-400', pill: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600' },
};

export function Sparkline({ values, width = 120, height = 32 }) {
  if (!values || values.length < 2) return <div style={{ width, height }} className="flex items-center text-[11px] text-slate-400">Trend after 2 audits</div>;
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 100);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (width - 4) + 2, height - 2 - ((v - min) / (max - min || 1)) * (height - 4)]);
  const last = values[values.length - 1];
  const col = scoreColor(last).ring;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label={`Score trend: ${values.join(', ')}`}>
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={col} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 3 : 1.8} fill={col} />)}
    </svg>
  );
}

// Category scores for site audits (uses affected/applicable ratios).
export function siteCategoryScores(checks) {
  return Object.keys(CATEGORIES).map((cat) => {
    const list = checks.filter((c) => c.category === cat && c.status !== 'info');
    if (!list.length) return null;
    let t = 0; let g = 0;
    for (const c of list) {
      const w = SEVERITY_WEIGHT[c.severity];
      const ratio = c.applicable ? Math.max(0, 1 - c.affected / c.applicable) : (c.status === 'pass' ? 1 : 0);
      t += w; g += w * ratio;
    }
    return { cat, label: CATEGORIES[cat], score: Math.round((g / t) * 100), issues: list.filter((c) => c.status === 'fail').length };
  }).filter(Boolean);
}

export function CategoryBars({ scores, onPick }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
      {scores.map((cs) => (
        <button key={cs.cat} type="button" onClick={() => onPick && onPick(cs.cat)} className="text-left group">
          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            <span>{cs.label}</span><span>{cs.score}%</span>
          </div>
          <div className="h-1.5 mt-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${cs.score}%`, background: scoreColor(cs.score).ring }} />
          </div>
        </button>
      ))}
    </div>
  );
}

export function timeAgo(d) {
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.round(s / 86400)} days ago`;
  return new Date(d).toLocaleDateString();
}

export const PHASES = {
  starting: 'Starting the crawler',
  crawling: 'Crawling and analyzing pages',
  site: 'Checking robots.txt, sitemap, and favicon',
  links: 'Testing links for errors',
  sitemap: 'Comparing your sitemap with the crawl',
};
