import ToolPage from '../../components/ToolPage';
import RobotsTxtTool from '../../components/RobotsTxtTool';
import { getTool } from '../../lib/tools';

const tool = getTool('robots-txt-generator');

export const metadata = {
  title: 'Robots.txt Generator: Free and Easy',
  description:
    'Free robots.txt generator. Create a robots.txt file with allow and disallow rules, crawl-delay, and your sitemap URL, using simple presets. Runs in your browser, download ready to upload, no signup.',
  alternates: { canonical: '/robots-txt-generator' },
  openGraph: {
    title: 'Robots.txt Generator: Free and Easy | Craftora',
    description: 'Create a robots.txt file with allow/disallow rules and your sitemap. Free presets, ready to download, no signup.',
    url: 'https://craftora.dev/robots-txt-generator',
    type: 'website',
  },
};

const howItWorks = [
  ['Start with a preset', 'Choose allow all, block all, or a common CMS default, or start from scratch.'],
  ['Add your rules', 'Set the user-agent, list the paths to disallow or allow, and add your sitemap URL.'],
  ['Download robots.txt', 'Copy or download the file and upload it to the root of your website.'],
];

const features = [
  'Quick presets for allow all, block all, and WordPress defaults.',
  'Add any number of Disallow and Allow paths.',
  'Set the user-agent to target specific crawlers.',
  'Optional crawl-delay and sitemap URL.',
  'Copy the output or download a ready-to-use robots.txt file.',
  'Runs in your browser. Free with no signup and no limits.',
];

const faqs = [
  ['What is a robots.txt file?', 'A robots.txt file sits at the root of your site and tells search engine crawlers which pages or folders they may or may not crawl. It is one of the first files Google looks for when it visits your site.'],
  ['How do I create a robots.txt file for free?', 'Pick a preset or add your own allow and disallow rules, then download the file. Upload it to the root of your site so it is reachable at yoursite.com/robots.txt. It is free and generated in your browser.'],
  ['Where do I put the robots.txt file?', 'It must live in the root directory of your domain, so it loads at yoursite.com/robots.txt. It will not work in a subfolder. Most hosts let you upload it via your file manager or FTP.'],
  ['What is the difference between Disallow and Allow?', 'Disallow tells crawlers not to crawl a path. Allow explicitly permits a path, which is useful to open up a single file inside an otherwise disallowed folder. An empty Disallow means everything is allowed.'],
  ['Should I add my sitemap to robots.txt?', 'Yes. Adding a Sitemap line pointing to your sitemap.xml helps search engines discover all your pages faster. This tool adds it for you when you enter the URL.'],
  ['Do I need to sign up?', 'No. The robots.txt generator is free with no account and no limits.'],
];

export default function RobotsTxtGeneratorPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <RobotsTxtTool />
    </ToolPage>
  );
}
