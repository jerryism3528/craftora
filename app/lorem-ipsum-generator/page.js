import ToolPage from '../../components/ToolPage';
import LoremIpsumTool from '../../components/LoremIpsumTool';
import { getTool } from '../../lib/tools';

const tool = getTool('lorem-ipsum-generator');

export const metadata = {
  title: 'Lorem Ipsum Generator: Free Placeholder Text',
  description:
    'Free Lorem Ipsum generator. Create placeholder text by paragraphs, sentences, or words for your designs and mockups, then copy it with one click. Runs in your browser, no signup.',
  alternates: { canonical: '/lorem-ipsum-generator' },
  openGraph: {
    title: 'Lorem Ipsum Generator: Free Placeholder Text | Craftora',
    description: 'Generate Lorem Ipsum placeholder text by paragraphs, sentences, or words. Free, instant, no signup.',
    url: 'https://craftora.dev/lorem-ipsum-generator',
    type: 'website',
  },
};

const howItWorks = [
  ['Choose the amount and type', 'Set how many you want and pick paragraphs, sentences, or words.'],
  ['Generate', 'Click Generate to create placeholder text, optionally starting with the classic "Lorem ipsum" line.'],
  ['Copy it', 'Copy the placeholder text and drop it straight into your design or mockup.'],
];

const features = [
  'Generate placeholder text by paragraphs, sentences, or words.',
  'Option to start with the classic "Lorem ipsum dolor sit amet" opening.',
  'Create up to 100 units at once.',
  'Copy the whole block with one click.',
  'Runs entirely in your browser, nothing is uploaded.',
  'Completely free with no signup and no limits.',
];

const faqs = [
  ['What is Lorem Ipsum?', 'Lorem Ipsum is scrambled Latin-like placeholder text that designers and developers use to fill a layout before the real content is ready. It lets you see how a design looks with text without being distracted by the words.'],
  ['How do I generate Lorem Ipsum for free?', 'Choose how much you need, pick paragraphs, sentences, or words, and click Generate. Copy the result with one click. It is free and runs in your browser.'],
  ['Why use placeholder text instead of real text?', 'Placeholder text keeps the focus on layout, spacing, and typography during design. Real copy can pull attention to wording too early, and it is often not ready when the design work starts.'],
  ['Can I generate just a few words or a single paragraph?', 'Yes. Switch the type to words, sentences, or paragraphs and set any amount from 1 to 100, so you get exactly the length you need.'],
  ['Where does "Lorem ipsum" come from?', 'It is based on a passage from a first-century BC Latin text by Cicero, scrambled over the years into the standard dummy text used in publishing and design since the 1500s.'],
  ['Do I need to sign up?', 'No. The Lorem Ipsum generator is free with no account and no limits.'],
];

export default function LoremIpsumGeneratorPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <LoremIpsumTool />
    </ToolPage>
  );
}
