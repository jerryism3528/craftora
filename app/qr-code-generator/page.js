import ToolPage from '../../components/ToolPage';
import QrCodeTool from '../../components/QrCodeTool';
import { getTool } from '../../lib/tools';

const tool = getTool('qr-code-generator');

export const metadata = {
  title: 'QR Code Generator: Create a Free QR Code Online',
  description:
    'Free online QR code generator. Create a QR code from any link or text, customize the size and colors, and download it as PNG or SVG. Runs in your browser, no signup, and nothing is uploaded.',
  alternates: { canonical: '/qr-code-generator' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'QR Code Generator: Create a Free QR Code Online | Craftora',
    description: 'Generate a QR code from any link or text for free. Custom colors, PNG or SVG download, no signup.',
    url: 'https://craftora.dev/qr-code-generator',
    type: 'website',
  },
};

const howItWorks = [
  ['Enter a link or text', 'Type or paste the URL or text you want your QR code to open or show.'],
  ['Customize it', 'Adjust the size, and pick your own QR color and background to match your brand.'],
  ['Download it', 'Download your QR code as a PNG image, or as an SVG for crisp printing at any size.'],
];

const features = [
  'Create a QR code from any link, text, or contact detail.',
  'Live preview updates instantly as you type.',
  'Customize the QR color and background color.',
  'Adjust the size for screen or print.',
  'Download as PNG for the web or SVG for high-quality printing.',
  'Runs in your browser, so your data is never uploaded. Free with no signup.',
];

const faqs = [
  ['How do I create a QR code for free?', 'Type your link or text, adjust the size and colors, and download your QR code as PNG or SVG. It is free, runs in your browser, and nothing is uploaded.'],
  ['Do these QR codes expire?', 'No. Craftora generates static QR codes that encode your link or text directly. They never expire and keep working forever, unlike some services that route through a link that can be turned off.'],
  ['Should I download PNG or SVG?', 'Use PNG for websites, social media, and screens. Use SVG for printing on posters, packaging, or business cards, because it stays sharp at any size.'],
  ['Can I change the QR code colors?', 'Yes. You can set both the QR color and the background color. Keep good contrast (dark code on a light background works best) so scanners read it reliably.'],
  ['Is there a scan limit or tracking?', 'No. These are plain QR codes with no tracking, no limits, and no account. Whoever scans it goes straight to your link.'],
  ['Do I need to sign up?', 'No. The QR code generator is free with no account and no limits.'],
];

export default function QrCodeGeneratorPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <QrCodeTool />
    </ToolPage>
  );
}
