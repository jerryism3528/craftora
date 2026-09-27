import ToolPage from '../../components/ToolPage';
import BarcodeGeneratorTool from '../../components/BarcodeGeneratorTool';
import { getTool } from '../../lib/tools';

const tool = getTool('barcode-generator');

export const metadata = {
  title: 'Barcode Generator: Create Barcodes Online Free',
  description:
    'Free online barcode generator. Create CODE128, EAN-13, UPC, CODE39, and ITF-14 barcodes and download them as PNG or SVG. Runs in your browser, no signup, nothing uploaded.',
  alternates: { canonical: '/barcode-generator' },
  openGraph: {
    title: 'Barcode Generator: Create Barcodes Online Free | Craftora',
    description: 'Create CODE128, EAN-13, UPC, and more barcodes and download as PNG or SVG. Free, no signup.',
    url: 'https://craftora.dev/barcode-generator',
    type: 'website',
  },
};

const howItWorks = [
  ['Enter the value', 'Type the number or text you want to encode into a barcode.'],
  ['Choose the format', 'Pick a barcode type: CODE128 for general use, EAN-13 or UPC for retail, and more.'],
  ['Download it', 'Download your barcode as a PNG for the web or an SVG for crisp printing at any size.'],
];

const features = [
  'Create barcodes in CODE128, EAN-13, EAN-8, UPC, CODE39, and ITF-14.',
  'Live preview updates as you type.',
  'Option to show or hide the value beneath the barcode.',
  'Download as PNG for screens or SVG for high-quality printing.',
  'Clear error message when a value does not fit the chosen format.',
  'Runs in your browser, nothing is uploaded. Free with no signup.',
];

const faqs = [
  ['How do I create a barcode for free?', 'Enter your value, choose a barcode format, and download it as PNG or SVG. It is free, runs in your browser, and nothing is uploaded.'],
  ['Which barcode format should I use?', 'Use CODE128 for general purposes like labels and inventory. Use EAN-13 or UPC-A for retail products, EAN-8 for small packages, CODE39 for mixed letters and numbers, and ITF-14 for shipping cartons.'],
  ['Why does my value show an error?', 'Some formats require a specific length or only digits. For example, EAN-13 needs 12 to 13 digits and UPC needs 11 to 12. Switch to CODE128 if you need to encode free-form text or a value of any length.'],
  ['Should I download PNG or SVG?', 'Use PNG for websites, documents, and screens. Use SVG for printing on labels, packaging, or signage, because it stays perfectly sharp at any size.'],
  ['Can I use these barcodes commercially?', 'The barcode image is yours to use. Note that for selling retail products, the underlying UPC or EAN number itself must be officially registered with GS1. This tool creates the barcode image from whatever number you provide.'],
  ['Do I need to sign up?', 'No. The barcode generator is free with no account and no limits.'],
];

export default function BarcodeGeneratorPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <BarcodeGeneratorTool />
    </ToolPage>
  );
}
