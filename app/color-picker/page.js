import ToolPage from '../../components/ToolPage';
import ColorPickerTool from '../../components/ColorPickerTool';
import { getTool } from '../../lib/tools';

const tool = getTool('color-picker');

export const metadata = {
  title: 'Color Picker: Get HEX, RGB, and HSL Codes Free',
  description:
    'Free online color picker. Pick any color and get its HEX, RGB, and HSL codes, or upload an image and pick colors from it. Build a palette and copy codes instantly. Runs in your browser, no signup.',
  alternates: { canonical: '/color-picker' },
  openGraph: {
    title: 'Color Picker: Get HEX, RGB, and HSL Codes Free | Craftora',
    description: 'Pick colors, get HEX, RGB, and HSL codes, and grab colors from any image. Free, in your browser, no signup.',
    url: 'https://craftora.dev/color-picker',
    type: 'website',
  },
};

const howItWorks = [
  ['Pick a color', 'Use the color picker to choose any color, or upload an image and click it to grab a color.'],
  ['Copy the code', 'Get the HEX, RGB, and HSL codes instantly and copy the one you need.'],
  ['Build a palette', 'Save colors to a palette so you can collect and reuse a set for your project.'],
];

const features = [
  'Get HEX, RGB, and HSL codes for any color at once.',
  'Upload an image and click anywhere to pick that exact color (eyedropper).',
  'Save colors to a palette and reuse them.',
  'Copy any color code with one click.',
  'Runs entirely in your browser, so your images are never uploaded.',
  'Completely free with no signup and no limits.',
];

const faqs = [
  ['How do I pick a color and get its code?', 'Use the color picker to choose a color, or upload an image and click it. Craftora instantly shows the HEX, RGB, and HSL codes, ready to copy. It is free and runs in your browser.'],
  ['How do I get a color from an image?', 'Upload any image, then click anywhere on it. The tool reads the exact pixel color at that spot and gives you its HEX, RGB, and HSL codes. Your image stays in your browser and is never uploaded.'],
  ['What is the difference between HEX, RGB, and HSL?', 'They are three ways to write the same color. HEX is a six-digit code used in web and design (like #3430A8). RGB describes it as red, green, and blue values. HSL uses hue, saturation, and lightness, which is handy for making a color lighter or darker.'],
  ['Can I build a color palette?', 'Yes. Click Save to palette to collect colors as you pick them. Your palette shows all your saved colors, and you can click any of them to load it back or remove it.'],
  ['Is the eyedropper accurate?', 'Yes. It reads the true pixel color from your uploaded image, so the code matches exactly what you clicked, which is perfect for matching brand colors or grabbing a shade from a photo.'],
  ['Do I need to sign up?', 'No. The color picker is free with no account and no limits.'],
];

export default function ColorPickerPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <ColorPickerTool />
    </ToolPage>
  );
}
