import ToolPage from '../../components/ToolPage';
import UrlEncodeTool from '../../components/UrlEncodeTool';
import { getTool } from '../../lib/tools';

const tool = getTool('url-encode-decode');

export const metadata = {
  title: 'URL Encode and Decode Online Free',
  description:
    'Free online URL encoder and decoder. Encode text and URLs for safe use in links and query strings, and decode percent-encoded URLs back to readable text. Runs in your browser, no signup, nothing uploaded.',
  alternates: { canonical: '/url-encode-decode' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'URL Encode and Decode Online Free | Craftora',
    description: 'Encode or decode URLs and query strings free, right in your browser. No uploads, no signup.',
    url: 'https://craftora.dev/url-encode-decode',
    type: 'website',
  },
};

const howItWorks = [
  ['Enter your text or URL', 'Type or paste text to encode, or paste a percent-encoded URL you want to decode.'],
  ['Pick a mode and action', 'Choose Component for a single query value or Full URL for a whole address, then Encode or Decode.'],
  ['Copy the result', 'Copy the output, or send it back as input to chain encode and decode steps.'],
];

const features = [
  'Encode text and URLs so they are safe to use in links and query strings.',
  'Decode percent-encoded URLs (like %20 and %2F) back to readable text.',
  'Component mode for single query values, Full URL mode to keep : / ? # intact.',
  'Send the output back to the input to chain conversions.',
  'Runs entirely in your browser, so your data is never uploaded.',
  'Completely free with no signup and no limits.',
];

const faqs = [
  ['How do I URL encode text for free?', 'Type or paste your text, pick a mode, and click Encode. The URL-safe encoded result appears instantly. It is free, runs in your browser, and nothing is uploaded.'],
  ['How do I decode a URL?', 'Paste the encoded URL into the input box and click Decode. Percent codes like %20 turn back into spaces and the original text is restored.'],
  ['What is the difference between component and full URL mode?', 'Component mode encodes everything, which is right for a single query parameter value. Full URL mode leaves structural characters like : / ? # alone, which is right when encoding a complete web address.'],
  ['What does %20 mean in a URL?', 'It is the encoded form of a space. URLs cannot contain raw spaces, so they are replaced with %20. Decoding turns them back into spaces.'],
  ['Is my data safe?', 'Yes. Encoding and decoding run entirely in your browser on your own device. Your text is never sent to any server.'],
  ['Do I need to sign up?', 'No. The URL encoder and decoder is free with no account and no limits.'],
];

export default function UrlEncodeDecodePage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <UrlEncodeTool />
    </ToolPage>
  );
}
