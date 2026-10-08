import ToolPage from '../../components/ToolPage';
import TextCompareTool from '../../components/TextCompareTool';
import { getTool } from '../../lib/tools';

const tool = getTool('text-compare');

export const metadata = {
  title: 'Text Compare: Find the Difference Between Two Texts',
  description:
    'Free online text compare tool. Paste two blocks of text and see the differences line by line, with added and removed lines highlighted. Runs in your browser, no signup, nothing uploaded.',
  alternates: { canonical: '/text-compare' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Text Compare: Find the Difference Between Two Texts | Craftora',
    description: 'Compare two blocks of text and spot every difference, highlighted line by line. Free, private, no signup.',
    url: 'https://craftora.dev/text-compare',
    type: 'website',
  },
};

const howItWorks = [
  ['Paste both versions', 'Put the original text on the left and the changed text on the right.'],
  ['Compare', 'Click Compare to see a line-by-line diff with added and removed lines highlighted.'],
  ['Review the changes', 'Green lines were added, red lines were removed, and unchanged lines stay plain.'],
];

const features = [
  'Compare two blocks of text and see the differences instantly.',
  'Added lines are highlighted in green, removed lines in red.',
  'Shows a count of how many lines were added and removed.',
  'Handles anything from a sentence to a long document.',
  'Runs entirely in your browser, so your text is never uploaded.',
  'Completely free with no signup and no limits.',
];

const faqs = [
  ['How do I compare two texts online for free?', 'Paste the original text on the left and the changed text on the right, then click Compare. Craftora highlights every added and removed line. It is free, private, and runs in your browser.'],
  ['What do the colors mean?', 'Green lines with a plus sign were added in the second version. Red lines with a minus sign were removed from the first version. Lines with no color are unchanged.'],
  ['Can I compare two versions of a document?', 'Yes. Paste each version into a box and compare. It is useful for spotting edits between drafts, contract versions, code snippets, or config files.'],
  ['Does it compare word by word or line by line?', 'This tool compares line by line, which is the clearest way to see structural changes. Each line is marked as added, removed, or unchanged.'],
  ['Is my text private?', 'Yes. The comparison runs entirely in your browser on your own device. Neither block of text is ever sent to a server.'],
  ['Do I need to sign up?', 'No. The text compare tool is free with no account and no limits.'],
];

export default function TextComparePage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <TextCompareTool />
    </ToolPage>
  );
}
