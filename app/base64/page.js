import ToolPage from '../../components/ToolPage';
import Base64Tool from '../../components/Base64Tool';
import { getTool } from '../../lib/tools';

const tool = getTool('base64');

export const metadata = {
  title: 'Base64 Encode and Decode Online Free',
  description:
    'Free online Base64 encoder and decoder. Convert text to Base64 and decode Base64 back to text instantly, with full UTF-8 support. Runs in your browser, no signup, and nothing is uploaded.',
  alternates: { canonical: '/base64' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Base64 Encode and Decode Online Free | Craftora',
    description: 'Encode text to Base64 or decode it back, free and instant, right in your browser. No uploads, no signup.',
    url: 'https://craftora.dev/base64',
    type: 'website',
  },
};

const howItWorks = [
  ['Enter your text', 'Type or paste text to encode, or paste a Base64 string you want to decode.'],
  ['Encode or decode', 'Click Encode to Base64, or Decode from Base64. The result appears on the right.'],
  ['Copy the result', 'Copy the output, or send it back as input with one click to chain conversions.'],
];

const features = [
  'Encode any text to Base64, including emoji and non-English characters (full UTF-8).',
  'Decode Base64 strings back to readable text.',
  'Send the output back to the input to chain encode and decode steps.',
  'Clear error message when the input is not valid Base64.',
  'Runs entirely in your browser, so your text is never uploaded.',
  'Completely free with no signup and no limits.',
];

const faqs = [
  ['How do I encode text to Base64 for free?', 'Type or paste your text in the input box and click Encode to Base64. The encoded result appears instantly. It is free, runs in your browser, and nothing is uploaded.'],
  ['How do I decode a Base64 string?', 'Paste the Base64 string into the input box and click Decode from Base64. The original text appears on the right. If the string is not valid Base64, you will see an error.'],
  ['What is Base64 used for?', 'Base64 encodes binary or text data into a plain text format that is safe to send in places that only handle text, like inside JSON, data URLs, email attachments, or API tokens.'],
  ['Does it support emoji and other languages?', 'Yes. Craftora uses full UTF-8 encoding, so emoji, accented characters, and non-Latin scripts encode and decode correctly.'],
  ['Is my data safe?', 'Yes. Encoding and decoding run entirely in your browser on your own device. Your text is never sent to any server.'],
  ['Do I need to sign up?', 'No. The Base64 tool is free with no account and no limits.'],
];

export default function Base64Page() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <Base64Tool />
    </ToolPage>
  );
}
