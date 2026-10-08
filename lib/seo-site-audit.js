// Full-site SEO audit: crawl up to N pages, analyze each one, then add site-wide checks.
import { fetchPage, analyzeDocument, siteLevelChecks, checkLinks, isBrokenStatus, fetchSmallText } from './seo-audit';
import { loadRobots, normalize, safeFetch } from './sitemap-crawler';
import { CHECKS, SEVERITY_WEIGHT, scoreChecks } from './seo-checks';

const SKIP_EXT = /\.(jpe?g|png|gif|webp|svg|ico|bmp|tiff?|avif|heic|pdf|zip|rar|7z|gz|tgz|tar|bz2|mp3|mp4|m4a|m4v|wav|ogg|oga|webm|mov|avi|mkv|flv|wmv|css|js|mjs|json|xml|rss|atom|txt|woff2?|ttf|eot|otf|docx?|xlsx?|pptx?|odt|ods|csv|exe|msi|dmg|apk|iso|bin)$/i;
const CONCURRENCY = 5;
const DEADLINE = 9 * 60 * 1000;
const SITE_LEVEL = new Set(['favicon', 'hsts', 'robots-txt', 'sitemap', 'robots-allowed', 'broken-links']);

// Shared across route bundles, so the start route and the status route see the same jobs.
export const jobs = globalThis.__craftoraSeoJobs || (globalThis.__craftoraSeoJobs = new Map());

function pl(n, w) { return n === 1 ? w : w + 's'; }
function baseHost(h) { return h.replace(/^www\./, '').toLowerCase(); }

function agg(id, status, affected, applicable, message, urls = []) {
  const c = CHECKS[id];
  return { id, category: c.category, severity: c.severity, title: c.title, fix: c.fix, tools: c.tools, status, affected, applicable, message, urls: urls.slice(0, 200) };
}

