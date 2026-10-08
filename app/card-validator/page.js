import ToolPage from '../../components/ToolPage';
import CardValidatorTool from '../../components/CardValidatorTool';
import { getTool } from '../../lib/tools';

const tool = getTool('card-validator');

export const metadata = {
  title: 'Credit Card Validator: Check Card Number Free',
  description:
    'Free credit card validator. Check if a card number is valid with the Luhn algorithm and detect the card brand (Visa, Mastercard, Amex, Discover). Runs in your browser, no signup, nothing uploaded.',
  alternates: { canonical: '/card-validator' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Credit Card Validator: Check Card Number Free | Craftora',
    description: 'Validate a card number with the Luhn check and detect its brand, free and private in your browser.',
    url: 'https://craftora.dev/card-validator',
    type: 'website',
  },
};

const howItWorks = [
  ['Enter a card number', 'Paste or type the card number. Spaces and dashes are fine, they are ignored.'],
  ['Validate', 'Click Validate to run the Luhn checksum and detect the card brand.'],
  ['Read the result', 'See whether the format is valid, which brand it is, and whether the length matches that brand.'],
];

const features = [
  'Check any card number against the Luhn algorithm instantly.',
  'Automatically detect the brand: Visa, Mastercard, Amex, Discover, JCB, and more.',
  'Confirm the number length matches the detected brand.',
  'Ignores spaces and dashes, so you can paste formatted numbers.',
  'Runs entirely in your browser and never contacts a bank or stores your input.',
  'Completely free with no signup and no limits.',
];

const faqs = [
  ['How do I check if a credit card number is valid?', 'Paste the number and click Validate. Craftora runs the Luhn checksum used by all card networks and tells you instantly if the format is valid. It is free and runs in your browser.'],
  ['Does this tell me if a card has money on it?', 'No. This checks the number format only (the Luhn checksum, brand, and length). It never contacts a bank, so it cannot tell you if a card is active, real, or has any balance. That is by design and keeps it private.'],
  ['What is the Luhn algorithm?', 'The Luhn algorithm is a checksum formula that card numbers must satisfy. It catches most typos. If a number passes it, the format is valid. If it fails, there is almost certainly a mistake in the digits.'],
  ['How does it detect the card brand?', 'Card brands use specific starting digits (called the IIN or BIN). For example, Visa cards start with 4 and Amex with 34 or 37. Craftora reads those leading digits to identify the brand.'],
  ['Is it safe to enter a card number here?', 'Yes. The check happens entirely on your own device in the browser. Nothing is sent to a server or stored. That said, only enter card numbers you have the right to check.'],
  ['Do I need to sign up?', 'No. The card validator is free with no account and no limits.'],
];

export default function CardValidatorPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <CardValidatorTool />
    </ToolPage>
  );
}
