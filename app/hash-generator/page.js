import ToolPage from '../../components/ToolPage';
import HashGeneratorTool from '../../components/HashGeneratorTool';
import { getTool } from '../../lib/tools';

const tool = getTool('hash-generator');

export const metadata = {
  title: 'Hash Generator: MD5, SHA-1, SHA-256 Online Free',
  description:
    'Free online hash generator. Create MD5, SHA-1, SHA-256, and SHA-512 hashes from any text instantly. Runs in your browser with no signup, and your text is never uploaded.',
  alternates: { canonical: '/hash-generator' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Hash Generator: MD5, SHA-1, SHA-256 Online Free | Craftora',
    description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text, free and instant, right in your browser.',
    url: 'https://craftora.dev/hash-generator',
    type: 'website',
  },
};

const howItWorks = [
  ['Enter your text', 'Type or paste the text you want to hash into the box.'],
  ['Generate the hashes', 'Click Generate and Craftora computes the MD5, SHA-1, SHA-256, and SHA-512 hashes at once.'],
  ['Copy what you need', 'Each hash has its own copy button, so you can grab exactly the one you need.'],
];

const features = [
  'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from any text.',
  'All four hashes are computed at once for easy comparison.',
  'Copy any individual hash with one click.',
  'SHA hashes use the secure hashing built into your browser.',
  'Runs entirely in your browser, so your text is never uploaded.',
  'Completely free with no signup and no limits.',
];

const faqs = [
  ['How do I generate a hash for free?', 'Type or paste your text and click Generate hashes. Craftora produces MD5, SHA-1, SHA-256, and SHA-512 instantly. It is free, runs in your browser, and nothing is uploaded.'],
  ['What is a hash used for?', 'A hash is a fixed-length fingerprint of data. It is used to verify that a file or message has not changed, to store passwords safely (with SHA-256 and stronger), and to create checksums for downloads.'],
  ['Which hash should I use?', 'For anything security related, use SHA-256 or SHA-512, which are strong and modern. MD5 and SHA-1 are fine for quick checksums but are considered weak for security, so avoid them for passwords.'],
  ['Is MD5 safe to use?', 'MD5 is fast and fine for non-security checksums, like verifying a download did not corrupt. It should not be used for passwords or security, because it can be broken. Use SHA-256 instead for those.'],
  ['Is my data safe?', 'Yes. Hashing runs entirely in your browser on your own device. Your text is never sent to any server, so even sensitive input stays private.'],
  ['Do I need to sign up?', 'No. The hash generator is free with no account and no limits.'],
];

export default function HashGeneratorPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <HashGeneratorTool />
    </ToolPage>
  );
}
