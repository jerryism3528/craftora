'use client';

import { useState, useRef } from 'react';
import { Globe, ClipboardList, Download, Loader2, AlertTriangle, CheckCircle2, Copy, Square } from 'lucide-react';

const FREQS = ['', 'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function depthPriority(depth) {
  if (depth <= 0) return '1.0';
  if (depth === 1) return '0.8';
  if (depth === 2) return '0.6';
  return '0.5';
}

function buildXml(entries, { freq, useLastmod, usePriority, fixedPriority }) {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  for (const e of entries) {
    lines.push('  <url>');
    lines.push(`    <loc>${esc(e.url)}</loc>`);
    if (useLastmod && e.lastmod) lines.push(`    <lastmod>${e.lastmod}</lastmod>`);
    if (freq) lines.push(`    <changefreq>${freq}</changefreq>`);
    if (usePriority) lines.push(`    <priority>${fixedPriority || depthPriority(e.depth ?? 0)}</priority>`);
    lines.push('  </url>');
  }
  lines.push('</urlset>');
  return lines.join('\n');
}

function buildHtml(entries, origin) {
  const items = entries
    .map((e) => `    <li><a href="${esc(e.url)}">${esc(e.title || e.url)}</a></li>`)
    .join('\n');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sitemap${origin ? ' | ' + esc(origin.replace(/^https?:\/\//, '')) : ''}</title>
  <style>body{font-family:system-ui,sans-serif;max-width:860px;margin:40px auto;padding:0 16px;line-height:1.6}li{margin:4px 0}a{color:#4f46e5}</style>
</head>
<body>
  <h1>Sitemap</h1>
  <ul>
${items}
  </ul>
</body>
</html>`;
}

function download(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function SitemapGeneratorTool() {
  const [mode, setMode] = useState('crawl');

  // shared options
  const [freq, setFreq] = useState('');
  const [useLastmod, setUseLastmod] = useState(true);
  const [usePriority, setUsePriority] = useState(true);
  const [copied, setCopied] = useState(false);

  // crawl state
  const [url, setUrl] = useState('');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const abortRef = useRef(null);

  // paste state
  const [pasted, setPasted] = useState('');
  const [pasteLastmod, setPasteLastmod] = useState(true);
  const [pastePriority, setPastePriority] = useState('0.8');
  const [pasteOut, setPasteOut] = useState(null);

  async function startCrawl(e) {
    e?.preventDefault();
    if (running || !url.trim()) return;
    setError('');
    setResult(null);
    setShowAll(false);
    setProgress({ crawled: 0, found: 0, queued: 0, broken: 0, current: '' });
    setRunning(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch('/api/tools/sitemap-crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        let msg = 'Crawl failed. Please try again.';
        try { msg = (await res.json()).error || msg; } catch {}
        setError(msg);
        setRunning(false);
        setProgress(null);
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      let finished = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line) continue;
          let ev;
          try { ev = JSON.parse(line); } catch { continue; }
          if (ev.type === 'remaining') setRemaining(ev.remaining);
          else if (ev.type === 'progress') setProgress(ev);
          else if (ev.type === 'done') { setResult(ev); finished = true; }
          else if (ev.type === 'error') { setError(ev.error); finished = true; }
        }
      }
      if (!finished) setError('The connection was interrupted before the crawl finished. Please try again.');
    } catch (err) {
      if (err.name === 'AbortError') setError('Crawl stopped.');
      else setError('Network error. Please try again.');
    }
    setRunning(false);
    setProgress(null);
    abortRef.current = null;
  }

  function stopCrawl() {
    abortRef.current?.abort();
  }

  function crawlXml() {
    return buildXml(result.pages, { freq, useLastmod, usePriority });
  }

  function copyText(text) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function generatePasted() {
    const today = new Date().toISOString().slice(0, 10);
    const seen = new Set();
    const good = [];
    const bad = [];
    for (const raw of pasted.split(/[\s,]+/)) {
      const s = raw.trim();
      if (!s) continue;
      let u;
      try { u = new URL(/^https?:\/\//i.test(s) ? s : 'https://' + s); } catch { bad.push(s); continue; }
      if (!['http:', 'https:'].includes(u.protocol) || !u.hostname.includes('.')) { bad.push(s); continue; }
      u.hash = '';
      if (seen.has(u.href)) continue;
      seen.add(u.href);
      good.push({ url: u.href, lastmod: pasteLastmod ? today : '' });
    }
    if (good.length > 50000) good.length = 50000;
    const xml = buildXml(good, { freq, useLastmod: pasteLastmod, usePriority: !!pastePriority, fixedPriority: pastePriority });
    setPasteOut({ xml, count: good.length, bad, entries: good });
  }

  const tabBtn = (key, Icon, label) => (
    <button
      type="button"
      onClick={() => setMode(key)}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
        mode === key ? 'bg-white dark:bg-slate-700 shadow text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  const optionsRow = (
    <div className="flex flex-wrap gap-4 items-center text-sm text-slate-700 dark:text-slate-200">
      <label className="flex items-center gap-2">
        Change frequency
        <select value={freq} onChange={(e) => setFreq(e.target.value)} className="border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1.5 bg-white dark:bg-slate-800">
          {FREQS.map((f) => <option key={f} value={f}>{f || 'None'}</option>)}
        </select>
      </label>
      {mode === 'crawl' ? (
        <>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={useLastmod} onChange={(e) => setUseLastmod(e.target.checked)} /> Include lastmod
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={usePriority} onChange={(e) => setUsePriority(e.target.checked)} /> Priority by page depth
          </label>
        </>
      ) : (
        <>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={pasteLastmod} onChange={(e) => setPasteLastmod(e.target.checked)} /> Lastmod = today
          </label>
          <label className="flex items-center gap-2">
            Priority
            <select value={pastePriority} onChange={(e) => setPastePriority(e.target.value)} className="border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1.5 bg-white dark:bg-slate-800">
              <option value="">None</option>
              {['1.0', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3'].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
        </>
      )}
    </div>
  );

  const pagesToShow = result ? (showAll ? result.pages : result.pages.slice(0, 50)) : [];

  return (
    <div className="space-y-6">
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        {tabBtn('crawl', Globe, 'Crawl my website')}
        {tabBtn('paste', ClipboardList, 'Paste URLs')}
      </div>

      {mode === 'crawl' && (
        <div className="space-y-5">
          <form onSubmit={startCrawl} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              disabled={running}
              className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-base bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {running ? (
              <button type="button" onClick={stopCrawl} className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-800">
                <Square className="w-4 h-4" /> Stop
              </button>
            ) : (
              <button type="submit" disabled={!url.trim()} className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50">
                <Globe className="w-4 h-4" /> Generate Sitemap
              </button>
            )}
          </form>

          {optionsRow}

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Free, no signup. Crawls up to 500 pages per site and respects robots.txt.
            {remaining !== null && ` ${remaining} of 3 crawls left this hour.`}
          </p>

          {running && progress && (
            <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-5">
              <div className="flex items-center gap-3 font-semibold text-indigo-800 dark:text-indigo-200">
                <Loader2 className="w-5 h-5 animate-spin" />
                Found {progress.found} pages... ({progress.crawled} crawled, {progress.queued} in queue)
              </div>
              <div className="mt-3 h-2 bg-indigo-100 dark:bg-indigo-900 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 transition-all" style={{ width: `${Math.min(100, (progress.crawled / 500) * 100)}%` }} />
              </div>
              {progress.current && <p className="mt-2 text-xs text-indigo-700 dark:text-indigo-300 truncate">{progress.current}</p>}
              {progress.broken > 0 && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{progress.broken} broken links so far</p>}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-300">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
            </div>
          )}

          {result && (
            <div className="space-y-5">
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-5">
                <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="w-5 h-5" /> Sitemap ready: {result.pages.length} pages from {result.origin.replace(/^https?:\/\//, '')}
                </div>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div><div className="text-slate-500 dark:text-slate-400">Pages crawled</div><div className="font-bold text-slate-900 dark:text-white">{result.stats.crawled}</div></div>
                  <div><div className="text-slate-500 dark:text-slate-400">Broken links</div><div className={`font-bold ${result.broken.length ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{result.broken.length}</div></div>
                  <div><div className="text-slate-500 dark:text-slate-400">Blocked by robots.txt</div><div className="font-bold text-slate-900 dark:text-white">{result.stats.skippedRobots}</div></div>
                  <div><div className="text-slate-500 dark:text-slate-400">Noindex pages skipped</div><div className="font-bold text-slate-900 dark:text-white">{result.stats.skippedNoindex}</div></div>
                </div>
                {result.stopReason === 'limit' && <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">Reached the 500 page limit. Pages closest to the homepage were included first.</p>}
                {result.stopReason === 'time' && <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">The site was slow, so the crawl stopped at the time limit. The pages found so far are included.</p>}
              </div>

              {result.pages.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => download('sitemap.xml', crawlXml(), 'application/xml')} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
                    <Download className="w-4 h-4" /> sitemap.xml
                  </button>
                  <button onClick={() => download('sitemap.txt', result.pages.map((p) => p.url).join('\n'), 'text/plain')} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700">
                    <Download className="w-4 h-4" /> TXT
                  </button>
                  <button onClick={() => download('sitemap.html', buildHtml(result.pages, result.origin), 'text/html')} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700">
                    <Download className="w-4 h-4" /> HTML sitemap
                  </button>
                  <button onClick={() => copyText(crawlXml())} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700">
                    <Copy className="w-4 h-4" /> {copied ? 'Copied' : 'Copy XML'}
                  </button>
                </div>
              )}

              {result.pages.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-800 dark:text-slate-100 text-sm">Pages found ({result.pages.length})</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-slate-500 dark:text-slate-400">
                        <tr><th className="px-4 py-2">URL</th><th className="px-4 py-2 hidden md:table-cell">Title</th><th className="px-4 py-2">Depth</th></tr>
                      </thead>
                      <tbody>
                        {pagesToShow.map((p) => (
                          <tr key={p.url} className="border-t border-slate-100 dark:border-slate-700">
                            <td className="px-4 py-2 max-w-xs truncate"><a href={p.url} target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 dark:text-indigo-400 hover:underline">{p.url.replace(result.origin, '') || '/'}</a></td>
                            <td className="px-4 py-2 hidden md:table-cell max-w-xs truncate text-slate-600 dark:text-slate-300">{p.title}</td>
                            <td className="px-4 py-2 text-slate-600 dark:text-slate-300">{p.depth}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {result.pages.length > 50 && !showAll && (
                    <button onClick={() => setShowAll(true)} className="w-full py-2.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                      Show all {result.pages.length} pages
                    </button>
                  )}
                </div>
              )}

              {result.broken.length > 0 && (
                <div className="rounded-xl border border-red-200 dark:border-red-800 overflow-hidden">
                  <div className="px-4 py-3 bg-red-50 dark:bg-red-950/40 font-semibold text-red-800 dark:text-red-200 text-sm flex items-center justify-between">
                    <span>Broken links ({result.broken.length})</span>
                    <button
                      onClick={() => download('broken-links.csv', [['Broken URL', 'Status', 'Found on page'], ...result.broken.map((b) => [b.url, b.status || b.error, b.from])].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv')}
                      className="text-xs font-semibold text-red-700 dark:text-red-300 hover:underline"
                    >
                      Export CSV
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-slate-500 dark:text-slate-400">
                        <tr><th className="px-4 py-2">Broken URL</th><th className="px-4 py-2">Status</th><th className="px-4 py-2 hidden md:table-cell">Found on</th></tr>
                      </thead>
                      <tbody>
                        {result.broken.slice(0, 200).map((b) => (
                          <tr key={b.url} className="border-t border-slate-100 dark:border-slate-700">
                            <td className="px-4 py-2 max-w-xs truncate text-slate-800 dark:text-slate-100">{b.url}</td>
                            <td className="px-4 py-2 font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">{b.status || b.error}</td>
                            <td className="px-4 py-2 hidden md:table-cell max-w-xs truncate text-slate-600 dark:text-slate-300">{b.from}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {mode === 'paste' && (
        <div className="space-y-5">
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={10}
            placeholder={'https://yourwebsite.com/\nhttps://yourwebsite.com/about\nhttps://yourwebsite.com/blog'}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 font-mono text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {optionsRow}
          <button onClick={generatePasted} disabled={!pasted.trim()} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50">
            <ClipboardList className="w-4 h-4" /> Generate XML
          </button>

          {pasteOut && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4" /> {pasteOut.count} URLs added
                {pasteOut.bad.length > 0 && <span className="text-amber-700 dark:text-amber-300 font-normal">({pasteOut.bad.length} invalid lines skipped)</span>}
              </div>
              {pasteOut.count > 0 && (
                <>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => download('sitemap.xml', pasteOut.xml, 'application/xml')} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
                      <Download className="w-4 h-4" /> sitemap.xml
                    </button>
                    <button onClick={() => download('sitemap.txt', pasteOut.entries.map((e) => e.url).join('\n'), 'text/plain')} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700">
                      <Download className="w-4 h-4" /> TXT
                    </button>
                    <button onClick={() => download('sitemap.html', buildHtml(pasteOut.entries, ''), 'text/html')} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700">
                      <Download className="w-4 h-4" /> HTML sitemap
                    </button>
                    <button onClick={() => copyText(pasteOut.xml)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700">
                      <Copy className="w-4 h-4" /> {copied ? 'Copied' : 'Copy XML'}
                    </button>
                  </div>
                  <pre className="max-h-80 overflow-auto rounded-lg bg-slate-900 text-slate-100 text-xs p-4">{pasteOut.xml}</pre>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
