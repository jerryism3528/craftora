'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Loader2, AlertTriangle, ChevronDown, Wrench, Download, Printer, Share2, Copy, Check, Trash2, RotateCcw,
  ArrowLeft, TrendingUp, TrendingDown, Clock, FileText, Link2, Unlink, CornerDownRight, EyeOff, Map as MapIcon, Search,
} from 'lucide-react';
import { ScoreRing, SEV, scoreColor, siteCategoryScores, CategoryBars, PHASES } from './ReportParts';
import { CATEGORIES, CHECKS } from '../../lib/seo-checks';

function IssueRow({ c }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const key = c.status === 'pass' ? 'pass' : c.status === 'info' ? 'info' : c.severity;
  const { Icon, cls } = SEV[key];
  const pct = c.applicable ? Math.round((c.affected / c.applicable) * 100) : 0;
  return (
    <div className="border-t border-slate-100 dark:border-slate-700 first:border-t-0 break-inside-avoid">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/40">
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${cls}`} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-white">{c.title}</span>
            <span className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{CATEGORIES[c.category]}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 break-words">{c.message}</p>
          {c.status === 'fail' && c.applicable > 1 && (
            <div className="mt-1.5 h-1 w-40 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.severity === 'critical' ? '#ef4444' : c.severity === 'warning' ? '#f59e0b' : '#0ea5e9' }} /></div>
          )}
        </div>
        {c.status !== 'pass' && c.affected > 0 && <span className="text-sm font-bold text-slate-700 dark:text-slate-200 shrink-0">{c.affected}</span>}
        <ChevronDown className={`w-4 h-4 mt-1 shrink-0 text-slate-400 transition-transform print:hidden ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pl-12 space-y-3">
          <div className="flex gap-2 text-sm text-slate-700 dark:text-slate-200">
            <Wrench className="w-4 h-4 mt-0.5 shrink-0 text-indigo-500" />
            <p><span className="font-semibold">{c.status === 'pass' ? 'Why it matters: ' : 'How to fix: '}</span>{c.fix}</p>
          </div>
          {c.tools?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {c.tools.map((t) => (
                <Link key={t.slug} href={`/${t.slug}`} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60">Fix with {t.name}</Link>
              ))}
            </div>
          )}
          {c.urls?.length > 0 && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Affected URLs ({c.urls.length}{c.affected > c.urls.length ? ` of ${c.affected}` : ''})</span>
                <button onClick={() => { navigator.clipboard?.writeText(c.urls.map((u) => u.url).join('\n')); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 print:hidden">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copied' : 'Copy URLs'}
                </button>
              </div>
              <ul className="max-h-72 overflow-auto divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {c.urls.map((u, i) => (
                  <li key={i} className="px-3 py-2">
                    <a href={u.url} target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 dark:text-indigo-400 hover:underline break-all">{u.url}</a>
                    {u.note && <div className="text-xs text-slate-500 dark:text-slate-400 break-words">{u.note}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SeoSiteReport({ id }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('issues');
  const [sev, setSev] = useState('issues');
  const [cat, setCat] = useState('all');
  const [pageQuery, setPageQuery] = useState('');
  const [shareBusy, setShareBusy] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [rerunBusy, setRerunBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/seo/audits/${id}`, { cache: 'no-store' });
      const d = await res.json();
      if (res.status === 401 && d.error) { router.push('/login'); return; }
      if (!res.ok) setError(d.error || 'Report not found.'); else setData(d);
    } catch { setError('Could not load the report.'); }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (data?.status !== 'running') return;
    const t = setInterval(load, 2500);
    return () => clearInterval(t);
  }, [data?.status, load]);

  const report = data?.report;
  const checks = report?.checks || [];
  const catScores = useMemo(() => siteCategoryScores(checks), [checks]);
  const visible = useMemo(() => {
    const order = { critical: 0, warning: 1, notice: 2 };
    return checks
      .filter((c) => (cat === 'all' ? true : c.category === cat))
      .filter((c) => {
        if (sev === 'issues') return c.status === 'fail';
        if (sev === 'pass') return c.status === 'pass';
        if (sev === 'info') return c.status === 'info';
        if (sev === 'all') return true;
        return c.status === 'fail' && c.severity === sev;
      })
      .sort((a, b) => (a.status === b.status ? (order[a.severity] - order[b.severity]) || (b.affected - a.affected) : a.status === 'fail' ? -1 : 1));
  }, [checks, sev, cat]);

  const pages = useMemo(() => {
    const q = pageQuery.trim().toLowerCase();
    return (report?.pages || []).filter((p) => !q || p.url.toLowerCase().includes(q) || (p.title || '').toLowerCase().includes(q));
  }, [report, pageQuery]);

  async function toggleShare() {
    setShareBusy(true);
    const res = await fetch(`/api/seo/audits/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPublic: !data.isPublic }) });
    const d = await res.json();
    if (d.ok) setData({ ...data, isPublic: d.isPublic });
    setShareBusy(false);
  }

  async function rerun() {
    setRerunBusy(true);
    const res = await fetch('/api/seo/audits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: data.startUrl }) });
    const d = await res.json();
    if (d.ok) router.push(`/seo-report/${d.id}`); else { alert(d.error || 'Could not start the audit.'); setRerunBusy(false); }
  }

  async function remove() {
    if (!confirm('Delete this report? This cannot be undone.')) return;
    const res = await fetch(`/api/seo/audits/${id}`, { method: 'DELETE' });
    const d = await res.json();
    if (d.ok) router.push('/account/seo'); else alert(d.error);
  }

  function downloadCsv() {
    const rows = [['Check', 'Severity', 'Category', 'Status', 'URL', 'Details', 'How to fix']];
    for (const c of checks) {
      const status = c.status === 'pass' ? 'Passed' : c.status === 'info' ? 'Info' : 'Issue';
      if (c.urls?.length) c.urls.forEach((u) => rows.push([c.title, c.severity, CATEGORIES[c.category], status, u.url, u.note || '', c.fix]));
      else rows.push([c.title, c.severity, CATEGORIES[c.category], status, '', c.message, c.fix]);
    }
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `seo-site-audit-${data.site}-${new Date(data.createdAt).toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <AlertTriangle className="w-10 h-10 mx-auto text-amber-500" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-3">{error}</h1>
        <Link href="/seo-audit" className="inline-block mt-4 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Run a free SEO audit</Link>
      </div>
    );
  }
  if (!data) return <div className="flex items-center justify-center py-24 text-slate-500 dark:text-slate-400"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading report...</div>;

  if (data.status === 'running') {
    const p = data.progress || {};
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <Loader2 className="w-10 h-10 mx-auto animate-spin text-indigo-500" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">Auditing {data.site}</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2">{PHASES[p.phase] || 'Working'}...</p>
        <div className="flex justify-center gap-8 mt-6">
          {[['Crawled', p.crawled || 0], ['Analyzed', p.analyzed || 0], ['In queue', p.queued || 0]].map(([l, v]) => (
            <div key={l}><div className="text-3xl font-extrabold text-slate-900 dark:text-white">{v}</div><div className="text-xs text-slate-500 dark:text-slate-400">{l}</div></div>
          ))}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-8">This page updates by itself. You can also leave and find the report in your <Link href="/account/seo" className="text-indigo-600 dark:text-indigo-400 hover:underline">SEO dashboard</Link>.</p>
      </div>
    );
  }

  if (data.status === 'failed' || !report) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <AlertTriangle className="w-10 h-10 mx-auto text-red-500" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-3">{data.status === 'failed' ? 'This audit failed' : 'This report has been archived'}</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2">{data.error || 'Only the 10 most recent reports per site are kept in full.'}</p>
        {data.isOwner && <button onClick={rerun} disabled={rerunBusy} className="mt-4 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Run it again</button>}
      </div>
    );
  }

  const s = report.summary;
  const st = report.stats;
  const cmp = data.compare;
  const delta = cmp ? data.score - cmp.prevScore : null;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/seo-report/${id}` : '';
  const title = (cid) => CHECKS[cid]?.title || cid;

  return (
    <div className="space-y-6">
      {data.isOwner && (
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link href="/account/seo" className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"><ArrowLeft className="w-4 h-4" /> SEO dashboard</Link>
          <div className="flex flex-wrap gap-2">
            <button onClick={rerun} disabled={rerunBusy} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"><RotateCcw className="w-4 h-4" /> Re-audit</button>
            <button onClick={downloadCsv} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"><Download className="w-4 h-4" /> CSV</button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"><Printer className="w-4 h-4" /> Save PDF</button>
            <button onClick={toggleShare} disabled={shareBusy} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold ${data.isPublic ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700'}`}><Share2 className="w-4 h-4" /> {data.isPublic ? 'Shared' : 'Share'}</button>
            <button onClick={remove} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
      )}
      {data.isOwner && data.isPublic && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm print:hidden">
          <span className="text-emerald-800 dark:text-emerald-200 font-semibold">Anyone with this link can view the report:</span>
          <code className="flex-1 truncate text-emerald-900 dark:text-emerald-100">{shareUrl}</code>
          <button onClick={() => { navigator.clipboard?.writeText(shareUrl); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 1500); }} className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300">{linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {linkCopied ? 'Copied' : 'Copy link'}</button>
        </div>
      )}

      {/* Score header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 sm:p-6 break-inside-avoid">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <ScoreRing score={data.score} />
          <div className="flex-1 min-w-0 w-full">
            <div className="text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">Site SEO score</div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white break-all">{data.site}</h1>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Audited {new Date(data.createdAt).toLocaleString()} · {st.analyzed} pages analyzed in {report.durationSec}s
              {report.stopReason === 'limit' && ' · Stopped at the 500 page limit'}
              {report.stopReason === 'time' && ' · Stopped at the time limit'}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {['critical', 'warning', 'notice', 'pass'].map((k) => (
                <button key={k} onClick={() => { setTab('issues'); setSev(k); }} className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full border ${SEV[k].pill}`}>
                  {(() => { const I = SEV[k].Icon; return <I className="w-4 h-4" />; })()}
                  {k === 'pass' ? s.passed : s[k]} {SEV[k].label}
                </button>
              ))}
            </div>
            <div className="mt-4"><CategoryBars scores={catScores} onPick={(c) => { setTab('issues'); setCat(c); setSev('all'); }} /></div>
          </div>
        </div>
      </div>

      {/* Compare with previous */}
      {cmp && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 break-inside-avoid">
          <div className="flex flex-wrap items-center gap-3">
            {delta >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
            <span className="font-semibold text-slate-900 dark:text-white">
              {delta === 0 ? 'Same score as' : delta > 0 ? `Up ${delta} points since` : `Down ${Math.abs(delta)} points since`} the audit on {new Date(cmp.prevDate).toLocaleDateString()}
            </span>
            <Link href={`/seo-report/${cmp.prevId}`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline print:hidden">View previous</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-sm">
            {[['Fixed', cmp.fixed, 'text-emerald-600 dark:text-emerald-400'], ['Improved', cmp.better, 'text-emerald-600 dark:text-emerald-400'], ['Got worse', cmp.worse, 'text-amber-600 dark:text-amber-400'], ['New issues', cmp.added, 'text-red-600 dark:text-red-400']].map(([label, list, cls]) => (
              <div key={label} className="rounded-lg bg-slate-50 dark:bg-slate-900/60 p-3">
                <div className={`font-bold ${cls}`}>{list.length} {label}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{list.length ? list.slice(0, 4).map(title).join(', ') + (list.length > 4 ? ` +${list.length - 4} more` : '') : 'None'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          [FileText, 'Pages analyzed', st.analyzed],
          [Clock, 'Avg response', `${st.avgTtfb} ms`, st.avgTtfb > 800],
          [FileText, 'Avg words', st.avgWords, st.avgWords < 300],
          [Unlink, 'Broken links', st.brokenLinks, st.brokenLinks > 0],
          [CornerDownRight, 'Redirects', st.redirects, st.redirects > 0],
          [EyeOff, 'Noindex pages', st.noindex],
          [MapIcon, 'Sitemap URLs', st.sitemapUrls, !st.sitemapUrls],
        ].map(([Icon, label, value, warn]) => (
          <div key={label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><Icon className="w-3.5 h-3.5" /> {label}</div>
            <div className={`mt-1 text-lg font-bold ${warn ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 print:hidden">
        {[['issues', 'Issues'], ['pages', `Pages (${report.pages.length})`], ['errors', `Error pages (${report.errorPages.length})`]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${tab === k ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>{l}</button>
        ))}
      </div>

      {tab === 'issues' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700 space-y-3 print:hidden">
            <div className="flex gap-1 overflow-x-auto">
              {[
                ['issues', `All issues (${s.critical + s.warning + s.notice})`], ['critical', `Critical (${s.critical})`], ['warning', `Warnings (${s.warning})`],
                ['notice', `Notices (${s.notice})`], ['pass', `Passed (${s.passed})`], ['info', 'Info'],
              ].map(([k, l]) => (
                <button key={k} onClick={() => setSev(k)} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-semibold ${sev === k ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{l}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[['all', 'All categories'], ...catScores.map((c) => [c.cat, c.label])].map(([k, l]) => (
                <button key={k} onClick={() => setCat(k)} className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cat === k ? 'border-indigo-500 text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/50' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}>{l}</button>
              ))}
            </div>
          </div>
          {visible.length ? visible.map((c) => <IssueRow key={c.id} c={c} />) : <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">Nothing here. Nice work.</div>}
        </div>
      )}

      {tab === 'pages' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={pageQuery} onChange={(e) => setPageQuery(e.target.value)} placeholder="Filter by URL or title" className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60">
                <tr><th className="px-4 py-2">Score</th><th className="px-4 py-2">Page</th><th className="px-4 py-2 hidden md:table-cell">Issues</th><th className="px-4 py-2 hidden lg:table-cell">Words</th><th className="px-4 py-2 hidden lg:table-cell">Depth</th></tr>
              </thead>
              <tbody>
                {pages.slice(0, 300).map((p) => (
                  <tr key={p.url} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="px-4 py-2"><span className={`inline-block min-w-[2.5rem] text-center font-bold rounded-md px-1.5 py-0.5 ${scoreColor(p.score).bg} ${scoreColor(p.score).text}`}>{p.score}</span></td>
                    <td className="px-4 py-2 max-w-md">
                      <a href={p.url} target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 dark:text-indigo-400 hover:underline break-all">{p.url.replace(report.origin, '') || '/'}</a>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{p.title || 'No title'}{p.noindex ? ' · noindex' : ''}</div>
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell whitespace-nowrap">
                      <span className="text-red-600 dark:text-red-400 font-semibold">{p.critical}</span> / <span className="text-amber-600 dark:text-amber-400 font-semibold">{p.warning}</span> / <span className="text-sky-600 dark:text-sky-400 font-semibold">{p.notice}</span>
                    </td>
                    <td className="px-4 py-2 hidden lg:table-cell text-slate-600 dark:text-slate-300">{p.words}</td>
                    <td className="px-4 py-2 hidden lg:table-cell text-slate-600 dark:text-slate-300">{p.depth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">Issues column: critical / warnings / notices. Lowest scores first.</p>
        </div>
      )}

      {tab === 'errors' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
          {report.errorPages.length ? (
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60"><tr><th className="px-4 py-2">Status</th><th className="px-4 py-2">URL</th></tr></thead>
              <tbody>
                {report.errorPages.map((e) => (
                  <tr key={e.url} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="px-4 py-2 font-bold text-red-600 dark:text-red-400 whitespace-nowrap">{e.status || 'Failed'}</td>
                    <td className="px-4 py-2 break-all text-slate-800 dark:text-slate-100">{e.url}{e.error && <div className="text-xs text-slate-500 dark:text-slate-400">{e.error}</div>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No error pages found. Every crawled URL returned 200 or a redirect.</div>}
        </div>
      )}

      {!data.isOwner && (
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white print:hidden">
          <div className="text-lg font-bold">Audit your own website for free</div>
          <p className="text-sm text-indigo-100 mt-1">Get an SEO score, 40+ checks, and step-by-step fixes in minutes.</p>
          <Link href="/seo-audit" className="inline-block mt-3 px-4 py-2 rounded-lg bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50">Run a free SEO audit</Link>
        </div>
      )}
    </div>
  );
}
