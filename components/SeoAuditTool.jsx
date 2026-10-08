'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, Loader2, AlertTriangle, AlertCircle, Info, CheckCircle2, ChevronDown, Download,
  RotateCcw, Gauge, FileText, Link2, Image as ImageIcon, Code2, Clock, Target, Wrench,
} from 'lucide-react';
import { CATEGORIES, SEVERITY_WEIGHT } from '../lib/seo-checks';

const STEPS = ['Fetching the page', 'Reading meta tags', 'Analyzing content', 'Checking robots.txt and sitemap', 'Testing links', 'Calculating score'];

function scoreColor(s) {
  if (s >= 80) return { ring: '#10b981', text: 'text-emerald-600 dark:text-emerald-400', label: s >= 90 ? 'Excellent' : 'Good' };
  if (s >= 50) return { ring: '#f59e0b', text: 'text-amber-600 dark:text-amber-400', label: 'Needs work' };
  return { ring: '#ef4444', text: 'text-red-600 dark:text-red-400', label: 'Poor' };
}

function ScoreRing({ score }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const col = scoreColor(score);
  return (
    <div className="relative w-36 h-36 shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-slate-200 dark:stroke-slate-700" />
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" strokeLinecap="round" stroke={col.ring}
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-extrabold ${col.text}`}>{score}</span>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{col.label}</span>
      </div>
    </div>
  );
}

const SEV = {
  critical: { label: 'Critical', Icon: AlertCircle, cls: 'text-red-600 dark:text-red-400', pill: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' },
  warning: { label: 'Warning', Icon: AlertTriangle, cls: 'text-amber-600 dark:text-amber-400', pill: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  notice: { label: 'Notice', Icon: Info, cls: 'text-sky-600 dark:text-sky-400', pill: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800' },
  pass: { label: 'Passed', Icon: CheckCircle2, cls: 'text-emerald-600 dark:text-emerald-400', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
};

function Stat({ Icon, label, value, warn }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><Icon className="w-3.5 h-3.5" /> {label}</div>
      <div className={`mt-1 text-lg font-bold ${warn ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>{value}</div>
    </div>
  );
}

function CheckRow({ c }) {
  const [open, setOpen] = useState(false);
  const key = c.status === 'pass' ? 'pass' : c.severity;
  const { Icon, cls } = SEV[key];
  return (
    <div className="border-t border-slate-100 dark:border-slate-700 first:border-t-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/40">
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${cls}`} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-white">{c.title}</span>
            <span className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{CATEGORIES[c.category]}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 break-words">{c.message}</p>
        </div>
        <ChevronDown className={`w-4 h-4 mt-1 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pl-12 space-y-3">
          {c.details && c.details.length > 0 && (
            <ul className="text-xs font-mono bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-1 max-h-48 overflow-auto text-slate-700 dark:text-slate-300">
              {c.details.map((d, i) => <li key={i} className="break-all">{d}</li>)}
            </ul>
          )}
          <div className="flex gap-2 text-sm text-slate-700 dark:text-slate-200">
            <Wrench className="w-4 h-4 mt-0.5 shrink-0 text-indigo-500" />
            <p><span className="font-semibold">{c.status === 'pass' ? 'Why it matters: ' : 'How to fix: '}</span>{c.fix}</p>
          </div>
          {c.tools && c.tools.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {c.tools.map((t) => (
                <Link key={t.slug} href={`/${t.slug}`} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60">
                  Fix with {t.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SeoAuditTool() {
  const [url, setUrl] = useState('');
  const [keyword, setKeyword] = useState('');
  const [showKw, setShowKw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [sevFilter, setSevFilter] = useState('issues');
  const [catFilter, setCatFilter] = useState('all');
  const [showOutline, setShowOutline] = useState(false);

  useEffect(() => {
    if (!loading) return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 2200);
    return () => clearInterval(t);
  }, [loading]);

  async function run(e) {
    e?.preventDefault();
    if (loading || !url.trim()) return;
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const res = await fetch('/api/tools/seo-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), keyword: showKw ? keyword.trim() : '' }),
      });
      const data = await res.json();
      if (!res.ok || data.error) setError(data.error || 'The audit failed. Please try again.');
      else { setReport(data); setSevFilter('issues'); setCatFilter('all'); }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  }

  const catScores = useMemo(() => {
    if (!report) return [];
    return Object.keys(CATEGORIES).map((cat) => {
      const list = report.checks.filter((c) => c.category === cat && c.status !== 'info');
      if (!list.length) return null;
      let t = 0; let g = 0;
      for (const c of list) { const w = SEVERITY_WEIGHT[c.severity]; t += w; if (c.status === 'pass') g += w; }
      return { cat, score: Math.round((g / t) * 100), issues: list.filter((c) => c.status === 'fail').length };
    }).filter(Boolean);
  }, [report]);

  const visible = useMemo(() => {
    if (!report) return [];
    const order = { critical: 0, warning: 1, notice: 2 };
    return report.checks
      .filter((c) => (catFilter === 'all' ? true : c.category === catFilter))
      .filter((c) => {
        if (sevFilter === 'issues') return c.status === 'fail';
        if (sevFilter === 'pass') return c.status === 'pass';
        if (sevFilter === 'all') return true;
        return c.status === 'fail' && c.severity === sevFilter;
      })
      .sort((a, b) => (a.status === b.status ? order[a.severity] - order[b.severity] : a.status === 'fail' ? -1 : 1));
  }, [report, sevFilter, catFilter]);

  function downloadCsv() {
    const rows = [['Status', 'Severity', 'Category', 'Check', 'Result', 'How to fix']];
    report.checks.forEach((c) => rows.push([c.status === 'pass' ? 'Passed' : 'Issue', c.severity, CATEGORIES[c.category], c.title, c.message, c.fix]));
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `seo-audit-${new URL(report.finalUrl).hostname}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  const p = report?.page || {};
  let host = '';
  let crumbs = '';
  try { const u = new URL(report?.finalUrl); host = u.hostname; crumbs = [u.hostname, ...u.pathname.split('/').filter(Boolean)].join(' › '); } catch {}

  const tabs = report ? [
    ['issues', `All issues (${report.summary.critical + report.summary.warning + report.summary.notice})`],
    ['critical', `Critical (${report.summary.critical})`],
    ['warning', `Warnings (${report.summary.warning})`],
    ['notice', `Notices (${report.summary.notice})`],
    ['pass', `Passed (${report.summary.passed})`],
  ] : [];

  return (
    <div className="space-y-6">
      <form onSubmit={run} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} disabled={loading}
            placeholder="https://yourwebsite.com/page"
            className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-base bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" disabled={loading || !url.trim()} className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} {loading ? 'Auditing...' : 'Audit Page'}
          </button>
        </div>
        {showKw ? (
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-500 shrink-0" />
            <input
              type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} disabled={loading} maxLength={80}
              placeholder="Target keyword, for example: used bikes in lahore"
              className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ) : (
          <button type="button" onClick={() => setShowKw(true)} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            <Target className="w-4 h-4" /> Add a target keyword (optional)
          </button>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400">Free, no signup. 35+ checks on meta tags, content, technical SEO, and links. 10 audits per hour.</p>
      </form>

      {loading && (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-5">
          <div className="space-y-2">
            {STEPS.map((s, i) => (
              <div key={s} className={`flex items-center gap-2 text-sm ${i < step ? 'text-emerald-700 dark:text-emerald-400' : i === step ? 'text-indigo-800 dark:text-indigo-200 font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i === step ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="w-4 h-4 rounded-full border border-current" />}
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-300">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {report && (
        <div className="space-y-6">
          {/* Score header */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 sm:p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <ScoreRing score={report.score} />
              <div className="flex-1 min-w-0 w-full">
                <div className="text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">SEO score for</div>
                <a href={report.finalUrl} target="_blank" rel="noopener noreferrer nofollow" className="block text-lg font-bold text-slate-900 dark:text-white break-all hover:underline">{report.finalUrl}</a>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Audited {new Date(report.auditedAt).toLocaleString()}</div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['critical', 'warning', 'notice', 'pass'].map((k) => (
                    <button key={k} onClick={() => setSevFilter(k)} className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full border ${SEV[k].pill}`}>
                      {(() => { const I = SEV[k].Icon; return <I className="w-4 h-4" />; })()}
                      {k === 'pass' ? report.summary.passed : report.summary[k]} {SEV[k].label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 mt-4">
                  {catScores.map((cs) => (
                    <button key={cs.cat} onClick={() => { setCatFilter(cs.cat); setSevFilter('all'); }} className="text-left group">
                      <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        <span>{CATEGORIES[cs.cat]}</span><span>{cs.score}%</span>
                      </div>
                      <div className="h-1.5 mt-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${cs.score}%`, background: scoreColor(cs.score).ring }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          {p.title !== undefined && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Stat Icon={Clock} label="Response time" value={`${p.ttfb} ms`} warn={p.ttfb > 800} />
              <Stat Icon={Gauge} label="HTML size" value={`${p.htmlKb} KB`} warn={p.htmlKb > 500} />
              <Stat Icon={FileText} label="Words" value={p.wordCount} warn={p.wordCount < 300} />
              <Stat Icon={Link2} label="Internal links" value={p.internalLinks} warn={!p.internalLinks} />
              <Stat Icon={ImageIcon} label="Images (no alt)" value={`${p.images} (${p.imagesNoAlt})`} warn={p.imagesNoAlt > 0} />
              <Stat Icon={Code2} label="Schema types" value={p.schemaTypes?.length || 0} warn={!p.schemaTypes?.length} />
            </div>
          )}

          {/* Previews */}
          {p.title !== undefined && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Google preview</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 truncate">{crumbs}</div>
                <div className="text-lg text-[#1a0dab] dark:text-[#8ab4f8] leading-snug line-clamp-1">{p.title ? (p.title.length > 60 ? p.title.slice(0, 58) + '...' : p.title) : <span className="italic text-slate-400">No title</span>}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{p.description ? (p.description.length > 160 ? p.description.slice(0, 157) + '...' : p.description) : <span className="italic text-slate-400">No meta description. Google will pick text from the page.</span>}</div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Social share preview</div>
                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  {p.og?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.og.image} alt="Open Graph preview" referrerPolicy="no-referrer" className="w-full h-36 object-cover bg-slate-100 dark:bg-slate-900" />
                  ) : (
                    <div className="h-36 flex items-center justify-center text-sm text-slate-400 bg-slate-50 dark:bg-slate-900">No og:image set</div>
                  )}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60">
                    <div className="text-[11px] uppercase text-slate-500 dark:text-slate-400">{host}</div>
                    <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">{p.og?.title || p.title || 'No title'}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{p.og?.description || p.description || ''}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {p.keyword && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-4 py-3 text-sm text-indigo-900 dark:text-indigo-200">
              <span className="font-semibold flex items-center gap-1.5"><Target className="w-4 h-4" /> "{p.keyword.keyword}"</span>
              <span>Used {p.keyword.occurrences} times</span>
              <span>Density {p.keyword.density}%</span>
            </div>
          )}

          {/* Checks */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex gap-1 overflow-x-auto">
                {tabs.map(([k, label]) => (
                  <button key={k} onClick={() => setSevFilter(k)} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-semibold ${sevFilter === k ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{label}</button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[['all', 'All categories'], ...catScores.map((cs) => [cs.cat, CATEGORIES[cs.cat]])].map(([k, label]) => (
                  <button key={k} onClick={() => setCatFilter(k)} className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${catFilter === k ? 'border-indigo-500 text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/50' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}>{label}</button>
                ))}
              </div>
            </div>
            {visible.length ? visible.map((c) => <CheckRow key={c.id} c={c} />) : (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                {sevFilter === 'pass' ? 'No passed checks in this view.' : 'No issues here. Nice work.'}
              </div>
            )}
          </div>

          {/* Heading outline */}
          {p.headings?.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <button onClick={() => setShowOutline(!showOutline)} className="w-full flex items-center justify-between px-4 py-3 font-semibold text-slate-900 dark:text-white">
                Heading outline ({p.headings.length})
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showOutline ? 'rotate-180' : ''}`} />
              </button>
              {showOutline && (
                <ul className="px-4 pb-4 space-y-1 text-sm max-h-96 overflow-auto">
                  {p.headings.map((h, i) => (
                    <li key={i} style={{ paddingLeft: `${(h.level - 1) * 16}px` }} className="text-slate-700 dark:text-slate-300">
                      <span className="inline-block w-8 text-xs font-bold text-indigo-600 dark:text-indigo-400">H{h.level}</span>{h.text || <em className="text-slate-400">(empty)</em>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button onClick={downloadCsv} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700">
              <Download className="w-4 h-4" /> Download report (CSV)
            </button>
            <button onClick={run} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700">
              <RotateCcw className="w-4 h-4" /> Re-run audit
            </button>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white">
            <div className="text-lg font-bold">Check every page, not just one</div>
            <p className="text-sm text-indigo-100 mt-1">Crawl your whole site to build a sitemap and find broken links on every page.</p>
            <Link href="/sitemap-generator" className="inline-block mt-3 px-4 py-2 rounded-lg bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50">Crawl my website</Link>
          </div>
        </div>
      )}
    </div>
  );
}
