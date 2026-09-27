import ToolPage from '../../components/ToolPage';
import CaseConverterTool from '../../components/CaseConverterTool';
import { getTool } from '../../lib/tools';

const tool = getTool('case-converter');

export const metadata = {
  title: 'Case Converter: Change Text Case Online Free',
  description:
    'Free online case converter. Change text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case instantly. Runs in your browser, no signup, nothing uploaded.',
  alternates: { canonical: '/case-converter' },
  openGraph: {
    title: 'Case Converter: Change Text Case Online Free | Craftora',
    description: 'Convert text to uppercase, lowercase, title case, camelCase, snake_case, and more. Free, no signup.',
    url: 'https://craftora.dev/case-converter',
    type: 'website',
  },
};

const howItWorks = [
  ['Enter your text', 'Type or paste the text you want to reformat into the box.'],
  ['Pick a case', 'Click any case option: UPPERCASE, lowercase, Title Case, Sentence case, or a code style like camelCase.'],
  ['Copy the result', 'The text updates in place. Copy it out with one click.'],
];

const features = [
  'Convert to UPPERCASE, lowercase, Title Case, and Sentence case.',
  'Developer styles too: camelCase, PascalCase, snake_case, and kebab-case.',
  'Chain conversions, each button transforms the current text.',
  'Copy the result with one click.',
  'Runs entirely in your browser, so your text is never uploaded.',
  'Completely free with no signup and no limits.',
];

const faqs = [
  ['How do I change text to uppercase or lowercase for free?', 'Paste your text and click UPPERCASE or lowercase. The text converts instantly. It is free, runs in your browser, and nothing is uploaded.'],
  ['What is Title Case versus Sentence case?', 'Title Case capitalizes the first letter of every word, like a headline. Sentence case capitalizes only the first letter of each sentence, like normal writing.'],
  ['What are camelCase, snake_case, and kebab-case?', 'These are naming styles used in code. camelCase joins words with capitals (myVariableName), snake_case joins them with underscores (my_variable_name), and kebab-case joins them with hyphens (my-variable-name).'],
  ['Can I convert text I copied from a document?', 'Yes. Paste text from any source, then pick a case. This is handy for fixing text that came in all caps or in the wrong format.'],
  ['Is my text private?', 'Yes. All conversion happens in your browser on your own device. Your text is never sent to any server.'],
  ['Do I need to sign up?', 'No. The case converter is free with no account and no limits.'],
];

export default function CaseConverterPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <CaseConverterTool />
    </ToolPage>
  );
}
