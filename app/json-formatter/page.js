import ToolPage from '../../components/ToolPage';
import JsonFormatterTool from '../../components/JsonFormatterTool';
import { getTool } from '../../lib/tools';

const tool = getTool('json-formatter');

export const metadata = {
  title: 'JSON Formatter: Format, Validate, and Beautify JSON Free',
  description:
    'Free online JSON formatter and validator. Beautify, format, and minify JSON, and check for errors instantly. Runs in your browser with no signup, and your data is never uploaded.',
  alternates: { canonical: '/json-formatter' },
  openGraph: {
    title: 'JSON Formatter: Format, Validate, and Beautify JSON Free | Craftora',
    description: 'Beautify, validate, and minify JSON free, right in your browser. No uploads, no signup.',
    url: 'https://craftora.dev/json-formatter',
    type: 'website',
  },
};

const howItWorks = [
  ['Paste your JSON', 'Paste your JSON, or messy minified JSON, into the input box on the left.'],
  ['Format or minify', 'Click Format to beautify it with clean indentation, or Minify to compress it into one line.'],
  ['Copy or download', 'Copy the result or download it as a .json file. Invalid JSON is flagged with the exact error.'],
];

const features = [
  'Beautify and indent JSON so it is easy to read.',
  'Minify JSON into a single compact line to save space.',
  'Validate JSON instantly and see the exact error if it is invalid.',
  'Copy the result or download it as a .json file.',
  'Runs entirely in your browser, so your data is never uploaded.',
  'Completely free with no signup and no limits.',
];

const faqs = [
  ['How do I format JSON for free?', 'Paste your JSON into the input box and click Format. It is beautified with clean indentation instantly. It is free, works in your browser, and nothing is uploaded.'],
  ['How do I validate JSON?', 'Just paste it and click Format. If the JSON is invalid, Craftora shows the exact error message and where it failed, so you can fix it quickly.'],
  ['What is the difference between format and minify?', 'Format (beautify) adds indentation and line breaks to make JSON readable. Minify strips all whitespace to make the smallest possible file, which is useful for saving space or sending over a network.'],
  ['Is my data safe?', 'Yes. The JSON formatter runs entirely in your browser on your own device. Your data is never sent to any server, so even sensitive JSON stays private.'],
  ['Is there a size limit?', 'There is no fixed limit. You can format JSON as large as your browser can comfortably handle.'],
  ['Do I need to sign up?', 'No. Craftora JSON formatter is free to use with no account and no limits.'],
];

export default function JsonFormatterPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <JsonFormatterTool />
    </ToolPage>
  );
}
