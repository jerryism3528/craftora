import ToolPage from '../../components/ToolPage';
import OpenGraphTool from '../../components/OpenGraphTool';
import { getTool } from '../../lib/tools';

const tool = getTool('open-graph-generator');

export const metadata = {
  title: 'Open Graph Generator: Free OG Tags with Preview',
  description:
    'Free Open Graph generator. Create OG and Twitter Card meta tags for rich social media previews, with a live preview of how your link looks when shared. Runs in your browser, ready to paste, no signup.',
  alternates: { canonical: '/open-graph-generator' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Open Graph Generator: Free OG Tags with Preview | Craftora',
    description: 'Generate Open Graph and Twitter tags with a live social card preview. Free, ready to paste, no signup.',
    url: 'https://craftora.dev/open-graph-generator',
    type: 'website',
  },
};

const howItWorks = [
  ['Enter your details', 'Add your title, description, URL, and a preview image (1200 x 630 works best).'],
  ['Check the preview', 'See a live social card showing how your link will look when shared.'],
  ['Copy the tags', 'Copy the Open Graph and Twitter tags and paste them into your page <head>.'],
];

const features = [
  'Generate Open Graph tags for Facebook, LinkedIn, and messaging apps.',
  'Includes Twitter Card tags for rich previews on X.',
  'Live social-card preview as you type.',
  'Choose the content type: website, article, or product.',
  'Clean, ready-to-paste output.',
  'Runs in your browser. Free with no signup and no limits.',
];

const faqs = [
  ['What are Open Graph tags?', 'Open Graph (og:) tags are meta tags that control how your page looks when shared on social media: the title, description, and preview image. Without them, shared links look plain and get far fewer clicks.'],
  ['How do I create Open Graph tags for free?', 'Enter your title, description, URL, and image, and Craftora builds the OG and Twitter tags with a live preview. Copy them into your page head. It is free and runs in your browser.'],
  ['What image size should I use for Open Graph?', 'Use 1200 by 630 pixels for the sharpest large preview across Facebook, LinkedIn, and X. Keep the file under about 5 MB and use JPG or PNG. Craftora previews it at the correct ratio.'],
  ['Where do I put Open Graph tags?', 'Paste them inside the <head> section of your HTML page. Each page should have its own OG tags so shares of different pages show the right title, description, and image.'],
  ['Why is my social preview not updating?', 'Facebook and LinkedIn cache previews. After adding or changing your OG tags, use their sharing debugger tools to re-scrape the page so the new preview shows.'],
  ['Do I need to sign up?', 'No. The Open Graph generator is free with no account and no limits.'],
];

export default function OpenGraphGeneratorPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <OpenGraphTool />
    </ToolPage>
  );
}
