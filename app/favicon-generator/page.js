import ToolPage from '../../components/ToolPage';
import FaviconGeneratorTool from '../../components/FaviconGeneratorTool';
import { getTool } from '../../lib/tools';

const tool = getTool('favicon-generator');

export const metadata = {
  title: 'Favicon Generator: Make a Favicon Online Free',
  description:
    'Generate a favicon online for free. Turn any image or logo into a full set of favicon sizes for your website, with a ready-to-paste HTML snippet. No signup, no watermarks, and your image never leaves your browser.',
  alternates: { canonical: '/favicon-generator' },
  openGraph: {
    title: 'Favicon Generator: Make a Favicon Online Free | Craftora',
    description: 'Create a favicon from any image for free, right in your browser. Full size pack plus HTML snippet, no uploads.',
    url: 'https://craftora.dev/favicon-generator',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your image', 'Drop your logo or image into the box or choose it from your device. A square image works best.'],
  ['Generate the icons', 'Craftora creates every favicon size your site needs: 16, 32, 48, 180, 192, and 512 pixels.'],
  ['Download and paste', 'Download the favicon pack as a zip, then paste the included HTML snippet into your site head.'],
];

const features = [
  'Turn any image or logo into a complete favicon set.',
  'Generates 16, 32, 48, 180, 192, and 512 pixel icons for browsers, Apple, and Android.',
  'Includes a ready-to-paste HTML snippet for your website head.',
  'Everything is bundled into a single zip download.',
  'Favicons are generated in your browser, so nothing is uploaded to a server.',
  'Completely free with no signup, no watermarks, and no daily limits.',
];

const faqs = [
  ['How do I create a favicon for free?', 'Add your logo or image above and click Generate favicons. Craftora creates every size your site needs, then you download them as a zip with an HTML snippet to paste into your website. It is free with no signup.'],
  ['What size should a favicon be?', 'Modern sites use several sizes: 16x16 and 32x32 for browser tabs, 180x180 for Apple devices, and 192x192 and 512x512 for Android and progressive web apps. Craftora generates all of them for you.'],
  ['What image should I use for a favicon?', 'Use a simple, square logo or icon that stays clear when small. Detailed images or wide logos get hard to read at 16 pixels, so bold and simple works best.'],
  ['How do I add the favicon to my website?', 'Put the downloaded PNG files in your website root folder, then paste the included HTML snippet inside the head section of your pages. Craftora gives you that snippet ready to copy.'],
  ['Do my images get uploaded anywhere?', 'No. The favicons are generated entirely in your browser on your own device. Your image is never sent to any server.'],
  ['Can I use a JPG or PNG?', 'Yes. You can use JPG, PNG, WebP, or SVG images. The generated favicons are saved as PNG, which every browser supports.'],
];

export default function FaviconGeneratorPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <FaviconGeneratorTool />
    </ToolPage>
  );
}
