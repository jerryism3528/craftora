import ToolPage from '../../components/ToolPage';
import RandomNumberTool from '../../components/RandomNumberTool';
import { getTool } from '../../lib/tools';

const tool = getTool('random-number-generator');

export const metadata = {
  title: 'Random Number Generator: Pick Numbers Online Free',
  description:
    'Free random number generator. Generate random numbers in any range, single or in bulk, with no-duplicate and sorting options. Uses secure randomness in your browser. No signup, nothing uploaded.',
  alternates: { canonical: '/random-number-generator' },
  openGraph: {
    title: 'Random Number Generator: Pick Numbers Online Free | Craftora',
    description: 'Generate random numbers in any range, with no-duplicate and sort options. Free, secure, no signup.',
    url: 'https://craftora.dev/random-number-generator',
    type: 'website',
  },
};

const howItWorks = [
  ['Set your range', 'Enter the minimum and maximum, and how many numbers you want to generate.'],
  ['Choose options', 'Turn on "No duplicates" for a unique set (like a raffle draw) or "Sort results" to order them.'],
  ['Generate and copy', 'Click Generate to get your random numbers, then copy them all with one click.'],
];

const features = [
  'Generate random numbers in any range you choose.',
  'Create a single number or up to 1000 at once.',
  'No-duplicate option for unique picks, like draws and raffles.',
  'Sort the results in ascending order.',
  'Uses your browser\'s secure random generator, not a weak predictable one.',
  'Runs in your browser. Free with no signup and no limits.',
];

const faqs = [
  ['How do I generate a random number for free?', 'Set your minimum and maximum, choose how many you want, and click Generate. Craftora produces the numbers instantly. It is free, runs in your browser, and nothing is uploaded.'],
  ['Can I generate random numbers with no duplicates?', 'Yes. Turn on "No duplicates" and every number in the result will be unique. This is perfect for raffles, giveaways, lottery-style picks, or assigning unique IDs.'],
  ['Are the numbers truly random?', 'Craftora uses your browser\'s cryptographically secure random generator, which is far stronger than the basic random function most simple tools use. That makes the numbers suitable for draws and fair selection.'],
  ['Can I pick a random number between 1 and 100?', 'Yes. Set the minimum to 1 and the maximum to 100, then generate. You can use any range, including negative numbers.'],
  ['How many numbers can I generate at once?', 'Up to 1000 at a time. Use the "How many" field to set the count, and optionally sort them or keep them unique.'],
  ['Do I need to sign up?', 'No. The random number generator is free with no account and no limits.'],
];

export default function RandomNumberGeneratorPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <RandomNumberTool />
    </ToolPage>
  );
}

