'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Globe, Loader2, AlertTriangle, RotateCcw, FileBarChart, ChevronDown, Search, Map as MapIcon, Tags, Code2, Bot, Plus, XCircle, Clock,
} from 'lucide-react';
import { ScoreRing, Sparkline, SEV, scoreColor, timeAgo, PHASES } from './ReportParts';

export default function SeoDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [openSite, setOpenSite] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/seo/audits', { cache: 'no-store' });
      if (res.status === 401) { router.push('/login'); return; }
      const d = await res.json();
      if (d.error) setError(d.error); else setData(d);
    } catch { setError('Could not load your audits.'); }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const running = useMemo(() => (data?.audits || []).filter((a) => a.status === 'running'), [data]);
  useEffect(() => {
    if (!running.length) return;
    const t = setInterval(load, 2500);
    return () => clearInterval(t);
  }, [running.length, load]);

  const sites = useMemo(() => {
    const map = new Map();
    for (const a of data?.audits || []) {
      if (!map.has(a.site)) map.set(a.site, []);
      map.get(a.site).push(a);
    }
    return [...map.entries()].map(([site, list]) => {
      const done = list.filter((a) => a.status === 'done');
      return { site, list, latest: done[0] || null, startUrl: list[0].start_url, trend: done.slice(0, 10).reverse().map((a) => a.score) };
    }).filter((s) => s.latest || s.list.some((a) => a.status === 'failed'));
  }, [data]);

  async function start(targetUrl) {
    const u = (targetUrl || url).trim();
    if (!u || busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/seo/audits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: u }) });
      const d = await res.json();
      if (!res.ok || d.error) setError(d.error || 'Could not start the audit.');
      else { setUrl(''); await load(); }
    } catch { setError('Network error. Please try again.'); }
    setBusy(false);
  }

  if (!data && !error) {
    return <div className="flex items-center justify-center py-24 text-slate-500 dark:text-slate-400"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading your SEO dashboard...</div>;
  }

  const limitText = data?.isAdmin ? 'Unlimited audits (admin)' : `${data?.remaining ?? 0} of ${data?.dailyLimit ?? 3} full-site audits left today`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">SEO Dashboard</p>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Your website audits</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Crawl up to 500 pages, track your score over time, and fix issues site-wide.</p>
        </div>
        <Link href="/seo-audit" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Quick single-page audit</Link>
      </div>

      {/* New audit */}
      <form onSubmit={(e) => { e.preventDefault(); start(); }} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
        <label className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><Plus className="w-4 h-4 text-indigo-500" /> Audit a whole website</label>
        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <input value={url} onChange={(e) => setUrl(e.target.value)} disabled={busy} inputMode="url" placeholder="https://yourwebsite.com"
            className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button type="submit" disabled={busy || !url.trim()} className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />} Start full audit
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{limitText}. Audits usually take 1 to 5 minutes. You can leave this page and come back.</p>
        {error && <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-700 dark:text-red-300"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</div>}
      </form>

      {/* Running */}
      {running.map((a) => {
        const p = a.progress || {};
        const pct = Math.min(100, Math.round(((p.crawled || 0) / 500) * 100));
        return (
          <div key={a.id} className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-5">
            <div className="flex items-center gap-2 font-semibold text-indigo-900 dark:text-indigo-100"><Loader2 className="w-5 h-5 animate-spin" /> Auditing {a.site}</div>
            <p className="text-sm text-indigo-800 dark:text-indigo-200 mt-1">{PHASES[p.phase] || 'Working'}... {p.crawled || 0} pages crawled, {p.analyzed || 0} analyzed{p.queued ? `, ${p.queued} in queue` : ''}.</p>
            <div className="mt-3 h-2 bg-indigo-100 dark:bg-indigo-900 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 transition-all" style={{ width: `${p.phase === 'crawling' || !p.phase ? pct : 100}%` }} /></div>
            <Link href={`/seo-report/${a.id}`} className="inline-block mt-3 text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:underline">Open live report</Link>
          </div>
        );
      })}

      {/* Sites */}
      {sites.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your sites</h2>
          {sites.map((s) => {
            const l = s.latest;
            const prev = s.list.filter((a) => a.status === 'done')[1];
            const delta = l && prev ? l.score - prev.score : null;
            return (
              <div key={s.site} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="p-5 flex flex-col md:flex-row md:items-center gap-5">
                  {l ? <ScoreRing score={l.score} size={84} label={false} /> : <div className="w-[84px] h-[84px] rounded-full border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center"><XCircle className="w-6 h-6 text-slate-400" /></div>}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xl font-bold text-slate-900 dark:text-white">{s.site}</span>
                      {l && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scoreColor(l.score).bg} ${scoreColor(l.score).text}`}>{scoreColor(l.score).label}</span>}
                      {delta !== null && delta !== 0 && <span className={`text-xs font-bold ${delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{delta > 0 ? '+' : ''}{delta} since last audit</span>}
                    </div>
                    {l ? (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300 mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {timeAgo(l.created_at)}</span>
                        <span>{l.pages} pages</span>
                        {['critical', 'warning', 'notice'].map((k) => (
                          <span key={k} className={SEV[k].cls}>{l.summary?.[k] ?? 0} {SEV[k].label.toLowerCase()}</span>
                        ))}
                      </div>
                    ) : <p className="text-sm text-red-600 dark:text-red-400 mt-1">{s.list[0].error || 'The last audit failed.'}</p>}
                  </div>
                  <Sparkline values={s.trend} />
                  <div className="flex gap-2">
                    {l && <Link href={`/seo-report/${l.id}`} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"><FileBarChart className="w-4 h-4" /> Report</Link>}
                    <button onClick={() => start(s.startUrl)} disabled={busy || running.length > 0} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"><RotateCcw className="w-4 h-4" /> Re-audit</button>
                  </div>
                </div>
                <button onClick={() => setOpenSite(openSite === s.site ? '' : s.site)} className="w-full flex items-center justify-between px-5 py-2.5 border-t border-slate-100 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40">
                  Audit history ({s.list.length}) <ChevronDown className={`w-4 h-4 transition-transform ${openSite === s.site ? 'rotate-180' : ''}`} />
                </button>
                {openSite === s.site && (
                  <ul className="px-5 pb-4 divide-y divide-slate-100 dark:divide-slate-700">
                    {s.list.map((a) => (
                      <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-slate-600 dark:text-slate-300">{new Date(a.created_at).toLocaleString()}</span>
                        {a.status === 'done' ? (
                          <span className="flex items-center gap-3">
                            <span className={`font-bold ${scoreColor(a.score).text}`}>{a.score}</span>
                            {a.has_report ? <Link href={`/seo-report/${a.id}`} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">View</Link> : <span className="text-xs text-slate-400">Archived</span>}
                          </span>
                        ) : a.status === 'running' ? <span className="text-indigo-600 dark:text-indigo-400">Running</span> : <span className="text-red-600 dark:text-red-400">Failed</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      ) : !running.length && (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 p-10 text-center">
          <Globe className="w-10 h-10 mx-auto text-indigo-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-3">Run your first full-site audit</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-1 max-w-lg mx-auto">Enter your homepage above. Craftora crawls your site, checks every page for 40+ SEO issues, and saves the report here so you can track your progress.</p>
        </div>
      )}

      {/* Interlinking: related tools */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Fix issues faster</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            ['/seo-audit', Search, 'Single Page Audit', 'Instant check for one URL'],
            ['/sitemap-generator', MapIcon, 'Sitemap Generator', 'Build sitemap.xml'],
            ['/meta-tag-generator', Tags, 'Meta Tag Generator', 'Titles and descriptions'],
            ['/schema-generator', Code2, 'Schema Generator', 'JSON-LD rich results'],
            ['/robots-txt-generator', Bot, 'Robots.txt Generator', 'Control crawling'],
          ].map(([href, Icon, name, sub]) => (
            <Link key={href} href={href} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:border-indigo-400 dark:hover:border-indigo-500 transition">
              <Icon className="w-5 h-5 text-indigo-500" />
              <div className="font-semibold text-slate-900 dark:text-white mt-2 text-sm">{name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{sub}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
