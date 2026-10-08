// Sitemap crawler: same-host BFS crawl with SSRF protection and robots.txt support.
import { promises as dns } from 'dns';
import net from 'net';

export const MAX_PAGES = 500;
const CONCURRENCY = 5;
const FETCH_TIMEOUT = 10000;
const MAX_HTML_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const CRAWL_DEADLINE = 4 * 60 * 1000;
const UA = 'CraftoraSitemapBot/1.0 (+https://craftora.dev/sitemap-generator)';

const SKIP_EXT = /\.(jpe?g|png|gif|webp|svg|ico|bmp|tiff?|avif|heic|pdf|zip|rar|7z|gz|tgz|tar|bz2|mp3|mp4|m4a|m4v|wav|ogg|oga|webm|mov|avi|mkv|flv|wmv|css|js|mjs|json|xml|rss|atom|txt|woff2?|ttf|eot|otf|docx?|xlsx?|pptx?|odt|ods|csv|exe|msi|dmg|apk|iso|bin)$/i;

// ---------- SSRF guard ----------
function isPrivateV4(ip) {
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true;
  const [a, b] = p;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 192 && b === 0 && p[2] === 0) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a >= 224) return true;
  return false;
}

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) return isPrivateV4(ip);
  const v = ip.toLowerCase();
  if (v === '::' || v === '::1') return true;
  const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateV4(mapped[1]);
  if (/^f[cd]/.test(v)) return true;
  if (/^fe[89ab]/.test(v)) return true;
  if (v.startsWith('ff')) return true;
  return false;
}

const hostCache = new Map();
async function assertPublicHost(hostname) {
  const host = hostname.replace(/^\[|\]$/g, '');
  if (hostCache.has(host)) {
    if (!hostCache.get(host)) throw new Error('blocked');
    return;
  }
  let ok = true;
  if (net.isIP(host)) {
    ok = !isPrivateIp(host);
  } else {
    if (!host.includes('.') || /\.(local|internal|localhost)$/i.test(host) || host === 'localhost') ok = false;
    else {
      const addrs = await dns.lookup(host, { all: true });
      if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) ok = false;
    }
  }
  if (hostCache.size > 500) hostCache.clear();
  hostCache.set(host, ok);
  if (!ok) throw new Error('blocked');
}

export async function validateStartUrl(input) {
  let raw = String(input || '').trim();
  if (!raw) throw new Error('Please enter a website URL.');
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
  let u;
  try { u = new URL(raw); } catch { throw new Error('That does not look like a valid URL.'); }
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Only http and https websites can be crawled.');
  if (u.port && !['80', '443'].includes(u.port)) throw new Error('Only standard ports (80 and 443) are supported.');
  if (u.username || u.password) throw new Error('URLs with login details are not supported.');
  try { await assertPublicHost(u.hostname); } catch (e) {
    if (e.message === 'blocked') throw new Error('This address is private or not reachable from the public internet.');
    throw new Error('Could not find that website. Check the domain name.');
  }
  return normalize(u.href);
}

// ---------- fetching ----------
async function safeFetch(url, { wantBody = true, signal } = {}) {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const u = new URL(current);
    if (!['http:', 'https:'].includes(u.protocol)) return { status: 0, error: 'Unsupported protocol', finalUrl: current };
    if (u.port && !['80', '443'].includes(u.port)) return { status: 0, error: 'Non-standard port', finalUrl: current };
    try { await assertPublicHost(u.hostname); } catch { return { status: 0, error: 'Blocked or unresolvable host', finalUrl: current }; }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT);
    const onAbort = () => ctrl.abort();
    signal?.addEventListener('abort', onAbort);
    try {
      const res = await fetch(current, {
        redirect: 'manual',
        signal: ctrl.signal,
        headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5' },
      });
      if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
        try { await res.body?.cancel(); } catch {}
        current = new URL(res.headers.get('location'), current).href;
        continue;
      }
      const contentType = res.headers.get('content-type') || '';
      const lastModified = res.headers.get('last-modified') || '';
      let body = '';
      if (wantBody && res.ok && /html|xhtml/i.test(contentType)) {
        body = await readLimited(res, MAX_HTML_BYTES);
      } else {
        try { await res.body?.cancel(); } catch {}
      }
      return { status: res.status, finalUrl: current, contentType, lastModified, body, redirected: hop > 0 };
    } catch (e) {
      return { status: 0, error: e.name === 'AbortError' ? 'Timed out' : 'Could not connect', finalUrl: current };
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  }
  return { status: 0, error: 'Too many redirects', finalUrl: current };
}

