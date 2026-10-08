import ToolPage from '../../components/ToolPage';
import SitemapGeneratorTool from '../../components/SitemapGeneratorTool';
import { getTool } from '../../lib/tools';

const tool = getTool('sitemap-generator');

export const metadata = {
  title: 'Free XML Sitemap Generator: Crawl Your Site and Create sitemap.xml',
  description:
    'Free XML sitemap generator. Enter your website URL and Craftora crawls up to 500 pages, then builds sitemap.xml with lastmod and priority. Also exports TXT and HTML sitemaps and finds broken links. No signup.',
  alternates: { canonical: '/sitemap-generator' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Free XML Sitemap Generator | Craftora',
    description: 'Crawl your website and download sitemap.xml in seconds. Finds broken links too. Free, no signup.',
    url: 'https://craftora.dev/sitemap-generator',
    type: 'website',
  },
};

const howItWorks = [
  ['Enter your website URL', 'Type your homepage address, like https://yourwebsite.com, and click Generate Sitemap. Or switch to Paste URLs if you already have a list.'],
  ['Craftora crawls your pages', 'The crawler follows every internal link on your site, respects robots.txt, skips images, PDFs, and noindex pages, and shows live progress.'],
  ['Download your sitemap', 'Download sitemap.xml, a plain TXT list, or an HTML sitemap. Upload the XML file to your site root and submit it in Google Search Console.'],
];

const features = [
  'Crawls up to 500 pages per website automatically.',
  'Standard XML sitemap with lastmod, changefreq, and priority by page depth.',
  'Also exports a TXT sitemap and a ready-to-publish HTML sitemap.',
  'Finds broken links (404s and errors) and shows the page they were found on.',
  'Respects robots.txt, noindex tags, and canonical URLs.',
  'Paste URLs mode for instant sitemaps with no crawling.',
  'Free with no signup.',
];

const faqs = [
  ['What is an XML sitemap?', 'An XML sitemap is a file, usually at yourwebsite.com/sitemap.xml, that lists the pages on your site you want search engines to find. It helps Google and Bing discover new and deep pages faster, especially on new sites with few backlinks.'],
  ['How do I create a sitemap for my website?', 'Enter your homepage URL above and click Generate Sitemap. Craftora visits your homepage, follows every internal link, and builds sitemap.xml from the pages it finds. Download the file, upload it to the root folder of your website, and submit it in Google Search Console.'],
  ['How many pages can the sitemap generator crawl?', 'Each crawl covers up to 500 pages, which fits most small and medium websites. If your site is bigger, the pages closest to your homepage are included first. Very large sites usually generate sitemaps from their CMS or a plugin.'],
  ['How do I submit my sitemap to Google?', 'Upload sitemap.xml to your site root so it opens at yourwebsite.com/sitemap.xml. Then open Google Search Console, go to Sitemaps, enter sitemap.xml, and click Submit. You can also add a line "Sitemap: https://yourwebsite.com/sitemap.xml" to your robots.txt file.'],
  ['Why are some of my pages missing from the sitemap?', 'The crawler only finds pages that are linked from other pages on your site. Pages blocked by robots.txt, marked noindex, pointing to a different canonical URL, or only reachable through JavaScript or forms are skipped. Use Paste URLs mode to add pages manually.'],
  ['What does the broken links report show?', 'While crawling, Craftora records every internal link that returns an error such as 404 Not Found or 500, along with the page where the broken link appears. Fixing these improves user experience and helps search engines crawl your site.'],
  ['Is the sitemap generator free?', 'Yes. The crawler is free with no signup, with a limit of 3 crawls per hour to keep the service fast for everyone. Paste URLs mode runs in your browser and is unlimited.'],
  ['What is the difference between an XML and an HTML sitemap?', 'An XML sitemap is made for search engines and is not meant for visitors. An HTML sitemap is a normal web page listing links to your pages, useful for visitors and for internal linking. Craftora gives you both from the same crawl.'],
];

export default function SitemapGeneratorPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <SitemapGeneratorTool />
    </ToolPage>
  );
}
