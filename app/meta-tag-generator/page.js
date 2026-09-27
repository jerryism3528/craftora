import ToolPage from '../../components/ToolPage';
import MetaTagGeneratorTool from '../../components/MetaTagGeneratorTool';
import { getTool } from '../../lib/tools';

const tool = getTool('meta-tag-generator');

export const metadata = {
  title: 'Meta Tag Generator: Free SEO Meta Tags',
  description:
    'Free meta tag generator. Create SEO title, description, canonical, Open Graph, and Twitter Card tags for your web pages, with live length checks. Runs in your browser, no signup, ready to paste.',
  alternates: { canonical: '/meta-tag-generator' },
  openGraph: {
    title: 'Meta Tag Generator: Free SEO Meta Tags | Craftora',
    description: 'Generate SEO, Open Graph, and Twitter meta tags with live length checks. Free, ready to paste, no signup.',
    url: 'https://craftora.dev/meta-tag-generator',
    type: 'website',
  },
};

const howItWorks = [
  ['Fill in your page details', 'Enter your title, description, URL, and an optional preview image. Length counters keep you in the ideal range.'],
  ['Watch the tags build', 'Craftora generates the SEO, Open Graph, and Twitter Card tags live as you type.'],
  ['Copy into your page', 'Copy the tags and paste them inside the <head> section of your HTML.'],
];

const features = [
  'Generate SEO title, description, keywords, author, and robots tags.',
  'Includes Open Graph tags for Facebook and LinkedIn previews.',
  'Includes Twitter Card tags for rich previews on X.',
  'Adds a canonical link tag to avoid duplicate content issues.',
  'Live length counters for title (60) and description (160) so they display well.',
  'Runs in your browser, ready to paste. Free with no signup.',
];

const faqs = [
  ['How do I generate meta tags for free?', 'Fill in your page title, description, and URL, and Craftora builds the SEO, Open Graph, and Twitter tags instantly. Copy them into your page\'s <head>. It is free and runs in your browser.'],
  ['What meta tags do I need for SEO?', 'The essentials are a unique title tag, a meta description, and a canonical link. Adding Open Graph and Twitter Card tags improves how your page looks when shared on social media, which lifts click-through.'],
  ['How long should my title and description be?', 'Keep the title around 60 characters and the description around 160 so they are not cut off in search results. The live counters here turn red when you go over.'],
  ['What are Open Graph tags?', 'Open Graph (og:) tags control how your page appears when shared on Facebook, LinkedIn, and messaging apps: the title, description, and preview image. Without them, shares look plain and get fewer clicks.'],
  ['Where do I put the meta tags?', 'Paste them inside the <head> section of your HTML page, before the closing </head> tag. Each page should have its own unique title and description.'],
  ['Do I need to sign up?', 'No. The meta tag generator is free with no account and no limits.'],
];

export default function MetaTagGeneratorPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <MetaTagGeneratorTool />
    </ToolPage>
  );
}
