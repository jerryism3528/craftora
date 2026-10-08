// Long-form "how to fix" content for every SEO audit check.
// Powers /seo-audit/checks (index) and /seo-audit/checks/[slug] (guide pages).

export const GUIDES = {
  // ---------- Meta ----------
  'title-present': {
    slug: 'missing-title-tag',
    name: 'Missing Title Tag',
    what: 'The title tag is the HTML element that sets the clickable headline of your page in Google search results and the text shown on the browser tab. A page without a <title> tag forces Google to invent one from your content.',
    why: 'The title is one of the strongest on-page ranking signals and the first thing searchers read. A missing title usually means lower rankings and fewer clicks, because the auto-generated headline rarely matches what people search for.',
    steps: [
      'Open the HTML template or CMS settings for the page.',
      'Add one <title> tag inside the <head> section.',
      'Write a unique title of 30 to 60 characters that describes the page and starts with its main keyword.',
      'Add your brand at the end, separated by a pipe or colon, if there is room.',
      'Re-run the SEO audit to confirm the title is detected.',
    ],
    example: '<head>\n  <title>Used Bikes for Sale in Lahore | BikeMarket</title>\n</head>',
    faqs: [
      ['Where does the title tag go?', 'Inside the <head> section of the HTML, usually near the top, before any scripts.'],
      ['Is the title tag the same as the H1?', 'No. The title appears in search results and the browser tab, while the H1 is the main heading visible on the page. They can be similar, but both should exist.'],
    ],
  },
  'title-length': {
    slug: 'title-tag-length',
    name: 'Title Tag Too Long or Too Short',
    what: 'Google shows roughly 50 to 60 characters of a title before cutting it off with an ellipsis. Very short titles waste valuable space that could describe the page.',
    why: 'Truncated titles hide important words, and short titles miss keywords and context. Both lower your click-through rate from search results.',
    steps: [
      'Aim for 30 to 60 characters.',
      'Put the main keyword near the beginning so it is never cut off.',
      'Remove filler words like "Welcome to" or "Home page of".',
      'Preview the result in a SERP preview tool before publishing.',
    ],
    example: 'Too long: Welcome to Our Amazing Website Where You Can Buy and Sell All Kinds of Used Bikes\nBetter:   Buy and Sell Used Bikes Online | BikeMarket',
    faqs: [
      ['Is 60 characters a strict limit?', 'No. Google measures pixel width (about 600 px), so wide letters take more space. 60 characters is a safe target.'],
      ['Will a long title hurt rankings?', 'Not directly, but the cut-off part is not visible to searchers, which usually lowers clicks.'],
    ],
  },
  'meta-description-present': {
    slug: 'missing-meta-description',
    name: 'Missing Meta Description',
    what: 'The meta description is a short summary in the page HTML that Google often shows under your title in search results.',
    why: 'Without one, Google picks a random snippet from the page, which is often a menu item or a cookie notice. A good description works like an ad and increases clicks.',
    steps: [
      'Add <meta name="description" content="..."> inside the <head> section.',
      'Write 70 to 160 characters that summarize the page and include the main keyword.',
      'End with a reason to click, such as "Free, no signup" or "Compare prices today".',
      'Make every page description unique.',
    ],
    example: '<meta name="description" content="Compare used bike prices in Lahore. Buy Honda, Yamaha, and Suzuki motorcycles from verified sellers. Free to browse.">',
    faqs: [
      ['Does the meta description affect rankings?', 'Not directly, but it strongly affects click-through rate, which helps your traffic.'],
      ['Why does Google show different text than my description?', 'Google sometimes rewrites descriptions to match the search query. A clear, relevant description is used more often.'],
    ],
  },
  'meta-description-length': {
    slug: 'meta-description-length',
    name: 'Meta Description Too Long or Too Short',
    what: 'Google shows about 150 to 160 characters of a meta description on desktop and less on mobile.',
    why: 'Long descriptions get cut off mid-sentence, and short ones waste space that could convince searchers to click.',
    steps: [
      'Keep descriptions between 70 and 160 characters.',
      'Put the most important information and keyword first.',
      'Cut repeated words and long lists.',
      'Check the result in a SERP snippet preview.',
    ],
    example: 'Too long (204 chars): Craftora is a free online tools suite: merge PDF, compress images, convert files, verify emails, run SEO audits, and more. Privacy-first, no signup, no watermarks, works on every device.\nBetter (148 chars): Free online tools to merge PDFs, compress images, convert files, verify emails, and audit SEO. No signup, no watermarks.',
    faqs: [
      ['Is there a penalty for long descriptions?', 'No penalty, but the end of the text is hidden, so put key details first.'],
      ['Should mobile descriptions be shorter?', 'Mobile shows about 120 characters, so keep the core message within the first 120.'],
    ],
  },
  'canonical-present': {
    slug: 'missing-canonical-tag',
    name: 'Missing Canonical Tag',
    what: 'A canonical tag tells search engines which URL is the main version of a page. It matters when the same content is reachable at several addresses, such as with or without www, tracking parameters, or sorting options.',
    why: 'Without it, Google may split ranking signals across duplicate URLs or index the wrong version.',
    steps: [
      'Add <link rel="canonical" href="..."> inside <head>.',
      'Use the full absolute URL of the preferred version, including https://.',
      'Point each page to itself unless it is a true duplicate of another page.',
      'Make sure the canonical URL returns 200 and is not blocked by robots.txt.',
    ],
    example: '<link rel="canonical" href="https://example.com/used-bikes/honda-cg-125">',
    faqs: [
      ['Do I need a canonical tag on every page?', 'It is best practice. A self-referencing canonical protects against duplicates created by parameters and tracking links.'],
      ['Is a canonical the same as a redirect?', 'No. A redirect sends visitors to another URL, while a canonical is a hint only for search engines.'],
    ],
  },
  'canonical-self': {
    slug: 'canonical-points-to-another-page',
    name: 'Canonical Points to a Different Page',
    what: 'The canonical tag on this page names a different URL as the main version.',
    why: 'Google usually follows the canonical and indexes the other URL instead, so this page will not rank by itself. That is correct for duplicates but a mistake for unique pages.',
    steps: [
      'Decide if this page is a duplicate of the canonical target.',
      'If it is unique, change the canonical to the page\'s own URL.',
      'If it is a duplicate, keep the canonical and consider removing internal links to it.',
      'Check that CMS plugins are not setting a wrong canonical (a common cause is the homepage URL on every page).',
    ],
    example: 'Page: https://example.com/blog/post-a\nWrong: <link rel="canonical" href="https://example.com/">\nRight: <link rel="canonical" href="https://example.com/blog/post-a">',
    faqs: [
      ['Why would a canonical point elsewhere by mistake?', 'Templates and plugins often hard-code one URL, such as the homepage, for every page.'],
      ['Can Google ignore my canonical?', 'Yes. It is a strong hint, not a command, but Google follows it most of the time.'],
    ],
  },
  indexable: {
    slug: 'page-blocked-by-noindex',
    name: 'Page Blocked by Noindex',
    what: 'A noindex directive in the robots meta tag or the X-Robots-Tag HTTP header tells search engines not to show the page in results.',
    why: 'A noindex page cannot rank at all. It is useful for private, thank-you, or filter pages, but a disaster when left on important pages after a site launch.',
    steps: [
      'Search the page source for <meta name="robots" content="noindex">.',
      'Check server or CDN settings for an X-Robots-Tag: noindex header.',
      'In WordPress, check Settings > Reading > "Discourage search engines" and your SEO plugin settings for the page.',
      'Remove noindex, then request indexing in Google Search Console.',
    ],
    example: 'Remove: <meta name="robots" content="noindex, nofollow">\nUse:    <meta name="robots" content="index, follow">  (or no robots tag at all)',
    faqs: [
      ['How long until a page appears after removing noindex?', 'Usually days to a few weeks. Requesting indexing in Search Console speeds it up.'],
      ['Is noindex the same as robots.txt Disallow?', 'No. Disallow stops crawling, while noindex stops indexing. Google must be able to crawl a page to see its noindex tag.'],
    ],
  },
  viewport: {
    slug: 'missing-viewport-meta-tag',
    name: 'Missing Mobile Viewport Tag',
    what: 'The viewport meta tag tells phones to render the page at the device width instead of a zoomed-out desktop layout.',
    why: 'Google indexes the mobile version of your site first. Without a viewport tag, the page is not mobile-friendly, which hurts rankings and makes text tiny on phones.',
    steps: [
      'Add the viewport tag inside <head>.',
      'Use width=device-width and initial-scale=1.',
      'Do not disable zooming with user-scalable=no, as it hurts accessibility.',
      'Test the page on a real phone after the change.',
    ],
    example: '<meta name="viewport" content="width=device-width, initial-scale=1">',
    faqs: [
      ['Does every page need the viewport tag?', 'Yes, every page that should work on mobile.'],
      ['Is a viewport tag enough to be mobile-friendly?', 'It is required, but your CSS must also be responsive.'],
    ],
  },
  lang: {
    slug: 'missing-html-lang-attribute',
    name: 'Missing HTML Lang Attribute',
    what: 'The lang attribute on the <html> tag declares the language of the page, for example lang="en" or lang="ur".',
    why: 'It helps search engines serve the page to the right audience, lets browsers offer translation, and tells screen readers how to pronounce the text.',
    steps: [
      'Open the main layout or template file.',
      'Add lang="xx" to the <html> tag using the ISO language code.',
      'Add a region if needed, for example en-US or en-GB.',
    ],
    example: '<html lang="en">',
    faqs: [
      ['Is lang the same as hreflang?', 'No. lang describes the current page, while hreflang links to translated versions of it.'],
      ['Does lang affect rankings?', 'Indirectly. It improves accessibility and helps Google understand the page language.'],
    ],
  },
  charset: {
    slug: 'missing-charset-declaration',
    name: 'Missing Character Encoding',
    what: 'The character encoding tells the browser how to turn bytes into letters. UTF-8 supports every language.',
    why: 'Without it, browsers can show broken characters (like Ã© instead of é), which looks unprofessional and can confuse search engines.',
    steps: [
      'Add <meta charset="utf-8"> as the very first tag inside <head>.',
      'Make sure your files and database are saved as UTF-8.',
      'Optionally send Content-Type: text/html; charset=utf-8 from the server.',
    ],
    example: '<head>\n  <meta charset="utf-8">\n  ...\n</head>',
    faqs: [
      ['Should charset be first in the head?', 'Yes. It must appear within the first 1024 bytes of the page.'],
      ['Which encoding should I use?', 'UTF-8. It is the web standard and supports all languages.'],
    ],
  },
  'og-tags': {
    slug: 'missing-open-graph-tags',
    name: 'Missing Open Graph Tags',
    what: 'Open Graph tags (og:title, og:description, og:image) control how your page looks when shared on Facebook, LinkedIn, WhatsApp, and many chat apps.',
    why: 'Without them, shares show a plain link or a random image. A large preview image and clear title get far more clicks from social traffic.',
    steps: [
      'Add og:title, og:description, og:image, og:url, and og:type inside <head>.',
      'Use a 1200 x 630 pixel image under 5 MB.',
      'Use an absolute URL for og:image.',
      'Test the preview with a link-sharing debugger.',
    ],
    example: '<meta property="og:title" content="Free Online Tools | Craftora">\n<meta property="og:description" content="Merge PDFs, compress images, and more. Free.">\n<meta property="og:image" content="https://example.com/og-image.png">\n<meta property="og:url" content="https://example.com/">\n<meta property="og:type" content="website">',
    faqs: [
      ['Do Open Graph tags help SEO?', 'Not as a direct ranking factor, but better shares bring more visitors and more links.'],
      ['What size should og:image be?', '1200 x 630 pixels (1.91:1 ratio) works on almost every platform.'],
    ],
  },
  'twitter-card': {
    slug: 'missing-twitter-card',
    name: 'Missing Twitter (X) Card',
    what: 'The twitter:card meta tag tells X (Twitter) which preview style to use when your link is shared.',
    why: 'With summary_large_image, posts show a large image that attracts more clicks than a plain link.',
    steps: [
      'Add <meta name="twitter:card" content="summary_large_image">.',
      'X falls back to your Open Graph title, description, and image, so set those too.',
      'Optionally add twitter:site with your X handle.',
    ],
    example: '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:site" content="@yourbrand">',
    faqs: [
      ['Do I need separate Twitter title and image tags?', 'No. X uses the Open Graph tags if Twitter-specific ones are missing.'],
      ['Which card type should I use?', 'summary_large_image for most pages, summary for small square images.'],
    ],
  },
  favicon: {
    slug: 'missing-favicon',
    name: 'Missing Favicon',
    what: 'A favicon is the small icon shown on browser tabs, bookmarks, and next to your site name in Google mobile results.',
    why: 'A missing favicon looks unfinished and makes your result less recognizable in search, which can lower clicks.',
    steps: [
      'Create a square icon (at least 48 x 48 pixels, ideally SVG or 192 x 192 PNG).',
      'Upload it to your site and link it in <head>.',
      'Also add an apple-touch-icon for iPhone home screens.',
    ],
    example: '<link rel="icon" href="/favicon.ico" sizes="any">\n<link rel="icon" href="/icon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    faqs: [
      ['What size should a favicon be for Google?', 'A multiple of 48 x 48 pixels, such as 48, 96, or 144.'],
      ['How long until Google shows my favicon?', 'It can take a few days to weeks after Google recrawls your homepage.'],
    ],
  },
  doctype: {
    slug: 'missing-html-doctype',
    name: 'Missing HTML Doctype',
    what: 'The <!DOCTYPE html> line at the very top tells browsers the page uses modern HTML5.',
    why: 'Without it, browsers switch to "quirks mode" and may render the layout incorrectly.',
    steps: [
      'Open the main layout template.',
      'Add <!DOCTYPE html> as the very first line, before <html>.',
    ],
    example: '<!DOCTYPE html>\n<html lang="en">',
    faqs: [
      ['Does the doctype affect rankings?', 'Not directly, but a broken layout can hurt user experience and mobile usability.'],
      ['Is the doctype case-sensitive?', 'No. <!doctype html> and <!DOCTYPE html> both work.'],
    ],
  },

  // ---------- Content ----------
  'h1-present': {
    slug: 'missing-h1-heading',
    name: 'Missing H1 Heading',
    what: 'The H1 is the main visible heading of a page. It tells visitors and search engines what the page is about.',
    why: 'Google uses headings to understand the topic of a page. A page without an H1 loses a clear relevance signal and is harder to scan.',
    steps: [
      'Add one <h1> near the top of the main content.',
      'Make it describe the page topic and include the main keyword.',
      'Do not use the logo as the H1 on every page.',
    ],
    example: '<h1>Used Honda CG 125 Bikes for Sale in Lahore</h1>',
    faqs: [
      ['Can the H1 be the same as the title tag?', 'Yes. They can match or be slightly different versions of the same topic.'],
      ['Does the H1 have to be at the top?', 'It should be the first main heading in the content, usually near the top.'],
    ],
  },
  'h1-single': {
    slug: 'multiple-h1-headings',
    name: 'Multiple H1 Headings',
    what: 'The page has more than one H1 heading.',
    why: 'Multiple H1s blur the main topic of the page. Google can handle them, but one clear H1 with H2 sections is easier for both search engines and readers.',
    steps: [
      'Keep the H1 that best describes the whole page.',
      'Change the other H1s to H2 or H3.',
      'Check templates: logos, sidebars, and footers often use H1 by mistake.',
    ],
    example: 'Before: <h1>Logo</h1> ... <h1>Page title</h1> ... <h1>Newsletter</h1>\nAfter:  <div>Logo</div> ... <h1>Page title</h1> ... <h2>Newsletter</h2>',
    faqs: [
      ['Is having multiple H1s a penalty?', 'No penalty, but a single H1 is clearer and is the widely recommended practice.'],
      ['What about H1s inside separate sections?', 'HTML5 allows it, but most SEO tools and guides still recommend one H1 per page.'],
    ],
  },
  'heading-order': {
    slug: 'skipped-heading-levels',
    name: 'Skipped Heading Levels',
    what: 'Headings jump levels, for example from H2 straight to H4.',
    why: 'Headings form an outline of the page. Skipped levels make the structure harder for search engines and screen readers to understand.',
    steps: [
      'Use H1 for the page title, H2 for main sections, H3 for sub-sections, and so on.',
      'Never pick a heading level just for its font size. Style headings with CSS instead.',
      'Check the heading outline in the audit report after changes.',
    ],
    example: 'Wrong: H1 > H2 > H4\nRight: H1 > H2 > H3',
    faqs: [
      ['Is this a big ranking factor?', 'It is minor, but a clean structure improves accessibility and helps featured snippets.'],
      ['Can I go back up from H4 to H2?', 'Yes. Going up any number of levels is fine. Only skipping levels on the way down is a problem.'],
    ],
  },
  'word-count': {
    slug: 'thin-content-low-word-count',
    name: 'Thin Content (Low Word Count)',
    what: 'The page has fewer than 300 words of visible text.',
    why: 'Pages with very little text often fail to answer the searcher\'s question and can be seen as thin content, which rarely ranks for competitive keywords.',
    steps: [
      'Check what the top-ranking pages for your keyword cover.',
      'Add useful sections: explanations, steps, examples, comparisons, and FAQs.',
      'Write for the reader, not a word count. Remove filler.',
      'For tool or product pages, add a how-it-works section and FAQs below the tool.',
    ],
    faqs: [
      ['Is there a minimum word count for Google?', 'No official minimum. 300 words is a practical floor for most informational pages.'],
      ['Does more content always rank better?', 'No. Content should be as long as needed to fully answer the query, and no longer.'],
    ],
  },
  'img-alt': {
    slug: 'images-missing-alt-text',
    name: 'Images Missing Alt Text',
    what: 'Alt text is a short description in the alt attribute of an <img> tag. It is read by screen readers and used by search engines to understand images.',
    why: 'Images without alt text are invisible to blind users and to Google Image search, and you lose a place to add relevant keywords naturally.',
    steps: [
      'Add an alt attribute to every <img>.',
      'Describe what the image shows in a short phrase, including keywords only where natural.',
      'Use alt="" (empty) for purely decorative images so screen readers skip them.',
    ],
    example: '<img src="/honda-cg125-red.jpg" alt="Red Honda CG 125 motorcycle, 2024 model">',
    faqs: [
      ['How long should alt text be?', 'Usually under 125 characters. One clear sentence or phrase is enough.'],
      ['Should I stuff keywords into alt text?', 'No. Describe the image honestly. Keyword stuffing can hurt.'],
    ],
  },
  'img-dimensions': {
    slug: 'images-missing-width-height',
    name: 'Images Missing Width and Height',
    what: 'Images have no width and height attributes, so the browser does not know how much space to reserve before they load.',
    why: 'The layout jumps when images appear, which hurts the Cumulative Layout Shift (CLS) score, part of Google\'s Core Web Vitals.',
    steps: [
      'Add width and height attributes with the image\'s real pixel size.',
      'Keep images responsive in CSS with max-width: 100%; height: auto;.',
      'Resize and compress large images before uploading.',
    ],
    example: '<img src="/hero.webp" width="1200" height="630" alt="..." style="max-width:100%;height:auto">',
    faqs: [
      ['Will fixed sizes break my responsive layout?', 'No. With height: auto in CSS, the browser keeps the ratio and scales the image.'],
      ['What is a good CLS score?', 'Below 0.1 is considered good by Google.'],
    ],
  },

  // ---------- Technical ----------
  https: {
    slug: 'site-not-using-https',
    name: 'Site Not Using HTTPS',
    what: 'The page loads over plain HTTP instead of encrypted HTTPS.',
    why: 'HTTPS is a confirmed Google ranking signal, and browsers mark HTTP pages as "Not secure", which scares visitors away.',
    steps: [
      'Install an SSL certificate. Most hosts offer free Let\'s Encrypt certificates.',
      'Redirect all HTTP URLs to HTTPS with a 301 redirect.',
      'Update internal links, canonicals, and sitemap URLs to https://.',
      'Add the https:// version of the site in Google Search Console.',
    ],
    faqs: [
      ['Is an SSL certificate expensive?', 'No. Let\'s Encrypt certificates are free and renew automatically.'],
      ['Will moving to HTTPS lose rankings?', 'Not if you use 301 redirects. Rankings usually stay the same or improve.'],
    ],
  },
  'status-ok': {
    slug: 'page-returns-error-status',
    name: 'Page Returns an Error Status',
    what: 'The page did not return HTTP status 200 OK. Common errors are 404 (not found), 410 (gone), and 500 (server error).',
    why: 'Pages that return errors cannot rank, and links pointing to them waste authority and frustrate visitors.',
    steps: [
      'If the page moved, add a 301 redirect to the new URL.',
      'If it was deleted, redirect to the most relevant live page or let it return 404 and remove links to it.',
      'For 5xx errors, check server logs, memory limits, and plugins.',
    ],
    faqs: [
      ['Are 404 errors bad for SEO?', 'A few are normal. They become a problem when important pages or many internal links return 404.'],
      ['Should I redirect every 404 to the homepage?', 'No. Redirect to a relevant page. Mass redirects to the homepage are treated as soft 404s.'],
    ],
  },
  redirects: {
    slug: 'redirect-chain',
    name: 'Redirect Chain',
    what: 'The URL redirects more than once before reaching the final page, for example http to https to www to the final path.',
    why: 'Each hop adds delay, and long chains waste crawl budget. Google may stop following after several hops.',
    steps: [
      'Find the final URL in the chain.',
      'Update redirect rules so every old URL goes to the final URL in one step.',
      'Update internal links to point directly to the final URL.',
    ],
    example: 'Before: http://example.com/page > https://example.com/page > https://www.example.com/page\nAfter:  http://example.com/page > https://www.example.com/page',
    faqs: [
      ['How many redirects are too many?', 'Aim for one. Google follows up to 10, but every hop costs time.'],
      ['Do redirects lose link value?', 'Modern 301 and 308 redirects pass full value, but chains still slow crawling.'],
    ],
  },
  'response-time': {
    slug: 'slow-server-response-time',
    name: 'Slow Server Response Time',
    what: 'Time to first byte (TTFB) is how long the server takes to start sending the page. Over 800 ms is considered slow.',
    why: 'A slow server delays everything else on the page, hurting Core Web Vitals, user experience, and how many pages Google crawls.',
    steps: [
      'Enable page caching (a caching plugin, Redis, or a static build).',
      'Use a CDN to serve content close to visitors.',
      'Reduce slow database queries and heavy plugins.',
      'Upgrade to faster hosting if the server is overloaded.',
    ],
    faqs: [
      ['What is a good TTFB?', 'Under 200 ms is excellent, under 800 ms is acceptable.'],
      ['Does TTFB vary by location?', 'Yes. Visitors far from the server see slower times, which a CDN fixes.'],
    ],
  },
  'html-size': {
    slug: 'html-page-too-large',
    name: 'HTML Page Too Large',
    what: 'The HTML document is larger than 500 KB.',
    why: 'Large HTML takes longer to download and parse, especially on mobile networks. Google also stops reading HTML after about 15 MB.',
    steps: [
      'Move inline CSS and JavaScript into external files.',
      'Remove large embedded data, such as base64 images or big JSON blobs.',
      'Paginate very long lists.',
      'Enable gzip or Brotli compression.',
    ],
    faqs: [
      ['Do images count toward HTML size?', 'Only if embedded as base64 inside the HTML. Normal image files are separate.'],
      ['What is a typical HTML size?', 'Most well-built pages are 30 to 150 KB uncompressed.'],
    ],
  },
  compression: {
    slug: 'text-compression-not-enabled',
    name: 'Text Compression Not Enabled',
    what: 'The server sends HTML without gzip or Brotli compression.',
    why: 'Compression usually shrinks text files by 70% or more, making pages load much faster on every connection.',
    steps: [
      'Enable gzip or Brotli in your web server (Nginx gzip on;, Apache mod_deflate, or your CDN settings).',
      'Compress HTML, CSS, JavaScript, JSON, SVG, and XML.',
      'Re-run the audit to confirm the Content-Encoding header.',
    ],
    example: '# Nginx\ngzip on;\ngzip_types text/html text/css application/javascript application/json image/svg+xml;',
    faqs: [
      ['Gzip or Brotli?', 'Brotli compresses better and is supported by all modern browsers. Gzip is a fine fallback.'],
      ['Should I compress images too?', 'Images are already compressed formats. Optimize them separately instead.'],
    ],
  },
  'robots-txt': {
    slug: 'missing-robots-txt',
    name: 'Missing robots.txt File',
    what: 'robots.txt is a text file at the root of your domain that tells crawlers which areas they may visit and where your sitemap is.',
    why: 'It is not required, but it is the standard place to list your sitemap and to keep crawlers out of admin, search, and cart pages.',
    steps: [
      'Create a file named robots.txt in your site root.',
      'Allow crawling of public pages and block private areas.',
      'Add a Sitemap: line with the full sitemap URL.',
      'Test it at yourdomain.com/robots.txt.',
    ],
    example: 'User-agent: *\nDisallow: /admin/\nDisallow: /cart\n\nSitemap: https://example.com/sitemap.xml',
    faqs: [
      ['Can robots.txt remove pages from Google?', 'No. It blocks crawling, not indexing. Use noindex to remove pages from results.'],
      ['Where must robots.txt be?', 'At the root of the domain, for example https://example.com/robots.txt.'],
    ],
  },
  'robots-allowed': {
    slug: 'page-blocked-by-robots-txt',
    name: 'Page Blocked by robots.txt',
    what: 'A Disallow rule in robots.txt stops search engines from crawling this page.',
    why: 'Google cannot read blocked pages, so they rank poorly or show without a description. Important pages should never be blocked.',
    steps: [
      'Open yoursite.com/robots.txt and find the Disallow rule that matches this URL.',
      'Remove or narrow the rule, for example Disallow: /private/ instead of Disallow: /.',
      'Test the URL with the robots.txt report in Google Search Console.',
    ],
    example: 'Blocks everything:  Disallow: /\nBlocks only admin:  Disallow: /admin/',
    faqs: [
      ['Why is my whole site blocked?', 'A leftover "Disallow: /" from development is the most common cause.'],
      ['How fast does Google see robots.txt changes?', 'Google usually refreshes robots.txt within 24 hours.'],
    ],
  },
  sitemap: {
    slug: 'missing-xml-sitemap',
    name: 'Missing XML Sitemap',
    what: 'An XML sitemap lists the URLs on your site that you want search engines to discover and index.',
    why: 'Sitemaps help Google find new and deep pages faster, especially on new sites with few backlinks.',
    steps: [
      'Generate a sitemap.xml with your CMS, a plugin, or a sitemap generator.',
      'Upload it to your site root so it opens at /sitemap.xml.',
      'Add a Sitemap: line to robots.txt.',
      'Submit it in Google Search Console under Sitemaps.',
    ],
    example: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://example.com/</loc></url>\n</urlset>',
    faqs: [
      ['How many URLs can a sitemap hold?', 'Up to 50,000 URLs or 50 MB. Larger sites use a sitemap index file.'],
      ['Should every page be in the sitemap?', 'Only pages you want indexed: live, canonical pages that return 200.'],
    ],
  },
  'structured-data': {
    slug: 'missing-structured-data',
    name: 'Missing Structured Data',
    what: 'Structured data (usually JSON-LD schema) describes your content in a format search engines understand. Common types are Organization, Article, Product, FAQ, and LocalBusiness.',
    why: 'It makes pages eligible for rich results like star ratings, FAQs, prices, and breadcrumbs, which stand out and get more clicks. AI search tools also use it.',
    steps: [
      'Choose the schema type that matches the page.',
      'Generate JSON-LD with a schema generator.',
      'Add it inside a <script type="application/ld+json"> tag.',
      'Validate it with Google\'s Rich Results Test.',
    ],
    example: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Craftora",\n  "url": "https://craftora.dev"\n}\n</script>',
    faqs: [
      ['Does schema improve rankings?', 'Not directly, but rich results improve click-through rate and visibility.'],
      ['JSON-LD or microdata?', 'Google recommends JSON-LD because it is easier to add and maintain.'],
    ],
  },
  'structured-data-valid': {
    slug: 'invalid-json-ld',
    name: 'Invalid JSON-LD Structured Data',
    what: 'A JSON-LD block on the page is not valid JSON, so it cannot be read.',
    why: 'Search engines silently ignore broken structured data, so you lose all rich result eligibility from that block.',
    steps: [
      'Copy the JSON-LD block into a JSON formatter to find the error.',
      'Common mistakes: trailing commas, single quotes, unescaped quotes inside text, and missing brackets.',
      'Re-test with Google\'s Rich Results Test.',
    ],
    example: 'Wrong: { "name": "Craftora", }\nRight: { "name": "Craftora" }',
    faqs: [
      ['Why did my schema break?', 'Usually a CMS field containing quotes or line breaks was inserted without escaping.'],
      ['Will Google warn me?', 'Search Console reports some errors, but invalid JSON is often just ignored.'],
    ],
  },
  'mixed-content': {
    slug: 'mixed-content-https',
    name: 'Mixed Content on HTTPS Page',
    what: 'A secure HTTPS page loads scripts, styles, images, or iframes over insecure http://.',
    why: 'Browsers block insecure scripts and warn about insecure images, which can break the page and remove the secure padlock.',
    steps: [
      'Find every http:// resource listed in the audit.',
      'Change them to https://, or use relative URLs.',
      'Update hard-coded URLs in your database or theme settings.',
    ],
    faqs: [
      ['Does mixed content affect SEO?', 'Indirectly. Broken pages and security warnings hurt user experience and trust.'],
      ['What if a resource has no HTTPS version?', 'Host it yourself or replace it with a provider that supports HTTPS.'],
    ],
  },
  hsts: {
    slug: 'missing-hsts-header',
    name: 'Missing HSTS Header',
    what: 'HTTP Strict Transport Security (HSTS) is a response header that tells browsers to always use HTTPS for your domain.',
    why: 'It protects visitors from downgrade attacks and removes an extra HTTP to HTTPS redirect on repeat visits.',
    steps: [
      'Make sure your whole site works on HTTPS first.',
      'Add the Strict-Transport-Security header in your server, proxy, or CDN.',
      'Start with a short max-age, then increase it to one year.',
    ],
    example: 'Strict-Transport-Security: max-age=31536000; includeSubDomains',
    faqs: [
      ['Is HSTS a ranking factor?', 'No, it is a security best practice that also improves speed slightly.'],
      ['Can HSTS break my site?', 'Only if some pages or subdomains do not support HTTPS, so test first.'],
    ],
  },
  'url-friendly': {
    slug: 'seo-unfriendly-url',
    name: 'SEO-Unfriendly URL',
    what: 'The URL is very long, uses uppercase letters or underscores, or has many query parameters.',
    why: 'Short, readable URLs are easier to share, look more trustworthy in results, and help Google understand the page.',
    steps: [
      'Use lowercase words separated by hyphens.',
      'Keep the URL short and include the main keyword.',
      'Avoid dates and IDs unless needed.',
      'If you change a URL, add a 301 redirect from the old one.',
    ],
    example: 'Bad:  example.com/Blog_Posts/view.php?id=123&cat=7\nGood: example.com/blog/used-bike-buying-guide',
    faqs: [
      ['Hyphens or underscores?', 'Hyphens. Google treats hyphens as word separators but not underscores.'],
      ['Should I change old URLs?', 'Only if the benefit is clear, and always with 301 redirects.'],
    ],
  },
  'resource-count': {
    slug: 'too-many-scripts-and-stylesheets',
    name: 'Too Many Scripts and Stylesheets',
    what: 'The page loads more than 25 external scripts or 10 stylesheets.',
    why: 'Each file is an extra request, and many scripts block rendering, slowing down the page on mobile.',
    steps: [
      'Remove unused plugins, trackers, and widgets.',
      'Combine and minify CSS and JavaScript.',
      'Load non-critical scripts with defer or async.',
    ],
    faqs: [
      ['Does HTTP/2 make this irrelevant?', 'HTTP/2 helps, but each script still needs to be downloaded and executed.'],
      ['Which scripts are usually safe to remove?', 'Old analytics tags, unused chat widgets, and duplicate libraries.'],
    ],
  },

  // ---------- Links ----------
  'broken-links': {
    slug: 'broken-links',
    name: 'Broken Links',
    what: 'Links on your pages point to URLs that return 404, 410, or server errors.',
    why: 'Broken links frustrate visitors, waste crawl budget, and leak link authority. Many broken links make a site look neglected.',
    steps: [
      'Use the audit report to see each broken URL and the page linking to it.',
      'Update the link to the correct URL, or remove it.',
      'If you removed a page that still has links, add a 301 redirect to the best replacement.',
      'Re-crawl your site regularly to catch new broken links.',
    ],
    faqs: [
      ['Do broken outbound links hurt SEO?', 'A few have little effect, but they hurt user experience. Fix them when you can.'],
      ['How often should I check for broken links?', 'Monthly for active sites, and after every redesign or migration.'],
    ],
  },
  'internal-links': {
    slug: 'no-internal-links',
    name: 'Page Has No Internal Links',
    what: 'The page does not link to any other page on your website.',
    why: 'Internal links help visitors keep exploring and help Google discover pages and understand how they relate. Dead-end pages waste traffic.',
    steps: [
      'Link to related articles, products, or tools from within the content.',
      'Add breadcrumbs and a related-content section.',
      'Make sure the main navigation is in the HTML, not only loaded by JavaScript.',
    ],
    faqs: [
      ['How many internal links should a page have?', 'There is no fixed number. Add links where they genuinely help the reader.'],
      ['Do internal links pass ranking power?', 'Yes. They spread authority from strong pages to weaker ones.'],
    ],
  },
  'link-count': {
    slug: 'too-many-links-on-page',
    name: 'Too Many Links on a Page',
    what: 'The page contains more than 300 links.',
    why: 'Huge numbers of links dilute the value passed through each one and can look spammy or overwhelming.',
    steps: [
      'Simplify mega-menus and footers.',
      'Paginate long lists of links.',
      'Keep only links that help visitors.',
    ],
    faqs: [
      ['Is there a hard limit?', 'No. Google removed the old 100-link guideline, but fewer, better links work best.'],
      ['Do navigation links count?', 'Yes. Every link in the HTML counts.'],
    ],
  },
  'anchor-text': {
    slug: 'generic-anchor-text',
    name: 'Empty or Generic Anchor Text',
    what: 'Some links use empty text or generic words like "click here", "read more", or "learn more".',
    why: 'Anchor text tells Google and screen reader users what the linked page is about. Generic text wastes that signal.',
    steps: [
      'Replace generic anchors with words that describe the destination.',
      'For image links, add alt text to the image.',
      'For icon links, add an aria-label.',
    ],
    example: 'Bad:  <a href="/pricing">Click here</a>\nGood: <a href="/pricing">See our pricing plans</a>',
    faqs: [
      ['Should anchors include keywords?', 'Use natural, descriptive phrases. Exact-match keywords on every link look unnatural.'],
      ['Are "read more" buttons always bad?', 'They are fine if the button has an aria-label or the card heading is also a link.'],
    ],
  },
  'nofollow-internal': {
    slug: 'nofollow-internal-links',
    name: 'Nofollow on Internal Links',
    what: 'Links to your own pages use rel="nofollow".',
    why: 'Nofollow tells Google not to pass authority through the link, so your own pages lose internal link value.',
    steps: [
      'Remove rel="nofollow" from internal links.',
      'Use noindex on pages you want hidden, rather than nofollow links.',
      'Keep nofollow or sponsored only for paid or untrusted outbound links.',
    ],
    faqs: [
      ['Should login and cart links be nofollow?', 'It is not needed. Block those pages with noindex or robots.txt instead.'],
      ['Is nofollow sculpting still useful?', 'No. Google stopped rewarding PageRank sculpting many years ago.'],
    ],
  },

  // ---------- Site-wide ----------
  'duplicate-titles': {
    slug: 'duplicate-title-tags',
    name: 'Duplicate Title Tags',
    what: 'Two or more pages on your site use exactly the same title tag.',
    why: 'Duplicate titles make pages compete for the same searches (keyword cannibalization) and make it hard for Google to pick the right page.',
    steps: [
      'Open the affected URLs from the audit report.',
      'Write a unique title for each page that reflects its specific content.',
      'Fix templates that output one title for many pages, such as paginated or filtered lists.',
      'If pages are true duplicates, merge them and add 301 redirects or canonicals.',
    ],
    faqs: [
      ['Do paginated pages need unique titles?', 'Adding "Page 2" to the title is enough to make them unique.'],
      ['Is this a penalty?', 'No penalty, but it weakens rankings for all affected pages.'],
    ],
  },
  'duplicate-descriptions': {
    slug: 'duplicate-meta-descriptions',
    name: 'Duplicate Meta Descriptions',
    what: 'Several pages share the same meta description.',
    why: 'Identical descriptions make search results look repetitive and miss the chance to explain what makes each page different.',
    steps: [
      'Write a unique description for each affected page.',
      'For large sites, generate descriptions from page data (product name, price, location).',
      'Leave the description empty only if you prefer Google to write one.',
    ],
    faqs: [
      ['Is an empty description better than a duplicate?', 'Often yes. Google writes its own snippet when there is no description.'],
      ['Do I need descriptions for every page?', 'For important pages, yes. For thousands of similar pages, a template with variables works well.'],
    ],
  },
  'internal-redirects': {
    slug: 'internal-links-to-redirects',
    name: 'Internal Links Pointing to Redirects',
    what: 'Your pages link to internal URLs that redirect to another URL.',
    why: 'Every redirect adds a delay for visitors and an extra request for crawlers. Linking to the final URL is faster and cleaner.',
    steps: [
      'Use the report to see each redirecting URL and its final destination.',
      'Update links in menus, content, and templates to the final URL.',
      'Pay special attention to http vs https and www vs non-www versions.',
    ],
    faqs: [
      ['Do I still need the redirect after updating links?', 'Yes. Keep the redirect for external links and bookmarks.'],
      ['Is a trailing slash redirect a problem?', 'It counts as a redirect. Link to the exact final URL to avoid it.'],
    ],
  },
  'orphan-pages': {
    slug: 'orphan-pages',
    name: 'Orphan Pages',
    what: 'Orphan pages are listed in your sitemap but no other page on your site links to them.',
    why: 'Google sees pages without internal links as unimportant, and visitors can never find them by browsing.',
    steps: [
      'Review each orphan page from the audit report.',
      'If the page is valuable, link to it from related pages, category pages, or the menu.',
      'If it is outdated, remove it from the sitemap and redirect it.',
    ],
    faqs: [
      ['Can orphan pages still rank?', 'Sometimes, if they have backlinks, but they usually rank much worse.'],
      ['How do orphan pages happen?', 'Usually from removed menu items, old campaigns, or pages published without being linked.'],
    ],
  },
  'sitemap-errors': {
    slug: 'sitemap-url-errors',
    name: 'Sitemap Contains Errors or Redirects',
    what: 'Your XML sitemap lists URLs that redirect or return errors.',
    why: 'A sitemap should only contain live, final URLs. Bad URLs waste crawl budget and make Google trust your sitemap less.',
    steps: [
      'Remove deleted pages from the sitemap.',
      'Replace redirecting URLs with their final destination.',
      'Use a sitemap that updates automatically when pages change.',
      'Resubmit the sitemap in Google Search Console.',
    ],
    faqs: [
      ['Should noindex pages be in the sitemap?', 'No. Only include pages you want indexed.'],
      ['How often should a sitemap update?', 'Whenever you add, remove, or move pages. Dynamic sitemaps do this automatically.'],
    ],
  },
  'crawl-depth': {
    slug: 'pages-too-deep-in-site',
    name: 'Pages Too Deep in the Site',
    what: 'Some pages take more than 3 clicks to reach from the homepage.',
    why: 'Deep pages get crawled less often and receive less internal link authority, so they rank worse.',
    steps: [
      'Link important deep pages from the homepage, menus, or category pages.',
      'Add breadcrumbs and related-content blocks.',
      'Flatten long chains of pagination with category or tag pages.',
    ],
    faqs: [
      ['What is a good click depth?', 'Important pages should be within 3 clicks of the homepage.'],
      ['Does URL depth matter, like /a/b/c/?', 'Not much. Click depth from the homepage matters more than folder depth.'],
    ],
  },
  'noindex-pages': {
    slug: 'noindex-pages',
    name: 'Noindex Pages',
    what: 'These pages are set to noindex, so they are hidden from Google on purpose.',
    why: 'Noindex is correct for private, filter, search, and thank-you pages, but it is a common mistake on important content.',
    steps: [
      'Review the list in the audit report.',
      'Remove noindex from any page that should appear in Google.',
      'Remove noindex pages from your XML sitemap.',
    ],
    faqs: [
      ['Does noindex hurt the rest of my site?', 'No. It only affects the pages that have it.'],
      ['Should noindex pages be linked internally?', 'They can be, but links to them pass no ranking value to indexed pages.'],
    ],
  },

  // ---------- Target keyword ----------
  'kw-title': {
    slug: 'keyword-not-in-title',
    name: 'Target Keyword Missing From Title',
    what: 'The keyword you want this page to rank for does not appear in its title tag.',
    why: 'The title is one of the strongest relevance signals. Pages that include the keyword in the title usually rank better for it.',
    steps: [
      'Rewrite the title to include the keyword naturally, ideally near the start.',
      'Keep it readable and under 60 characters.',
    ],
    example: 'Keyword: used bikes in lahore\nTitle:   Used Bikes in Lahore: Compare Prices | BikeMarket',
    faqs: [
      ['Does the exact phrase matter?', 'Close variations work, but the exact phrase is the safest choice for your main keyword.'],
      ['Can I target two keywords in one title?', 'Yes, if they are closely related and the title stays natural.'],
    ],
  },
  'kw-description': {
    slug: 'keyword-not-in-meta-description',
    name: 'Target Keyword Missing From Meta Description',
    what: 'The meta description does not contain the target keyword.',
    why: 'Google bolds words in the snippet that match the search, which makes your result stand out and get more clicks.',
    steps: ['Mention the keyword once in the description, in a natural sentence.', 'Keep the description between 70 and 160 characters.'],
    faqs: [
      ['Will this improve rankings?', 'Not directly, but it improves click-through rate from search results.'],
      ['Should I repeat the keyword?', 'No. Once is enough.'],
    ],
  },
  'kw-h1': {
    slug: 'keyword-not-in-h1',
    name: 'Target Keyword Missing From H1',
    what: 'The main H1 heading does not include the target keyword.',
    why: 'The H1 confirms the topic of the page to search engines and to visitors who arrive from search.',
    steps: ['Include the keyword or a close variation in the H1.', 'Keep the H1 clear and written for people.'],
    faqs: [
      ['Should the H1 match the title exactly?', 'Not necessarily. Similar wording is fine.'],
      ['What if my design has no H1?', 'Add one to the main content area. It can be styled to fit the design.'],
    ],
  },
  'kw-url': {
    slug: 'keyword-not-in-url',
    name: 'Target Keyword Missing From URL',
    what: 'The page URL slug does not contain the target keyword.',
    why: 'Keywords in the URL are a small ranking signal and help searchers trust the link before clicking.',
    steps: [
      'For new pages, use the keyword in the slug with hyphens between words.',
      'For existing pages, only change the URL if the benefit is worth it, and always add a 301 redirect.',
    ],
    example: 'example.com/used-bikes-lahore',
    faqs: [
      ['Should my homepage URL contain keywords?', 'No. The homepage is always just the domain.'],
      ['Is changing URLs risky?', 'Slightly. With a 301 redirect, rankings usually recover within weeks.'],
    ],
  },
  'kw-intro': {
    slug: 'keyword-not-in-first-paragraph',
    name: 'Target Keyword Missing From First Paragraph',
    what: 'The target keyword does not appear in the first 100 words of the page.',
    why: 'Mentioning the topic early tells both readers and search engines that the page answers their query.',
    steps: ['Mention the keyword naturally in the opening sentence or paragraph.', 'Answer the main question right away, then add detail.'],
    faqs: [
      ['Does it have to be the first sentence?', 'No, anywhere in the first paragraph or first 100 words is good.'],
      ['What about keyword density?', 'Write naturally. There is no ideal density, and stuffing hurts.'],
    ],
  },
};

export function guideBySlug(slug) {
  for (const [id, g] of Object.entries(GUIDES)) if (g.slug === slug) return { id, ...g };
  return null;
}

export function guideUrl(id) {
  return GUIDES[id] ? `/seo-audit/checks/${GUIDES[id].slug}` : null;
}
