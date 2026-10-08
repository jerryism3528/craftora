// Catalog of SEO audit checks. Shared by the audit engine, the report UI,
// and (later) the /seo-audit/checks/[id] fix-guide pages.

export const CATEGORIES = {
  meta: 'Meta Tags',
  content: 'Content',
  technical: 'Technical',
  links: 'Links',
  keyword: 'Target Keyword',
};

export const SEVERITY_WEIGHT = { critical: 10, warning: 5, notice: 2 };

export const CHECKS = {
  // ---------- Meta ----------
  'title-present': {
    category: 'meta', severity: 'critical', title: 'Title tag',
    fix: 'Add a unique <title> tag inside <head> that describes the page and includes its main keyword.',
    tools: ['meta-tag-generator', 'serp-snippet-preview'],
  },
  'title-length': {
    category: 'meta', severity: 'warning', title: 'Title length',
    fix: 'Keep titles between 30 and 60 characters so Google shows them in full. Put the main keyword near the start.',
    tools: ['serp-snippet-preview', 'meta-tag-generator'],
  },
  'meta-description-present': {
    category: 'meta', severity: 'warning', title: 'Meta description',
    fix: 'Add <meta name="description" content="..."> with a clear summary that makes people want to click.',
    tools: ['meta-tag-generator', 'serp-snippet-preview'],
  },
  'meta-description-length': {
    category: 'meta', severity: 'notice', title: 'Meta description length',
    fix: 'Aim for 70 to 160 characters. Shorter descriptions waste space, longer ones get cut off in search results.',
    tools: ['serp-snippet-preview'],
  },
  'canonical-present': {
    category: 'meta', severity: 'warning', title: 'Canonical tag',
    fix: 'Add <link rel="canonical" href="https://yoursite.com/page"> pointing to the preferred URL of this page to prevent duplicate content.',
    tools: ['meta-tag-generator'],
  },
  'canonical-self': {
    category: 'meta', severity: 'notice', title: 'Canonical points to this page',
    fix: 'If this page should rank by itself, its canonical tag should point to its own URL. Point it elsewhere only for true duplicates.',
    tools: ['meta-tag-generator'],
  },
  indexable: {
    category: 'meta', severity: 'critical', title: 'Page can be indexed',
    fix: 'Remove "noindex" from the robots meta tag or the X-Robots-Tag header if you want this page to appear in Google.',
    tools: ['meta-tag-generator'],
  },
  viewport: {
    category: 'meta', severity: 'critical', title: 'Mobile viewport',
    fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> so the page displays correctly on phones. Google indexes the mobile version first.',
    tools: ['meta-tag-generator'],
  },
  lang: {
    category: 'meta', severity: 'notice', title: 'Language attribute',
    fix: 'Add a lang attribute to the <html> tag, for example <html lang="en">, so search engines and screen readers know the page language.',
    tools: [],
  },
  charset: {
    category: 'meta', severity: 'notice', title: 'Character encoding',
    fix: 'Add <meta charset="utf-8"> as the first tag inside <head> to avoid broken characters.',
    tools: ['meta-tag-generator'],
  },
  'og-tags': {
    category: 'meta', severity: 'notice', title: 'Open Graph tags',
    fix: 'Add og:title, og:description, and og:image tags so links to this page look good when shared on Facebook, LinkedIn, and WhatsApp.',
    tools: ['open-graph-generator'],
  },
  'twitter-card': {
    category: 'meta', severity: 'notice', title: 'Twitter (X) card',
    fix: 'Add <meta name="twitter:card" content="summary_large_image"> so shares on X show a large preview image.',
    tools: ['open-graph-generator'],
  },
  favicon: {
    category: 'meta', severity: 'notice', title: 'Favicon',
    fix: 'Add a favicon with <link rel="icon" href="/favicon.ico">. Google shows it next to your result on mobile.',
    tools: ['favicon-generator'],
  },
  doctype: {
    category: 'meta', severity: 'notice', title: 'HTML doctype',
    fix: 'Start the page with <!DOCTYPE html> so browsers render it in standards mode.',
    tools: [],
  },

  // ---------- Content ----------
  'h1-present': {
    category: 'content', severity: 'warning', title: 'H1 heading',
    fix: 'Add one <h1> heading that states the main topic of the page and includes its main keyword.',
    tools: [],
  },
  'h1-single': {
    category: 'content', severity: 'notice', title: 'Single H1',
    fix: 'Use one H1 per page for the main title, and H2 to H6 for sections below it.',
    tools: [],
  },
  'heading-order': {
    category: 'content', severity: 'notice', title: 'Heading structure',
    fix: 'Do not skip heading levels (for example H2 straight to H4). A clean outline helps search engines understand your content.',
    tools: [],
  },
  'word-count': {
    category: 'content', severity: 'warning', title: 'Content length',
    fix: 'Pages with fewer than 300 words are often seen as thin content. Add useful detail, examples, and FAQs that answer what searchers want.',
    tools: ['word-counter'],
  },
  'img-alt': {
    category: 'content', severity: 'warning', title: 'Image alt text',
    fix: 'Add a short, descriptive alt attribute to every meaningful image. It helps accessibility and image search rankings.',
    tools: ['compress-image'],
  },
  'img-dimensions': {
    category: 'content', severity: 'notice', title: 'Image width and height',
    fix: 'Set width and height attributes on images so the browser reserves space and the layout does not jump while loading (CLS).',
    tools: ['resize-image', 'compress-image'],
  },

  // ---------- Technical ----------
  https: {
    category: 'technical', severity: 'critical', title: 'HTTPS',
    fix: 'Serve the site over HTTPS with a valid SSL certificate and redirect all HTTP traffic to HTTPS. Google uses HTTPS as a ranking signal.',
    tools: [],
  },
  'status-ok': {
    category: 'technical', severity: 'critical', title: 'HTTP status',
    fix: 'The page should return status 200. Fix server errors, or redirect removed pages to a relevant live page.',
    tools: [],
  },
  redirects: {
    category: 'technical', severity: 'notice', title: 'Redirect chain',
    fix: 'Link directly to the final URL. Each extra redirect slows the page and wastes crawl budget.',
    tools: [],
  },
  'response-time': {
    category: 'technical', severity: 'warning', title: 'Server response time',
    fix: 'Aim for under 800 ms. Use caching, a CDN, faster hosting, and fewer database queries per page.',
    tools: [],
  },
  'html-size': {
    category: 'technical', severity: 'notice', title: 'HTML size',
    fix: 'Keep HTML under 500 KB. Remove inline data, unused markup, and large embedded scripts or styles.',
    tools: [],
  },
  compression: {
    category: 'technical', severity: 'warning', title: 'Text compression',
    fix: 'Enable gzip or Brotli compression on your server. It usually shrinks HTML, CSS, and JS by 70% or more.',
    tools: [],
  },
  'robots-txt': {
    category: 'technical', severity: 'notice', title: 'robots.txt file',
    fix: 'Add a robots.txt file at the root of your site that allows crawling and lists your sitemap.',
    tools: ['robots-txt-generator'],
  },
  'robots-allowed': {
    category: 'technical', severity: 'critical', title: 'Allowed by robots.txt',
    fix: 'Your robots.txt blocks this page. Remove or narrow the Disallow rule if you want it in search results.',
    tools: ['robots-txt-generator'],
  },
  sitemap: {
    category: 'technical', severity: 'warning', title: 'XML sitemap',
    fix: 'Create a sitemap.xml, upload it to your site root, list it in robots.txt, and submit it in Google Search Console.',
    tools: ['sitemap-generator'],
  },
  'structured-data': {
    category: 'technical', severity: 'notice', title: 'Structured data',
    fix: 'Add JSON-LD schema (Organization, Article, Product, FAQ, and so on) to become eligible for rich results in Google.',
    tools: ['schema-generator'],
  },
  'structured-data-valid': {
    category: 'technical', severity: 'warning', title: 'Valid JSON-LD',
    fix: 'One of your JSON-LD blocks is not valid JSON, so search engines ignore it. Fix the syntax (commas, quotes, brackets).',
    tools: ['schema-generator', 'json-formatter'],
  },
  'mixed-content': {
    category: 'technical', severity: 'warning', title: 'Mixed content',
    fix: 'Load every script, stylesheet, image, and iframe over https://. Browsers block or warn about http:// files on secure pages.',
    tools: [],
  },
  hsts: {
    category: 'technical', severity: 'notice', title: 'HSTS header',
    fix: 'Send the Strict-Transport-Security header so browsers always use HTTPS for your domain.',
    tools: [],
  },
  'url-friendly': {
    category: 'technical', severity: 'notice', title: 'SEO-friendly URL',
    fix: 'Use short, lowercase URLs with hyphens between words, and avoid underscores and long query strings.',
    tools: ['text-to-slug'],
  },
  'resource-count': {
    category: 'technical', severity: 'notice', title: 'Number of scripts and stylesheets',
    fix: 'Combine or remove unused scripts and stylesheets. Fewer requests means a faster page.',
    tools: [],
  },

  // ---------- Links ----------
  'broken-links': {
    category: 'links', severity: 'warning', title: 'Broken links',
    fix: 'Update or remove links that return 404 or server errors. Broken links hurt user experience and waste crawl budget.',
    tools: ['sitemap-generator'],
  },
  'internal-links': {
    category: 'links', severity: 'notice', title: 'Internal links',
    fix: 'Link to related pages on your own site. Internal links help Google discover pages and pass authority between them.',
    tools: [],
  },
  'link-count': {
    category: 'links', severity: 'notice', title: 'Number of links',
    fix: 'Keep links on a page under 300. Too many links dilute their value and can look spammy.',
    tools: [],
  },
  'anchor-text': {
    category: 'links', severity: 'notice', title: 'Descriptive anchor text',
    fix: 'Replace empty or generic anchors like "click here" or "read more" with words that describe the target page.',
    tools: [],
  },
  'nofollow-internal': {
    category: 'links', severity: 'notice', title: 'Nofollow on internal links',
    fix: 'Remove rel="nofollow" from links to your own pages so link authority flows through your site.',
    tools: [],
  },

  // ---------- Target keyword (only when a keyword is entered) ----------
  'kw-title': {
    category: 'keyword', severity: 'warning', title: 'Keyword in title',
    fix: 'Include the target keyword in the title tag, ideally near the start.',
    tools: ['serp-snippet-preview'],
  },
  'kw-description': {
    category: 'keyword', severity: 'notice', title: 'Keyword in meta description',
    fix: 'Use the target keyword in the meta description. Google bolds matching words in search results.',
    tools: ['serp-snippet-preview'],
  },
  'kw-h1': {
    category: 'keyword', severity: 'notice', title: 'Keyword in H1',
    fix: 'Include the target keyword in the main H1 heading.',
    tools: [],
  },
  'kw-url': {
    category: 'keyword', severity: 'notice', title: 'Keyword in URL',
    fix: 'Use the keyword in the URL slug, separated by hyphens.',
    tools: ['text-to-slug'],
  },
  'kw-intro': {
    category: 'keyword', severity: 'notice', title: 'Keyword in first paragraph',
    fix: 'Mention the target keyword within the first 100 words of the content.',
    tools: [],
  },
};

export function scoreChecks(results) {
  let total = 0;
  let got = 0;
  for (const r of results) {
    if (r.status === 'info') continue;
    const w = SEVERITY_WEIGHT[r.severity] || 2;
    total += w;
    if (r.status === 'pass') got += w;
  }
  return total ? Math.round((got / total) * 100) : 0;
}