export async function runSiteAudit(startUrl, { maxPages = 500, onProgress = () => {} } = {}) {
  const started = Date.now();
  const first = await fetchPage(startUrl);
  const root = new URL(first.finalUrl);
  if (baseHost(root.hostname) !== baseHost(new URL(startUrl).hostname)) {
    throw new Error(`The website redirects to a different domain (${root.hostname}). Audit that domain instead.`);
  }
  const host = root.host;
  const origin = root.origin;
  const allowed = await loadRobots(origin);

  const seen = new Set();
  const queue = [];
  const records = new Map();   // url -> { url, status, depth, ttfb, redirectTo, error }
  const analyzed = [];         // per-page analysis for 200 HTML pages
  const inlinks = new Map();   // url -> Set(referrers)
  const externals = new Map(); // url -> first referrer
  let fetched = 0;
  let skippedRobots = 0;
  let stopReason = '';

  const enqueue = (url, depth, from) => {
    let n;
    try { n = normalize(url); } catch { return; }
    const u = new URL(n);
    if (!['http:', 'https:'].includes(u.protocol)) return;
    if (baseHost(u.hostname) !== baseHost(root.hostname)) return;
    if (SKIP_EXT.test(u.pathname)) return;
    if (seen.has(n)) return;
    if (seen.size >= maxPages * 4) return;
    if (u.host === host && !allowed(u.pathname + u.search)) { seen.add(n); skippedRobots++; return; }
    seen.add(n);
    queue.push({ url: n, depth, from });
  };

  const handle = (page, item) => {
    const finalUrl = normalize(page.finalUrl);
    if (page.chain.length) {
      records.set(item.url, { url: item.url, status: page.chain[0].status, depth: item.depth, redirectTo: finalUrl });
      if (new URL(finalUrl).host !== host) return;
      if (seen.has(finalUrl) && finalUrl !== item.url) return;
      seen.add(finalUrl);
    }
    records.set(finalUrl, { url: finalUrl, status: page.status, depth: item.depth, ttfb: page.ttfb });
    if (page.status !== 200 || !page.html) return;

    const { results, info, links } = analyzeDocument(page);
    const score = scoreChecks(results.filter((r) => !SITE_LEVEL.has(r.id)));
    analyzed.push({ url: finalUrl, depth: item.depth, results, info, score });

    if (info.canonical && info.canonical !== finalUrl) enqueue(info.canonical, item.depth, finalUrl);
    for (const l of links.internal) {
      if (!inlinks.has(l.url)) inlinks.set(l.url, new Set());
      const set = inlinks.get(l.url);
      if (set.size < 5) set.add(finalUrl);
      enqueue(l.url, item.depth + 1, finalUrl);
    }
    for (const l of links.external) if (!externals.has(l.url)) externals.set(l.url, finalUrl);
  };

  let active = 0;
  enqueue(root.href, 0, '');
  const worker = async () => {
    while (true) {
      if (Date.now() - started > DEADLINE) { stopReason = 'time'; return; }
      if (fetched >= maxPages) { if (queue.length) stopReason = 'limit'; return; }
      const item = queue.shift();
      if (!item) {
        if (active === 0) return;
        await new Promise((r) => setTimeout(r, 150));
        continue;
      }
      active++;
      fetched++;
      try {
        const page = await fetchPage(item.url);
        handle(page, item);
      } catch (e) {
        records.set(item.url, { url: item.url, status: 0, depth: item.depth, error: e.message });
      } finally {
        active--;
      }
      onProgress({ phase: 'crawling', crawled: fetched, analyzed: analyzed.length, queued: queue.length });
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  if (!analyzed.length) throw new Error('No HTML pages could be crawled on this website.');

  // ---------- Site-level checks ----------
  onProgress({ phase: 'site', crawled: fetched, analyzed: analyzed.length, queued: 0 });
  const home = analyzed.find((a) => a.depth === 0) || analyzed[0];
  const site = await siteLevelChecks(origin, { page: first, info: home.info });
  const checks = [];
  for (const r of site.results) {
    checks.push({ ...r, affected: r.status === 'fail' ? 1 : 0, applicable: 1, message: r.message, urls: [] });
  }

  // ---------- Aggregate per-page checks ----------
  const byId = new Map();
  for (const a of analyzed) {
    for (const r of a.results) {
      if (SITE_LEVEL.has(r.id) || r.id === 'status-ok') continue;
      if (!byId.has(r.id)) byId.set(r.id, { applicable: 0, failed: [] });
      const e = byId.get(r.id);
      e.applicable++;
      if (r.status === 'fail') e.failed.push({ url: a.url, note: r.message });
    }
  }
  for (const [id, e] of byId) {
    if (id === 'indexable') {
      checks.push(agg('noindex-pages', 'info', e.failed.length, e.applicable,
        e.failed.length ? `${e.failed.length} of ${e.applicable} pages are set to noindex.` : 'No pages are set to noindex.', e.failed));
      continue;
    }
    const c = CHECKS[id];
    const n = e.failed.length;
    checks.push(agg(id, n ? 'fail' : 'pass', n, e.applicable,
      n ? `${n} of ${e.applicable} ${pl(e.applicable, 'page')} affected.` : `All ${e.applicable} ${pl(e.applicable, 'page')} pass.`, e.failed));
  }

  // ---------- Site-wide checks ----------
  const indexable = analyzed.filter((a) => a.info && !a.info.noindex && (!a.info.canonical || a.info.canonical === a.url));
  const dupes = (key) => {
    const groups = new Map();
    for (const a of indexable) {
      const v = (a.info[key] || '').trim().toLowerCase();
      if (!v) continue;
      if (!groups.has(v)) groups.set(v, []);
      groups.get(v).push(a.url);
    }
    const urls = [];
    for (const [v, list] of groups) if (list.length > 1) for (const u of list) urls.push({ url: u, note: `Shared by ${list.length} pages: "${v.slice(0, 90)}"` });
    return urls;
  };
  const dt = dupes('title');
  checks.push(agg('duplicate-titles', dt.length ? 'fail' : 'pass', dt.length, indexable.length, dt.length ? `${dt.length} pages share a title with another page.` : 'Every page has a unique title.', dt));
  const dd = dupes('description');
  checks.push(agg('duplicate-descriptions', dd.length ? 'fail' : 'pass', dd.length, indexable.length, dd.length ? `${dd.length} pages share a meta description with another page.` : 'Every meta description is unique.', dd));

  const redirecting = [...records.values()].filter((r) => r.redirectTo && inlinks.has(r.url));
  checks.push(agg('internal-redirects', redirecting.length ? 'fail' : 'pass', redirecting.length, Math.max(inlinks.size, 1),
    redirecting.length ? `${redirecting.length} internal ${pl(redirecting.length, 'link')} ${redirecting.length > 1 ? 'point' : 'points'} to URLs that redirect.` : 'No internal links point to redirects.',
    redirecting.map((r) => ({ url: r.url, note: `Redirects to ${r.redirectTo}. Linked from ${[...inlinks.get(r.url)][0]}` }))));

  const deep = analyzed.filter((a) => a.depth > 3);
  checks.push(agg('crawl-depth', deep.length ? 'fail' : 'pass', deep.length, analyzed.length,
    deep.length ? `${deep.length} ${pl(deep.length, 'page')} ${deep.length > 1 ? 'are' : 'is'} more than 3 clicks from the homepage.` : 'All pages are within 3 clicks of the homepage.',
    deep.map((a) => ({ url: a.url, note: `${a.depth} clicks deep` }))));

  // ---------- Broken links (internal from crawl + external sample) ----------
  onProgress({ phase: 'links', crawled: fetched, analyzed: analyzed.length, queued: 0 });
  const brokenInternal = [...records.values()].filter((r) => !r.redirectTo && (r.status === 404 || r.status === 410 || r.status >= 500 || r.status === 0));
  const extList = [...externals.keys()].slice(0, 150).map((url) => ({ url, internal: false }));
  const extChecked = await checkLinks(extList, 60000, 8);
  const brokenExternal = extChecked.filter(isBrokenStatus);
  const brokenUrls = [
    ...brokenInternal.map((r) => ({ url: r.url, note: `${r.status || r.error || 'No response'}. Linked from ${inlinks.has(r.url) ? [...inlinks.get(r.url)].join(', ') : 'unknown'}` })),
    ...brokenExternal.map((l) => ({ url: l.url, note: `${l.status || l.error} (external). Linked from ${externals.get(l.url)}` })),
  ];
  const pagesWithBroken = new Set();
  brokenInternal.forEach((r) => inlinks.get(r.url)?.forEach((p) => pagesWithBroken.add(p)));
  brokenExternal.forEach((l) => pagesWithBroken.add(externals.get(l.url)));
  checks.push(agg('broken-links', brokenUrls.length ? 'fail' : 'pass', pagesWithBroken.size, analyzed.length,
    brokenUrls.length ? `${brokenUrls.length} broken ${pl(brokenUrls.length, 'link')} found on ${pagesWithBroken.size} ${pl(pagesWithBroken.size, 'page')} (${extChecked.length} external links checked).` : `No broken links found (${records.size} internal URLs and ${extChecked.length} external links checked).`,
    brokenUrls));

  // ---------- Sitemap coverage ----------
  onProgress({ phase: 'sitemap', crawled: fetched, analyzed: analyzed.length, queued: 0 });
  let sitemapLocs = [];
  if (site.sitemapText) {
    const locs = (t) => [...t.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].replace(/&amp;/g, '&'));
    if (/<sitemapindex/i.test(site.sitemapText)) {
      for (const child of locs(site.sitemapText).slice(0, 5)) {
        const r = await fetchSmallText(child);
        if (r.status === 200) sitemapLocs.push(...locs(r.text));
        if (sitemapLocs.length > 5000) break;
      }
    } else sitemapLocs = locs(site.sitemapText);
  }
  const norm = new Set();
  for (const l of sitemapLocs) { try { const n = normalize(l); if (new URL(n).host === host) norm.add(n); } catch {} }
  if (norm.size) {
    const errors = [];
    for (const u of norm) {
      const r = records.get(u);
      if (r && (r.redirectTo || r.status !== 200)) errors.push({ url: u, note: r.redirectTo ? `Redirects to ${r.redirectTo}` : `Returns ${r.status || 'no response'}` });
    }
    const notFound = [...norm].filter((u) => !records.has(u) && !seen.has(u));
    const orphans = [];
    if (stopReason !== 'limit') {
      const sample = notFound.slice(0, 60).map((url) => ({ url, internal: true }));
      const res = await checkLinks(sample, 45000, 6);
      for (const r of res) {
        if (r.status === 200) orphans.push({ url: r.url, note: 'In the sitemap but not linked from any crawled page' });
        else errors.push({ url: r.url, note: `Returns ${r.status || r.error || 'no response'}` });
      }
      checks.push(agg('orphan-pages', orphans.length ? 'fail' : 'pass', orphans.length, norm.size,
        orphans.length ? `${orphans.length} sitemap ${pl(orphans.length, 'page')} ${orphans.length > 1 ? 'are' : 'is'} not linked from anywhere on the site.` : 'Every sitemap page is linked from the site.', orphans));
    }
    checks.push(agg('sitemap-errors', errors.length ? 'fail' : 'pass', errors.length, norm.size,
      errors.length ? `${errors.length} of ${norm.size} sitemap URLs redirect or return errors.` : `All ${norm.size} sitemap URLs checked are live.`, errors));
  }

  // ---------- Score ----------
  let total = 0;
  let got = 0;
  for (const c of checks) {
    if (c.status === 'info') continue;
    const w = SEVERITY_WEIGHT[c.severity] || 2;
    const ratio = c.applicable ? Math.max(0, 1 - c.affected / c.applicable) : (c.status === 'pass' ? 1 : 0);
    total += w;
    got += w * ratio;
  }
  const score = total ? Math.round((got / total) * 100) : 0;
  const count = (sev) => checks.filter((c) => c.status === 'fail' && c.severity === sev).length;

  const pages = analyzed.map((a) => {
    const fails = a.results.filter((r) => r.status === 'fail' && !SITE_LEVEL.has(r.id) && r.id !== 'indexable');
    return {
      url: a.url, depth: a.depth, score: a.score, title: a.info.title.slice(0, 120), words: a.info.wordCount, ttfb: a.info.ttfb,
      noindex: a.info.noindex, critical: fails.filter((r) => r.severity === 'critical').length,
      warning: fails.filter((r) => r.severity === 'warning').length, notice: fails.filter((r) => r.severity === 'notice').length,
      issues: fails.map((r) => r.id),
    };
  }).sort((x, y) => x.score - y.score);
  const errorPages = [...records.values()].filter((r) => !r.redirectTo && r.status !== 200).map((r) => ({ url: r.url, status: r.status, error: r.error || '' })).slice(0, 300);

  return {
    startUrl,
    origin,
    score,
    stopReason,
    durationSec: Math.round((Date.now() - started) / 1000),
    summary: { critical: count('critical'), warning: count('warning'), notice: count('notice'), passed: checks.filter((c) => c.status === 'pass').length, total: checks.length },
    stats: {
      crawled: fetched,
      analyzed: analyzed.length,
      skippedRobots,
      redirects: [...records.values()].filter((r) => r.redirectTo).length,
      errors: errorPages.length,
      noindex: analyzed.filter((a) => a.info.noindex).length,
      avgTtfb: Math.round(analyzed.reduce((s, a) => s + (a.info.ttfb || 0), 0) / analyzed.length),
      avgWords: Math.round(analyzed.reduce((s, a) => s + (a.info.wordCount || 0), 0) / analyzed.length),
      sitemapUrls: norm.size,
      brokenLinks: brokenUrls.length,
    },
    checks,
    pages,
    errorPages,
  };
}
