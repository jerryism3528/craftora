import ToolPage from '../../components/ToolPage';
import UuidGeneratorTool from '../../components/UuidGeneratorTool';
import { getTool } from '../../lib/tools';

const tool = getTool('uuid-generator');

export const metadata = {
  title: 'UUID Generator: Generate UUID v4 Online Free',
  description:
    'Free online UUID generator. Create random UUID version 4 identifiers, one or many at once, and copy them instantly. Runs in your browser with no signup and nothing uploaded.',
  alternates: { canonical: '/uuid-generator' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'UUID Generator: Generate UUID v4 Online Free | Craftora',
    description: 'Generate random UUID v4 identifiers free, one or in bulk, right in your browser. No signup, no limits.',
    url: 'https://craftora.dev/uuid-generator',
    type: 'website',
  },
};

const howItWorks = [
  ['Choose how many', 'Enter how many UUIDs you need, from one up to a hundred at a time.'],
  ['Generate', 'Click Generate to create secure random UUID version 4 identifiers instantly.'],
  ['Copy them', 'Copy any single UUID, or copy the whole list at once.'],
];

const features = [
  'Generate random UUID version 4 identifiers instantly.',
  'Create up to 100 UUIDs at once for bulk needs.',
  'Optional uppercase output.',
  'Copy a single UUID or the entire list with one click.',
  'Uses secure randomness from your browser, so UUIDs are never uploaded.',
  'Completely free with no signup and no limits.',
];

const faqs = [
  ['How do I generate a UUID for free?', 'Choose how many you need and click Generate. Craftora creates random UUID v4 identifiers instantly. It is free, runs in your browser, and nothing is uploaded.'],
  ['What is a UUID?', 'A UUID (universally unique identifier) is a 128-bit value used to label things uniquely, like database records, files, or API objects, with almost no chance of two being the same.'],
  ['What is UUID version 4?', 'UUID v4 is the random version. Its digits are generated from secure random numbers, which makes it the most common choice when you just need a unique ID and do not need it tied to time or hardware.'],
  ['Are these UUIDs truly unique?', 'UUID v4 has so many possible values that the chance of a collision is effectively zero for normal use. You can generate as many as you like without worrying about duplicates.'],
  ['Can I generate many UUIDs at once?', 'Yes. Set the count up to 100 and generate them all in one click, then copy the whole list.'],
  ['Do I need to sign up?', 'No. The UUID generator is free with no account and no limits.'],
];

export default function UuidGeneratorPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <UuidGeneratorTool />
    </ToolPage>
  );
}
