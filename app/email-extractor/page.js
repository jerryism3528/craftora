import ToolPage from '../../components/ToolPage';
import EmailExtractorTool from '../../components/EmailExtractorTool';
import { getTool } from '../../lib/tools';

const tool = getTool('email-extractor');

export const metadata = {
  title: 'Email Extractor: Extract Emails From Text Free',
  description:
    'Free email extractor. Paste any text and pull out every email address instantly, with duplicates removed. Copy or download the list as TXT or CSV. Runs in your browser, no signup, nothing uploaded.',
  alternates: { canonical: '/email-extractor' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Email Extractor: Extract Emails From Text Free | Craftora',
    description: 'Extract all email addresses from any text instantly, deduped and ready to copy or download. Free, no signup.',
    url: 'https://craftora.dev/email-extractor',
    type: 'website',
  },
};

const howItWorks = [
  ['Paste your text', 'Paste any text, list, or content that contains email addresses into the box.'],
  ['Emails appear instantly', 'Craftora finds every email address, removes duplicates, and lists them on the right.'],
  ['Copy or download', 'Copy the whole list, or download it as a TXT or CSV file.'],
];

const features = [
  'Extract every email address from any block of text instantly.',
  'Removes duplicate addresses automatically.',
  'Optional lowercase and A-to-Z sorting.',
  'Live count of how many emails were found.',
  'Copy the whole list or download it as TXT or CSV.',
  'Runs entirely in your browser, so your text is never uploaded. Free, no signup.',
];

const faqs = [
  ['How do I extract emails from text for free?', 'Paste your text into the box and Craftora instantly pulls out every email address, with duplicates removed. Copy or download the list. It is free, runs in your browser, and nothing is uploaded.'],
  ['Can I extract emails from a website or URL?', 'The text extractor works on any text you paste, including content copied from a web page. Extracting straight from a URL or a whole website is coming soon through the free Craftora Chrome extension, which scans the page you are viewing in one click.'],
  ['Does it remove duplicate emails?', 'Yes. Every email is deduplicated automatically, so each address appears only once in your list no matter how many times it shows up in the text.'],
  ['Is my text private?', 'Yes. Extraction happens entirely in your browser on your own device. Your text is never sent to any server, so even sensitive content stays private.'],
  ['What can I do with the extracted list?', 'You can copy it, download it as TXT or CSV, or verify it. After extracting, use the Bulk Email Verifier to check which addresses are valid before you send anything.'],
  ['Do I need to sign up?', 'No. The email extractor is free with no account and no limits. Only server tools like the email verifier need a free account.'],
];

export default function EmailExtractorPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <EmailExtractorTool />
    </ToolPage>
  );
}
