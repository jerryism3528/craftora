import ToolPage from '../../components/ToolPage';
import RemoveLineBreaksTool from '../../components/RemoveLineBreaksTool';
import { getTool } from '../../lib/tools';

const tool = getTool('remove-line-breaks');

export const metadata = {
  title: 'Remove Line Breaks From Text Online Free',
  description:
    'Free online tool to remove line breaks from text. Strip unwanted line breaks, keep paragraph spacing, and clean up messy pasted text in one click. Runs in your browser, no signup, nothing uploaded.',
  alternates: { canonical: '/remove-line-breaks' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Remove Line Breaks From Text Online Free | Craftora',
    description: 'Strip unwanted line breaks and clean up messy text while keeping paragraphs. Free, private, no signup.',
    url: 'https://craftora.dev/remove-line-breaks',
    type: 'website',
  },
};

const howItWorks = [
  ['Paste your text', 'Paste the text with unwanted line breaks into the input box.'],
  ['Choose your options', 'Keep paragraph breaks and remove extra spaces, or strip every break for one solid block.'],
  ['Copy the clean text', 'Click Remove line breaks, then copy the tidy result.'],
];

const features = [
  'Remove unwanted line breaks from pasted or copied text.',
  'Option to keep paragraph breaks so structure is preserved.',
  'Option to clean up double spaces and stray whitespace.',
  'Turn a broken-up block into clean, flowing text in one click.',
  'Runs entirely in your browser, so your text is never uploaded.',
  'Completely free with no signup and no limits.',
];

const faqs = [
  ['How do I remove line breaks from text for free?', 'Paste your text, choose whether to keep paragraph breaks, and click Remove line breaks. Craftora joins the lines into clean text you can copy. It is free and runs in your browser.'],
  ['Why does text get broken-up line breaks when I copy it?', 'Copying from PDFs, emails, and some websites often adds a line break at the end of every visible line, not just at real paragraph ends. This tool removes those extra breaks so the text flows normally again.'],
  ['Can I keep the paragraphs?', 'Yes. Turn on "Keep paragraph breaks" and Craftora only removes the single line breaks inside paragraphs, leaving the blank lines between paragraphs intact.'],
  ['Does it remove extra spaces too?', 'If you enable "Remove extra spaces," it collapses double spaces and trims stray whitespace, which is common in text copied from formatted documents.'],
  ['Is my text private?', 'Yes. The cleanup runs entirely in your browser on your own device. Your text is never sent to any server.'],
  ['Do I need to sign up?', 'No. The remove line breaks tool is free with no account and no limits.'],
];

export default function RemoveLineBreaksPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <RemoveLineBreaksTool />
    </ToolPage>
  );
}
