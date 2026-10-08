// Single-page SEO audit engine. Reuses the crawler's SSRF-safe networking.
import { load } from 'cheerio';
import { assertPublicHost, safeFetch, readLimited, loadRobots, normalize, validateStartUrl } from './sitemap-crawler';
import { CHECKS, scoreChecks } from './seo-checks';

const UA = 'CraftoraSEOAudit/1.0 (+https://craftora.dev/seo-audit)';
const MAX_HTML = 3 * 1024 * 1024;
const TIMEOUT = 15000;

export { validateStartUrl };

// Fetch the page itself, following redirects manually so each hop is SSRF-checked.
async function fetchPage(url) {
  const chain = [];
  let current = url;
  for (let hop = 0; hop <= 6; hop++) {
    const u = new URL(current);
    if (!['http:', 'https:'].includes(u.protocol)) throw new Error('The page redirects to an unsupported address.');
    if (u.port && !['80', '443'].includes(u.port)) throw new Error('The page redirects to a non-standard port.');
    try { await assertPublicHost(u.hostname); } catch { throw new Error('The page redirects to a private or unreachable address.'); }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
    const t0 = Date.now();
    let res;
    try {
      res = await fetch(current, {
        redirect: 'manual',
        signal: ctrl.signal,
        headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5', 'Accept-Encoding': 'gzip, deflate, br' },
      });
    } catch (e) {
      clearTimeout(timer);
      throw new Error(e.name === 'AbortError' ? 'The website took too long to respond (15 seconds).' : 'Could not connect to the website.');
    }
    const ttfb = Date.now() - t0;
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      clearTimeout(timer);
      try { await res.body?.cancel(); } catch {}
      chain.push({ url: current, status: res.status });
      current = new URL(res.headers.get('location'), current).href;
      continue;
    }
    const headers = Object.fromEntries([...res.headers.entries()].map(([k, v]) => [k.toLowerCase(), v]));
    let html = '';
    try {
      if (/html|xhtml/i.test(headers['content-type'] || '')) html = await readLimited(res, MAX_HTML);
      else { try { await res.body?.cancel(); } catch {} }
    } finally { clearTimeout(timer); }
    const total = Date.now() - t0;
    return { finalUrl: current, status: res.status, headers, html, ttfb, total, chain };
  }
  throw new Error('Too many redirects.');
}

async function fetchSmallText(url) {
  const res = await safeFetch(url, { wantBody: false });
  if (res.status !== 200) return { status: res.status, text: '' };
  // safeFetch skips non-HTML bodies, so read text files directly
  try {
    const u = new URL(res.finalUrl);
    await assertPublicHost(u.hostname);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(res.finalUrl, { signal: ctrl.signal, redirect: 'manual', headers: { 'User-Agent': UA } });
    const text = r.status === 200 ? await readLimited(r, 512 * 1024) : '';
    clearTimeout(timer);
    return { status: r.status, text };
  } catch { return { status: 0, text: '' }; }
}

function wordsOf(text) {
  return (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []);
}

