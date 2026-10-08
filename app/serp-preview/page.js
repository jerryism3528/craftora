import ToolPage from '../../components/ToolPage';
import SerpPreviewTool from '../../components/SerpPreviewTool';
import { getTool } from '../../lib/tools';

const tool = getTool('serp-preview');

export const metadata = {
  title: 'SERP Snippet Preview: Test Your Google Result Free',
  description:
    'Free SERP snippet preview tool. See how your title and meta description look in Google search results on desktop and mobile, with pixel-width warnings for truncation. Runs in your browser, no signup.',
  alternates: { canonical: '/serp-preview' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'SERP Snippet Preview: Test Your Google Result Free | Craftora',
    description: 'Preview your Google search snippet on desktop and mobile, with truncation warnings. Free, no signup.',
    url: 'https://craftora.dev/serp-preview',
    type: 'website',
  },
};

const howItWorks = [
  ['Enter your snippet', 'Type your page title, URL, and meta description into the fields.'],
  ['Switch device', 'Toggle between desktop and mobile to see how the snippet looks on each.'],
  ['Fix any truncation', 'Craftora warns you when the title or description is too long to display in full, so you can trim it.'],
];

const features = [
  'Live preview of your Google search snippet as you type.',
  'Separate desktop and mobile views.',
  'Pixel-width based truncation, the way Google actually cuts titles.',
  'Warnings when your title or description will be shortened.',
  'Clean breadcrumb-style URL preview.',
  'Runs entirely in your browser. Free with no signup and no limits.',
];

const faqs = [
  ['How do I preview my Google search result for free?', 'Enter your title, URL, and meta description, and Craftora shows a live snippet preview for desktop and mobile. It warns you if anything will be cut off. It is free and runs in your browser.'],
  ['Why is my title being cut off in Google?', 'Google truncates titles by pixel width, not character count, at roughly 600 pixels on desktop. Titles with many wide letters get cut sooner. This tool measures pixel width and warns you before it happens.'],
  ['What is the ideal title and description length?', 'Aim for a title under about 600 pixels (roughly 55 to 60 characters) and a description that fits in one or two lines (around 150 to 160 characters). The preview and counters here keep you in range.'],
  ['Does Google always show my exact title and description?', 'Not always. Google may rewrite the title or pull a different description snippet based on the search query. Writing a clear, relevant title and description gives you the best chance of it being used as written.'],
  ['Is the preview exact?', 'It is a close approximation of Google\'s layout and truncation. Actual results vary slightly by browser, query, and Google updates, but it is accurate enough to optimize your snippets confidently.'],
  ['Do I need to sign up?', 'No. The SERP snippet preview tool is free with no account and no limits.'],
];

export default function SerpPreviewPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <SerpPreviewTool />
    </ToolPage>
  );
}
