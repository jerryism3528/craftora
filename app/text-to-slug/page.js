import ToolPage from '../../components/ToolPage';
import TextToSlugTool from '../../components/TextToSlugTool';
import { getTool } from '../../lib/tools';

const tool = getTool('text-to-slug');

export const metadata = {
  title: 'Text to Slug: Free URL Slug Generator',
  description:
    'Free URL slug generator. Turn any title or text into a clean, SEO-friendly slug with lowercase letters and hyphens. Handles accents and special characters. Runs in your browser, no signup.',
  alternates: { canonical: '/text-to-slug' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Text to Slug: Free URL Slug Generator | Craftora',
    description: 'Convert any title into a clean, SEO-friendly URL slug instantly. Free, private, no signup.',
    url: 'https://craftora.dev/text-to-slug',
    type: 'website',
  },
};

const howItWorks = [
  ['Enter your text', 'Type or paste a title, heading, or any text you want to turn into a URL slug.'],
  ['Pick a separator', 'Choose a hyphen (the SEO standard) or an underscore to join the words.'],
  ['Copy the slug', 'The clean slug updates live. Copy it and use it in your page URL.'],
];

const features = [
  'Turn any title into a clean, lowercase URL slug instantly.',
  'Removes special characters, punctuation, and extra spaces.',
  'Handles accented letters by converting them to plain equivalents.',
  'Choose hyphens (recommended for SEO) or underscores.',
  'Runs entirely in your browser, so your text is never uploaded.',
  'Completely free with no signup and no limits.',
];

const faqs = [
  ['What is a URL slug?', 'A slug is the readable part of a URL that identifies a page, like "how-to-merge-pdf" in craftora.dev/how-to-merge-pdf. A clean slug is short, lowercase, and uses hyphens between words.'],
  ['How do I create an SEO-friendly slug?', 'Enter your title and Craftora produces a lowercase, hyphen-separated slug with special characters removed. Keep it short and keyword-focused for the best results. It is free and runs in your browser.'],
  ['Should I use hyphens or underscores in a URL?', 'Hyphens. Google treats hyphens as word separators but reads underscores as joining words together, so hyphens are the SEO standard for slugs. Craftora defaults to hyphens.'],
  ['Does it handle accented and non-English characters?', 'Yes. Accented letters are converted to their plain equivalents (for example é becomes e), and other special characters are removed, so the slug stays clean and URL-safe.'],
  ['Is my text private?', 'Yes. The slug is generated entirely in your browser on your own device. Your text is never sent to a server.'],
  ['Do I need to sign up?', 'No. The text to slug tool is free with no account and no limits.'],
];

export default function TextToSlugPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <TextToSlugTool />
    </ToolPage>
  );
}