async function readLimited(res, max) {
  const reader = res.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    chunks.push(value);
    if (size >= max) { try { await reader.cancel(); } catch {} break; }
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf8');
}

// ---------- robots.txt ----------
function ruleToRegex(path) {
  const anchored = path.endsWith('$');
  const body = (anchored ? path.slice(0, -1) : path)
    .replace(/[.+?^{}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  return new RegExp('^' + body + (anchored ? '$' : ''));
}

async function loadRobots(origin, signal) {
  let full = '';
  try { full = await safeFetchText(origin + '/robots.txt', signal); } catch { full = ''; }
  if (!full) return () => true;
  const groups = { mine: [], star: [] };
  let agents = [];
  let lastWasAgent = false;
  for (const rawLine of full.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, '').trim();
    if (!line) continue;
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const val = line.slice(idx + 1).trim();
    if (key === 'user-agent') {
      if (!lastWasAgent) agents = [];
      agents.push(val.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (key !== 'allow' && key !== 'disallow') continue;
    if (key === 'disallow' && !val) continue;
    const rule = { allow: key === 'allow', len: val.length, re: ruleToRegex(val) };
    if (agents.some((a) => a.includes('craftorasitemapbot'))) groups.mine.push(rule);
    else if (agents.includes('*')) groups.star.push(rule);
  }
  const rules = groups.mine.length ? groups.mine : groups.star;
  return (pathWithQuery) => {
    let best = null;
    for (const r of rules) {
      if (r.re.test(pathWithQuery)) {
        if (!best || r.len > best.len || (r.len === best.len && r.allow)) best = r;
      }
    }
    return !best || best.allow;
  };
}

async function safeFetchText(url, signal) {
  // robots.txt is text/plain, so read it directly (capped at 500 KB)
  const u = new URL(url);
  await assertPublicHost(u.hostname);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT);
  signal?.addEventListener('abort', () => ctrl.abort());
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: 'manual', headers: { 'User-Agent': UA } });
    if (res.status !== 200) return '';
    return await readLimited(res, 500 * 1024);
  } catch { return ''; } finally { clearTimeout(timer); }
}

// ---------- HTML parsing ----------
function decodeEntities(s) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      try { return String.fromCodePoint(code); } catch { return m; }
    }
    return named[e.toLowerCase()] ?? m;
  });
}