async function checkLinks(links, deadlineMs) {
  const start = Date.now();
  const out = [];
  let i = 0;
  const worker = async () => {
    while (i < links.length) {
      if (Date.now() - start > deadlineMs) return;
      const link = links[i++];
      const r = await safeFetch(link.url, { wantBody: false });
      out.push({ ...link, status: r.status, error: r.error || '' });
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  return out;
}

export async function auditPage(inputUrl, { keyword = '' } = {}) {
  const startUrl = await validateStartUrl(inputUrl);
  const page = await fetchPage(startUrl);
  const finalU = new URL(page.finalUrl);
  const origin = finalU.origin;
  const results = [];
  let title = '', description = '', canonical = '', lang = '', og = {}, headings = [], wordCount = 0, imgs = [], noAlt = [];
  let uniqueInternal = [], uniqueExternal = [], schemaTypes = new Set(), htmlKb = 0, enc = '', keywordStats = null;
  const add = (id, status, message, details) => {
    const c = CHECKS[id];
    results.push({ id, category: c.category, severity: c.severity, title: c.title, status, message, details: details && details.length ? details.slice(0, 50) : undefined, fix: c.fix, tools: c.tools });
  };

  const isHtml = /html|xhtml/i.test(page.headers['content-type'] || '');
  add('status-ok', page.status === 200 ? 'pass' : 'fail', page.status === 200 ? 'The page returns 200 OK.' : `The page returns status ${page.status}.`);
  if (!isHtml || !page.html) {
    if (page.status === 200) throw new Error('This URL did not return an HTML page, so it cannot be audited.');
    return finalize();
  }

  const $ = load(page.html);
  const html = page.html;

  // ---------- Meta ----------
  const titles = $('title').filter((_, el) => !$(el).parents('svg').length).toArray().map((el) => $(el).text().replace(/\s+/g, ' ').trim()).filter(Boolean);
  title = titles[0] || '';
  add('title-present', title ? 'pass' : 'fail', title ? `Title found: "${title}"` : 'No <title> tag found.');
  if (title) {
    const n = title.length;
    add('title-length', n >= 30 && n <= 60 ? 'pass' : 'fail',
      n < 30 ? `The title is ${n} characters. Aim for 30 to 60.` : n > 60 ? `The title is ${n} characters and may be cut off. Aim for 30 to 60.` : `The title is ${n} characters.`,
      titles.length > 1 ? [`${titles.length} title tags found. Keep only one.`] : undefined);
  }

  description = ($('meta[name="description" i]').attr('content') || '').replace(/\s+/g, ' ').trim();
  add('meta-description-present', description ? 'pass' : 'fail', description ? `Meta description found (${description.length} characters).` : 'No meta description found.');
  if (description) {
    const n = description.length;
    add('meta-description-length', n >= 70 && n <= 160 ? 'pass' : 'fail',
      n < 70 ? `The description is ${n} characters. Aim for 70 to 160.` : n > 160 ? `The description is ${n} characters and may be cut off. Aim for 70 to 160.` : `The description is ${n} characters.`);
  }

  const canonicalRaw = $('link[rel="canonical" i]').attr('href') || '';
  try { if (canonicalRaw) canonical = normalize(new URL(canonicalRaw, page.finalUrl).href); } catch {}
  add('canonical-present', canonical ? 'pass' : 'fail', canonical ? `Canonical: ${canonical}` : 'No canonical tag found.');
  if (canonical) {
    let self = false;
    try { self = canonical === normalize(page.finalUrl); } catch {}
    add('canonical-self', self ? 'pass' : 'fail', self ? 'The canonical points to this page.' : `The canonical points to a different URL: ${canonical}`);
  }

  const robotsMeta = ($('meta[name="robots" i]').attr('content') || '') + ' ' + ($('meta[name="googlebot" i]').attr('content') || '');
  const xRobots = page.headers['x-robots-tag'] || '';
  const noindex = /noindex|none/i.test(robotsMeta) || /noindex|none/i.test(xRobots);
  add('indexable', noindex ? 'fail' : 'pass', noindex ? `The page is set to noindex (${/noindex|none/i.test(xRobots) ? 'X-Robots-Tag header' : 'robots meta tag'}). Google will not show it.` : 'No noindex directive found.');

  const viewport = $('meta[name="viewport" i]').attr('content') || '';
  add('viewport', /width\s*=\s*device-width/i.test(viewport) ? 'pass' : 'fail', viewport ? (/width\s*=\s*device-width/i.test(viewport) ? 'Mobile viewport is set.' : `Viewport is set but missing width=device-width: "${viewport}"`) : 'No viewport meta tag found.');

  lang = $('html').attr('lang') || '';
  add('lang', lang ? 'pass' : 'fail', lang ? `Language: ${lang}` : 'The <html> tag has no lang attribute.');

  const charset = $('meta[charset]').length > 0 || /charset=/i.test($('meta[http-equiv="content-type" i]').attr('content') || '') || /charset=/i.test(page.headers['content-type'] || '');
  add('charset', charset ? 'pass' : 'fail', charset ? 'Character encoding is declared.' : 'No character encoding declared.');

  og = {
    title: $('meta[property="og:title"]').attr('content') || '',
    description: $('meta[property="og:description"]').attr('content') || '',
    image: $('meta[property="og:image"]').attr('content') || '',
    url: $('meta[property="og:url"]').attr('content') || '',
  };
  if (og.image) { try { og.image = new URL(og.image, page.finalUrl).href; } catch {} }
  const ogMissing = ['title', 'description', 'image'].filter((k) => !og[k]).map((k) => `og:${k}`);
  add('og-tags', ogMissing.length ? 'fail' : 'pass', ogMissing.length ? `Missing: ${ogMissing.join(', ')}` : 'og:title, og:description, and og:image are set.');

  const twitterCard = $('meta[name="twitter:card" i]').attr('content') || '';
  add('twitter-card', twitterCard ? 'pass' : 'fail', twitterCard ? `Twitter card: ${twitterCard}` : 'No twitter:card tag found.');

  let hasFavicon = $('link[rel~="icon" i], link[rel="shortcut icon" i], link[rel="apple-touch-icon" i]').length > 0;
  if (!hasFavicon) {
    const r = await safeFetch(origin + '/favicon.ico', { wantBody: false });
    hasFavicon = r.status === 200;
  }
  add('favicon', hasFavicon ? 'pass' : 'fail', hasFavicon ? 'Favicon found.' : 'No favicon found.');

  add('doctype', /^\s*(<!--[\s\S]*?-->\s*)*<!doctype html/i.test(html) ? 'pass' : 'fail', /^\s*(<!--[\s\S]*?-->\s*)*<!doctype html/i.test(html) ? 'HTML5 doctype found.' : 'No <!DOCTYPE html> at the top of the page.');

  // ---------- Content ----------
  headings = $('h1, h2, h3, h4, h5, h6').toArray().map((el) => ({ level: Number(el.tagName.slice(1)), text: $(el).text().replace(/\s+/g, ' ').trim().slice(0, 150) }));
  const h1s = headings.filter((h) => h.level === 1);
  add('h1-present', h1s.length ? 'pass' : 'fail', h1s.length ? `H1: "${h1s[0].text}"` : 'No H1 heading found.');
  if (h1s.length) add('h1-single', h1s.length === 1 ? 'pass' : 'fail', h1s.length === 1 ? 'Exactly one H1.' : `${h1s.length} H1 headings found.`, h1s.length > 1 ? h1s.map((h) => h.text) : undefined);
  const skips = [];
  for (let k = 1; k < headings.length; k++) {
    if (headings[k].level > headings[k - 1].level + 1) skips.push(`H${headings[k - 1].level} to H${headings[k].level}: "${headings[k].text}"`);
  }
  if (headings.length) add('heading-order', skips.length ? 'fail' : 'pass', skips.length ? `${skips.length} skipped heading level${skips.length > 1 ? 's' : ''}.` : 'Headings follow a logical order.', skips);

  const $text = load(html);
  $text('script, style, noscript, svg, template, iframe').remove();
  const bodyText = $text('body').text().replace(/\s+/g, ' ').trim();
  const words = wordsOf(bodyText);
  wordCount = words.length;
  add('word-count', wordCount >= 300 ? 'pass' : 'fail', `${wordCount} words of visible text.`);

  imgs = $('img').toArray().map((el) => {
    const $el = $(el);
    let src = $el.attr('src') || $el.attr('data-src') || '';
    try { if (src && !src.startsWith('data:')) src = new URL(src, page.finalUrl).href; } catch {}
    return { src, alt: $el.attr('alt'), width: $el.attr('width'), height: $el.attr('height') };
  });
  noAlt = imgs.filter((i) => i.alt === undefined);
  if (imgs.length) {
    add('img-alt', noAlt.length ? 'fail' : 'pass', noAlt.length ? `${noAlt.length} of ${imgs.length} images have no alt attribute.` : `All ${imgs.length} images have alt attributes.`, noAlt.map((i) => i.src || '(inline image)'));
    const noDim = imgs.filter((i) => !i.width || !i.height);
    add('img-dimensions', noDim.length ? 'fail' : 'pass', noDim.length ? `${noDim.length} of ${imgs.length} images are missing width or height.` : 'All images have width and height.', noDim.map((i) => i.src || '(inline image)'));
  }

  // ---------- Technical ----------
  add('https', finalU.protocol === 'https:' ? 'pass' : 'fail', finalU.protocol === 'https:' ? 'The page is served over HTTPS.' : 'The page is served over plain HTTP.');
  const hops = page.chain.length;
  add('redirects', hops <= 1 ? 'pass' : 'fail', hops === 0 ? 'No redirects.' : hops === 1 ? `1 redirect: ${page.chain[0].url} (${page.chain[0].status})` : `${hops} redirects before reaching the page.`, page.chain.map((c) => `${c.status}  ${c.url}`));
  add('response-time', page.ttfb <= 800 ? 'pass' : 'fail', `Server responded in ${page.ttfb} ms${page.ttfb > 800 ? '. Aim for under 800 ms.' : '.'}`);
  htmlKb = Math.round(Buffer.byteLength(html) / 1024);
  add('html-size', htmlKb <= 500 ? 'pass' : 'fail', `HTML size is ${htmlKb} KB.`);
  enc = page.headers['content-encoding'] || '';
  add('compression', enc ? 'pass' : (htmlKb < 2 ? 'pass' : 'fail'), enc ? `Compressed with ${enc}.` : htmlKb < 2 ? 'Page is too small to need compression.' : 'The HTML is not compressed (no gzip or Brotli).');

  const robots = await fetchSmallText(origin + '/robots.txt');
  add('robots-txt', robots.status === 200 ? 'pass' : 'fail', robots.status === 200 ? 'robots.txt found.' : 'No robots.txt file found.');
  let allowed = true;
  try { const fn = await loadRobots(origin); allowed = fn(finalU.pathname + finalU.search); } catch {}
  add('robots-allowed', allowed ? 'pass' : 'fail', allowed ? 'robots.txt allows crawling this page.' : 'robots.txt blocks this page from being crawled.');

  const sitemapUrls = [...robots.text.matchAll(/^\s*sitemap:\s*(\S+)/gim)].map((m) => m[1]);
  let sitemapFound = '';
  for (const cand of [...sitemapUrls.slice(0, 2), origin + '/sitemap.xml', origin + '/sitemap_index.xml']) {
    let abs;
    try { abs = new URL(cand, origin).href; } catch { continue; }
    const r = await fetchSmallText(abs);
    if (r.status === 200 && /<(urlset|sitemapindex)/i.test(r.text)) { sitemapFound = abs; break; }
  }
  add('sitemap', sitemapFound ? 'pass' : 'fail', sitemapFound ? `Sitemap found: ${sitemapFound}${sitemapUrls.length ? '' : ' (not listed in robots.txt)'}` : 'No XML sitemap found at /sitemap.xml or in robots.txt.');

  let schemaInvalid = 0;
  const collectTypes = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(collectTypes);
    if (node['@type']) [].concat(node['@type']).forEach((t) => schemaTypes.add(String(t)));
    if (node['@graph']) collectTypes(node['@graph']);
  };
  const ldBlocks = $('script[type="application/ld+json" i]').toArray();
  for (const el of ldBlocks) {
    try { collectTypes(JSON.parse($(el).contents().text())); } catch { schemaInvalid++; }
  }
  const microdata = $('[itemtype]').length;
  add('structured-data', ldBlocks.length || microdata ? 'pass' : 'fail',
    schemaTypes.size ? `Schema types found: ${[...schemaTypes].join(', ')}` : ldBlocks.length || microdata ? 'Structured data found.' : 'No structured data (JSON-LD or microdata) found.');
  if (ldBlocks.length) add('structured-data-valid', schemaInvalid ? 'fail' : 'pass', schemaInvalid ? `${schemaInvalid} of ${ldBlocks.length} JSON-LD blocks could not be parsed.` : `All ${ldBlocks.length} JSON-LD blocks are valid JSON.`);

  if (finalU.protocol === 'https:') {
    const mixed = [];
    $('script[src], link[rel="stylesheet" i][href], img[src], iframe[src], video[src], audio[src], source[src]').each((_, el) => {
      const v = $(el).attr('src') || $(el).attr('href') || '';
      if (/^http:\/\//i.test(v)) mixed.push(v);
    });
    add('mixed-content', mixed.length ? 'fail' : 'pass', mixed.length ? `${mixed.length} resources load over insecure http://.` : 'All resources load over HTTPS.', mixed);
    add('hsts', page.headers['strict-transport-security'] ? 'pass' : 'fail', page.headers['strict-transport-security'] ? 'HSTS header is set.' : 'No Strict-Transport-Security header.');
  }

  const urlIssues = [];
  if (page.finalUrl.length > 115) urlIssues.push(`URL is ${page.finalUrl.length} characters long.`);
  if (/[A-Z]/.test(finalU.pathname)) urlIssues.push('URL contains uppercase letters.');
  if (/_/.test(finalU.pathname)) urlIssues.push('URL uses underscores instead of hyphens.');
  if ([...finalU.searchParams.keys()].length > 2) urlIssues.push('URL has many query parameters.');
  add('url-friendly', urlIssues.length ? 'fail' : 'pass', urlIssues.length ? urlIssues[0] : 'The URL is short and readable.', urlIssues);

  const scripts = $('script[src]').length;
  const styles = $('link[rel="stylesheet" i]').length;
  add('resource-count', scripts <= 25 && styles <= 10 ? 'pass' : 'fail', `${scripts} external scripts and ${styles} stylesheets.`);

  // ---------- Links ----------
  const anchors = $('a[href]').toArray().map((el) => {
    const $el = $(el);
    const href = ($el.attr('href') || '').trim();
    const text = ($el.text() || $el.attr('aria-label') || $el.find('img').attr('alt') || '').replace(/\s+/g, ' ').trim();
    return { href, text, rel: ($el.attr('rel') || '').toLowerCase() };
  });
  const linkMap = new Map();
  const internal = [];
  const external = [];
  const generic = [];
  const nofollowInternal = [];
  for (const a of anchors) {
    if (!a.href || /^(#|javascript:|mailto:|tel:|sms:|data:)/i.test(a.href)) continue;
    let abs;
    try { abs = normalize(new URL(a.href, page.finalUrl).href); } catch { continue; }
    if (!/^https?:/i.test(abs)) continue;
    const isInternal = new URL(abs).hostname.replace(/^www\./, '') === finalU.hostname.replace(/^www\./, '');
    (isInternal ? internal : external).push(abs);
    if (!a.text) generic.push(`(empty anchor) ${abs}`);
    else if (/^(click here|here|read more|more|learn more|link|this|go)$/i.test(a.text)) generic.push(`"${a.text}" ${abs}`);
    if (isInternal && a.rel.includes('nofollow')) nofollowInternal.push(abs);
    if (!linkMap.has(abs)) linkMap.set(abs, { url: abs, text: a.text.slice(0, 80), internal: isInternal });
  }
  uniqueInternal = [...linkMap.values()].filter((l) => l.internal);
  uniqueExternal = [...linkMap.values()].filter((l) => !l.internal);
  add('internal-links', uniqueInternal.length ? 'pass' : 'fail', `${uniqueInternal.length} unique internal links, ${uniqueExternal.length} external.`);
  add('link-count', anchors.length <= 300 ? 'pass' : 'fail', `${anchors.length} links on the page.`);
  add('anchor-text', generic.length ? 'fail' : 'pass', generic.length ? `${generic.length} links have empty or generic anchor text.` : 'Link anchor text is descriptive.', generic);
  if (uniqueInternal.length) add('nofollow-internal', nofollowInternal.length ? 'fail' : 'pass', nofollowInternal.length ? `${nofollowInternal.length} internal link${nofollowInternal.length > 1 ? "s use" : " uses"} rel="nofollow".` : 'No internal links use nofollow.', [...new Set(nofollowInternal)]);

  const toCheck = [...uniqueInternal.slice(0, 40), ...uniqueExternal.slice(0, 20)];
  const checked = await checkLinks(toCheck, 25000);
  const broken = checked.filter((l) => l.status === 404 || l.status === 410 || l.status >= 500 || (l.status === 0 && /resolvable|connect/i.test(l.error) && l.internal));
  add('broken-links', broken.length ? 'fail' : 'pass',
    broken.length ? `${broken.length} broken link${broken.length > 1 ? 's' : ''} found (checked ${checked.length} of ${linkMap.size}).` : `No broken links found (checked ${checked.length} of ${linkMap.size}).`,
    broken.map((b) => `${b.status || b.error}  ${b.url}`));

  // ---------- Target keyword ----------
  const kw = String(keyword || '').trim().toLowerCase().slice(0, 80);
  if (kw) {
    const has = (s) => String(s || '').toLowerCase().includes(kw);
    const slugKw = kw.replace(/[^\p{L}\p{N}]+/gu, '-');
    add('kw-title', has(title) ? 'pass' : 'fail', has(title) ? 'The title contains the keyword.' : 'The title does not contain the keyword.');
    add('kw-description', has(description) ? 'pass' : 'fail', has(description) ? 'The meta description contains the keyword.' : 'The meta description does not contain the keyword.');
    add('kw-h1', h1s.some((h) => has(h.text)) ? 'pass' : 'fail', h1s.some((h) => has(h.text)) ? 'The H1 contains the keyword.' : 'The H1 does not contain the keyword.');
    add('kw-url', decodeURIComponent(finalU.pathname).toLowerCase().includes(slugKw) ? 'pass' : 'fail', decodeURIComponent(finalU.pathname).toLowerCase().includes(slugKw) ? 'The URL contains the keyword.' : 'The URL does not contain the keyword.');
    const intro = words.slice(0, 100).join(' ').toLowerCase();
    add('kw-intro', intro.includes(kw) ? 'pass' : 'fail', intro.includes(kw) ? 'The keyword appears in the first 100 words.' : 'The keyword does not appear in the first 100 words.');
    const kwWords = wordsOf(kw).length || 1;
    const occurrences = (bodyText.toLowerCase().match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    keywordStats = { keyword: kw, occurrences, density: wordCount ? Math.round(((occurrences * kwWords) / wordCount) * 1000) / 10 : 0 };
  }

  return finalize();

  function finalize() {
    const score = scoreChecks(results);
    const count = (sev) => results.filter((r) => r.status === 'fail' && r.severity === sev).length;
    return {
      url: startUrl,
      finalUrl: page.finalUrl,
      auditedAt: new Date().toISOString(),
      score,
      summary: {
        critical: count('critical'),
        warning: count('warning'),
        notice: count('notice'),
        passed: results.filter((r) => r.status === 'pass').length,
        total: results.length,
      },
      checks: results,
      page: page.html ? {
        status: page.status, title, description, canonical, lang, og,
        headings: headings.slice(0, 120), wordCount,
        images: imgs.length, imagesNoAlt: noAlt.length,
        internalLinks: uniqueInternal.length, externalLinks: uniqueExternal.length,
        schemaTypes: [...schemaTypes], ttfb: page.ttfb, loadMs: page.total,
        htmlKb, compression: enc, keyword: keywordStats,
      } : { status: page.status, ttfb: page.ttfb },
    };
  }
}
