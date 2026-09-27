import ToolPage from '../../components/ToolPage';
import WordCounterTool from '../../components/WordCounterTool';
import { getTool } from '../../lib/tools';

const tool = getTool('word-counter');

export const metadata = {
  title: 'Word Counter: Count Words and Characters Free',
  description:
    'Free online word counter. Count words, characters, sentences, and paragraphs in real time, plus reading time. Perfect for essays, articles, and social posts. Runs in your browser, no signup.',
  alternates: { canonical: '/word-counter' },
  openGraph: {
    title: 'Word Counter: Count Words and Characters Free | Craftora',
    description: 'Count words, characters, sentences, and paragraphs in real time, with reading time. Free, no signup.',
    url: 'https://craftora.dev/word-counter',
    type: 'website',
  },
};

const howItWorks = [
  ['Type or paste your text', 'Write directly in the box or paste text from anywhere. The counts update instantly.'],
  ['See every count', 'Words, characters, characters without spaces, sentences, paragraphs, and reading time all update live.'],
  ['Copy or clear', 'Copy your text back out or clear the box to start again.'],
];

const features = [
  'Live word and character count that updates as you type.',
  'Counts characters with and without spaces.',
  'Counts sentences and paragraphs too.',
  'Estimates reading time and speaking time.',
  'Runs entirely in your browser, so your text is never uploaded.',
  'Completely free with no signup and no limits.',
];

const faqs = [
  ['How do I count words online for free?', 'Just type or paste your text into the box. Craftora counts the words, characters, sentences, and paragraphs live as you type. It is free, runs in your browser, and nothing is uploaded.'],
  ['Does it count characters with and without spaces?', 'Yes. Craftora shows both the total character count (including spaces) and the count without spaces, which is useful for platforms and forms that limit either one.'],
  ['How is reading time calculated?', 'Reading time is based on an average reading speed of about 200 words per minute. Speaking time uses about 130 words per minute, which is handy for scripts and presentations.'],
  ['Is there a character limit for social media?', 'Craftora helps you stay under common limits. For reference, X (Twitter) posts are 280 characters, and meta descriptions are best kept near 160. The live count makes it easy to trim to any target.'],
  ['Is my text private?', 'Yes. All counting happens in your browser on your own device. Your text is never sent to any server, so even sensitive drafts stay private.'],
  ['Do I need to sign up?', 'No. The word counter is free with no account and no limits.'],
];

export default function WordCounterPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <WordCounterTool />
    </ToolPage>
  );
}