function parseHtml(html) {
  const head = html.slice(0, 200000);
  const titleM = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleM ? decodeEntities(titleM[1].replace(/\s+/g, ' ').trim()).slice(0, 200) : '';

  let noindex = false;
  let nofollow = false;
  for (const m of head.matchAll(/<meta\s[^>]*>/gi)) {
    const tag = m[0];
    if (/name\s*=\s*["']?(robots|craftorasitemapbot)["']?/i.test(tag)) {
      const c = (tag.match(/content\s*=\s*["']([^"']*)["']/i) || [])[1] || '';
      if (/noindex|none/i.test(c)) noindex = true;
      if (/nofollow|none/i.test(c)) nofollow = true;
    }
  }

  let canonical = '';
  for (const m of head.matchAll(/<link\s[^>]*>/gi)) {
    const tag = m[0];
    if (/rel\s*=\s*["']?canonical["']?/i.test(tag)) {
      canonical = decodeEntities((tag.match(/href\s*=\s*["']([^"']+)["']/i) || [])[1] || '');
      break;
    }
  }

  const baseM = head.match(/<base\s[^>]*href\s*=\s*["']([^"']+)["']/i);
  const base = baseM ? decodeEntities(baseM[1]) : '';

  const links = [];
  if (!nofollow) {
    for (const m of html.matchAll(/<a\s[^>]*?href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>/gi)) {
      const tag = m[0];
      if (/rel\s*=\s*["'][^"']*nofollow/i.test(tag)) continue;
      const href = decodeEntities((m[1] ?? m[2] ?? m[3] ?? '').trim());
      if (href) links.push(href);
    }
  }
  return { title, noindex, canonical, base, links };
}

export function normalize(href) {
  const u = new URL(href);
  u.hash = '';
  u.hostname = u.hostname.toLowerCase();
  if ((u.protocol === 'https:' && u.port === '443') || (u.protocol === 'http:' && u.port === '80')) u.port = '';
  for (const k of [...u.searchParams.keys()]) {
    if (/^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$|ref$)/i.test(k)) u.searchParams.delete(k);
  }
  if (!u.pathname) u.pathname = '/';
  return u.href;
}

// ---------- crawl ----------
export async function crawlSite(startUrl, { onEvent = () => {}, signal } = {}) {
  const started = Date.now();
  const start = new URL(startUrl);

  // Follow the homepage redirect first (http to https, bare to www, etc.)
  const first = await safeFetch(startUrl, { wantBody: false, signal });
  if (first.status === 0) throw new Error(`Could not reach the website (${first.error}).`);
  const root = new URL(first.finalUrl);
  if (root.hostname.replace(/^www\./, '') !== start.hostname.replace(/^www\./, '')) {
    throw new Error(`The website redirects to a different domain (${root.hostname}). Try crawling that domain instead.`);
  }
  const host = root.host;
  const origin = root.origin;

  const allowed = await loadRobots(origin, signal);
  onEvent({ type: 'start', origin });

  const seen = new Set();
  const queue = [];
  const pages = [];
  const broken = [];
  let fetched = 0;
  let skippedRobots = 0;
  let skippedNoindex = 0;
  let stopReason = '';

  const enqueue = (url, depth, from) => {
    let n;
    try { n = normalize(url); } catch { return; }
    const u = new URL(n);
    if (!['http:', 'https:'].includes(u.protocol)) return;
    if (u.host !== host) return;
    if (SKIP_EXT.test(u.pathname)) return;
    if (seen.has(n)) return;
    if (seen.size >= MAX_PAGES * 3) return;
    if (!allowed(u.pathname + u.search)) { seen.add(n); skippedRobots++; return; }
    seen.add(n);
    queue.push({ url: n, depth, from });
  };

  enqueue(root.href, 0, '');

  const worker = async () => {
    while (true) {
      if (signal?.aborted) { stopReason = 'cancelled'; return; }
      if (Date.now() - started > CRAWL_DEADLINE) { stopReason = 'time'; return; }
      if (fetched >= MAX_PAGES) { if (queue.length) stopReason = 'limit'; return; }
      const item = queue.shift();
      if (!item) {
        // wait briefly in case other workers add links
        if (active === 0) return;
        await new Promise((r) => setTimeout(r, 150));
        continue;
      }
      active++;
      fetched++;
      try {
        const res = await safeFetch(item.url, { signal });
        if (res.status === 0 || res.status >= 400) {
          broken.push({ url: item.url, status: res.status, error: res.error || '', from: item.from });
        } else if (res.status === 200 && /html|xhtml/i.test(res.contentType)) {
          let finalUrl = item.url;
          try { finalUrl = normalize(res.finalUrl); } catch {}
          const finalU = new URL(finalUrl);
          if (finalU.host === host) {
            if (res.redirected) seen.add(finalUrl);
            const info = parseHtml(res.body);
            const baseHref = info.base ? new URL(info.base, finalUrl).href : finalUrl;
            let canonicalOther = '';
            if (info.canonical) {
              try {
                const c = normalize(new URL(info.canonical, finalUrl).href);
                if (c !== finalUrl) canonicalOther = c;
              } catch {}
            }
            if (info.noindex) skippedNoindex++;
            else if (canonicalOther) enqueue(canonicalOther, item.depth, finalUrl);
            else if (!pages.some((p) => p.url === finalUrl)) {
              let lastmod = '';
              if (res.lastModified) {
                const d = new Date(res.lastModified);
                if (!Number.isNaN(d.getTime())) lastmod = d.toISOString().slice(0, 10);
              }
              pages.push({ url: finalUrl, depth: item.depth, title: info.title, lastmod });
            }
            for (const href of info.links) {
              try { enqueue(new URL(href, baseHref).href, item.depth + 1, finalUrl); } catch {}
            }
          }
        }
      } finally {
        active--;
      }
      onEvent({ type: 'progress', crawled: fetched, found: pages.length, queued: queue.length, broken: broken.length, current: item.url });
    }
  };

  let active = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  pages.sort((a, b) => a.depth - b.depth || a.url.localeCompare(b.url));
  return {
    origin,
    pages,
    broken,
    stats: { crawled: fetched, skippedRobots, skippedNoindex, seconds: Math.round((Date.now() - started) / 1000) },
    stopReason,
  };
}
