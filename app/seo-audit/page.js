import ToolPage from '../../components/ToolPage';
import SeoAuditTool from '../../components/SeoAuditTool';
import { getTool } from '../../lib/tools';

const tool = getTool('seo-audit');

export const metadata = {
  title: 'Free SEO Audit Tool: Check Any Website for SEO Issues',
  description:
    'Free website SEO audit tool. Get an SEO score and 35+ checks for meta tags, content, headings, images, robots.txt, sitemap, schema, speed, and broken links, with clear fixes. No signup.',
  alternates: { canonical: '/seo-audit' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Free SEO Audit Tool: Get Your SEO Score in Seconds | Craftora',
    description: 'Audit any page for 35+ SEO issues and get step-by-step fixes. Free, no signup.',
    url: 'https://craftora.dev/seo-audit',
    type: 'website',
  },
};

const howItWorks = [
  ['Enter a page URL', 'Paste the address of any page, like your homepage or a blog post. Add a target keyword if you want keyword checks too.'],
  ['Craftora audits the page', 'The tool loads the page like a search engine, then checks meta tags, content, headings, images, robots.txt, sitemap, structured data, speed, and links.'],
  ['Fix what matters first', 'Get a score out of 100, issues sorted by priority, and a clear fix for each one, with links to free tools that do the fix for you.'],
];

const features = [
  'SEO score out of 100 with category scores for meta, content, technical, and links.',
  '35+ checks, sorted into critical issues, warnings, and notices.',
  'Google search result and social share previews of your page.',
  'Optional target keyword checks for title, description, H1, URL, and intro.',
  'Broken link check for links on the page.',
  'Robots.txt, sitemap, canonical, noindex, HTTPS, and compression checks.',
  'Step-by-step fixes with links to free generators.',
  'Download the full report as CSV. Free with no signup.',
];

const faqs = [
  ['What is an SEO audit?', 'An SEO audit checks a web page for problems that stop it from ranking well in Google, such as a missing title or meta description, missing H1, slow server response, broken links, missing sitemap, or pages blocked from indexing. Fixing these issues helps search engines crawl, understand, and rank your pages.'],
  ['How is the SEO score calculated?', 'Each check has a weight based on how much it affects rankings. Critical checks (like HTTPS, indexability, and the title tag) count the most, warnings count less, and notices count the least. Your score is the share of weighted checks the page passes, from 0 to 100.'],
  ['What is a good SEO score?', 'A score of 80 or higher is good, and 90 or higher is excellent. Fix critical issues first, since they can stop a page from ranking at all, then work through warnings and notices.'],
  ['Is this SEO audit tool free?', 'Yes. You can audit up to 10 pages per hour for free, with no signup and no credit card.'],
  ['What does the target keyword check do?', 'If you enter a keyword, the audit checks whether it appears in the title, meta description, H1, URL, and the first 100 words, and shows how often it is used on the page. These are the places where keywords matter most for on-page SEO.'],
  ['Can I audit my whole website?', 'Yes. Create a free account to run a full-site audit that crawls up to 500 pages, finds site-wide issues like duplicate titles, broken links, orphan pages, and sitemap errors, saves every report, and tracks your SEO score over time in your SEO dashboard.'],
  ['Why does my page fail the noindex or robots.txt check?', 'A noindex tag or header tells Google not to show the page in search results, and a robots.txt Disallow rule stops Google from crawling it. Both are useful for private pages, but if you want the page to rank, remove them.'],
  ['Does the audit check page speed?', 'The audit measures server response time, HTML size, compression, and the number of scripts and stylesheets, which are the main server-side speed factors. For full Core Web Vitals, also test the page in Google PageSpeed Insights.'],
];

export default function SeoAuditPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <SeoAuditTool />
    </ToolPage>
  );
}
