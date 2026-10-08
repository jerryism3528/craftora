import ToolPage from '../../components/ToolPage';
import UrlShortenerTool from '../../components/UrlShortenerTool';
import { getTool } from '../../lib/tools';

const tool = getTool('url-shortener');

export const metadata = {
  title: 'URL Shortener: Free Link Shortener With Click Tracking and QR Codes',
  description:
    'Free URL shortener. Shorten long links, create custom short links, and track every click by device, browser, and referrer. Get a QR code for each link. Unlimited links, safety-checked by Google.',
  keywords: ['url shortener', 'link shortener', 'free url shortener', 'short link', 'shorten url', 'custom short link', 'url shortener with analytics', 'link shortener with tracking', 'qr code link', 'bitly alternative', 'tinyurl alternative', 'shorten link free'],
  alternates: { canonical: '/url-shortener' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'URL Shortener: Free Link Shortener With Click Tracking | Craftora',
    description: 'Shorten links, pick custom names, get QR codes, and track clicks. Free and unlimited.',
    url: 'https://craftora.dev/url-shortener',
    type: 'website',
  },
};

const howItWorks = [
  ['Paste your long link', 'Paste any web address into the box. You can add a custom name and an optional expiry date.'],
  ['Get your short link', 'Craftora checks the link for safety, then gives you a short go.craftora.dev link and a QR code.'],
  ['Share and track', 'Share your link anywhere. See total clicks, daily clicks, devices, browsers, and where visitors came from.'],
];

const features = [
  'Unlimited short links with a free account.',
  'Custom names, like go.craftora.dev/your-name.',
  'Click tracking: daily clicks, devices, browsers, and top referrers.',
  'A downloadable QR code for every link.',
  'Optional expiry: 7, 30, or 90 days, or keep links permanently.',
  'Every link is checked against Google Safe Browsing to block phishing and malware.',
  'Manage, copy, and delete all your links in one place.',
];

const faqs = [
  ['How do I shorten a URL for free?', 'Sign in, paste your long link into the box, and click Shorten. You get a short go.craftora.dev link instantly, plus a QR code you can download.'],
  ['Can I create a custom short link?', 'Yes. Open "Custom name and expiry" and type the name you want. If it is free, your link becomes go.craftora.dev/your-name.'],
  ['Can I track clicks on my short link?', 'Yes. Every link has a Stats button showing total clicks, clicks per day for the last 30 days, devices, browsers, and the sites visitors came from.'],
  ['Do short links expire?', 'Links are permanent by default. You can choose to make a link expire after 7, 30, or 90 days, which is useful for limited-time offers.'],
  ['Is there a limit on how many links I can create?', 'No. A free account can create unlimited short links.'],
  ['Is it a good Bitly or TinyURL alternative?', 'Yes. You get custom names, click tracking, and QR codes for free, without paid plans or link limits.'],
  ['Why was my link blocked?', 'Every link is checked with Google Safe Browsing. Links flagged for phishing, malware, or harmful software cannot be shortened, to keep everyone safe.'],
];

export default function UrlShortenerPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <UrlShortenerTool />
    </ToolPage>
  );
}
