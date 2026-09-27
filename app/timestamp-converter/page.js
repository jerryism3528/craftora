import ToolPage from '../../components/ToolPage';
import TimestampConverterTool from '../../components/TimestampConverterTool';
import { getTool } from '../../lib/tools';

const tool = getTool('timestamp-converter');

export const metadata = {
  title: 'Unix Timestamp Converter Online Free',
  description:
    'Free online Unix timestamp converter. Convert Unix timestamps to human-readable dates and dates back to timestamps, in seconds or milliseconds, with local and UTC time. Runs in your browser, no signup.',
  alternates: { canonical: '/timestamp-converter' },
  openGraph: {
    title: 'Unix Timestamp Converter Online Free | Craftora',
    description: 'Convert Unix timestamps to dates and back, in seconds or milliseconds, with local and UTC time. Free, no signup.',
    url: 'https://craftora.dev/timestamp-converter',
    type: 'website',
  },
};

const howItWorks = [
  ['See the current timestamp', 'The live Unix timestamp is shown at the top and updates every second. Copy it with one click.'],
  ['Convert a timestamp', 'Paste a Unix timestamp to see the local time, UTC time, ISO 8601, and how long ago or ahead it is.'],
  ['Convert a date', 'Pick any date and time to get its Unix timestamp in both seconds and milliseconds.'],
];

const features = [
  'Live current Unix timestamp, updated every second.',
  'Convert a timestamp to local time, UTC, ISO 8601, and a relative "time ago" value.',
  'Convert any date and time back into a Unix timestamp.',
  'Automatically detects seconds vs milliseconds.',
  'Copy any result with one click.',
  'Runs entirely in your browser. Free with no signup and no limits.',
];

const faqs = [
  ['How do I convert a Unix timestamp to a date?', 'Paste the timestamp into the "Timestamp to date" box and click Convert. Craftora shows the local time, UTC time, and ISO format instantly. It is free and runs in your browser.'],
  ['What is a Unix timestamp?', 'A Unix timestamp is the number of seconds that have passed since January 1, 1970 at 00:00 UTC (called the Unix epoch). It is a simple way for computers to store a moment in time as a single number.'],
  ['What is the difference between seconds and milliseconds?', 'A standard Unix timestamp is in seconds (10 digits today). Many programming languages, like JavaScript, use milliseconds (13 digits). Craftora detects which one you pasted automatically.'],
  ['How do I convert a date to a timestamp?', 'Use the "Date to timestamp" box, pick your date and time, and click Convert. You get the Unix timestamp in both seconds and milliseconds.'],
  ['Does it show UTC and local time?', 'Yes. When you convert a timestamp, Craftora shows both your local time and UTC, so you can read it either way without doing timezone math.'],
  ['Do I need to sign up?', 'No. The timestamp converter is free with no account and no limits.'],
];

export default function TimestampConverterPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <TimestampConverterTool />
    </ToolPage>
  );
}
