import ToolPage from '../../components/ToolPage';
import TestCardGeneratorTool from '../../components/TestCardGeneratorTool';
import { getTool } from '../../lib/tools';

const tool = getTool('test-card-generator');

export const metadata = {
  title: 'Test Card Generator: Free Luhn-Valid Test Cards',
  description:
    'Free test card generator for developers. Create Luhn-valid fake credit card numbers with expiry and CVV to test checkout and payment forms. Visa, Mastercard, Amex, Discover, JCB. Runs in your browser, no signup.',
  alternates: { canonical: '/test-card-generator' },
  openGraph: {
    title: 'Test Card Generator: Free Luhn-Valid Test Cards | Craftora',
    description: 'Generate fake, Luhn-valid test card numbers for checkout testing. Visa, Mastercard, Amex, and more. Free, no signup.',
    url: 'https://craftora.dev/test-card-generator',
    type: 'website',
  },
};

const howItWorks = [
  ['Pick a card network', 'Choose Visa, Mastercard, Amex, Discover, or JCB, and how many test cards you need.'],
  ['Generate', 'Click Generate to create Luhn-valid fake card numbers, each with a random expiry date and CVV.'],
  ['Copy into your tests', 'Copy any card number and drop it into your checkout form or automated tests.'],
];

const features = [
  'Generate Luhn-valid test card numbers that pass standard validation.',
  'Supports Visa, Mastercard, American Express, Discover, and JCB formats.',
  'Each card comes with a random future expiry date and a matching CVV length.',
  'Create up to 20 cards at once.',
  'Runs entirely in your browser, nothing is uploaded or stored.',
  'Completely free with no signup and no limits.',
];

const faqs = [
  ['What is a test card generator?', 'It creates fake credit card numbers that follow the same format and Luhn checksum rules as real cards, so developers can test checkout forms, validation, and payment code without using a real card.'],
  ['Are these real credit card numbers?', 'No. They are randomly generated fake numbers that only pass the Luhn format check. They are not linked to any real account, hold no funds, and cannot be used to buy anything. They exist purely for testing.'],
  ['What is the Luhn check?', 'The Luhn algorithm is a simple checksum used to catch typos in card numbers. A valid card number passes it. This tool builds numbers that pass the Luhn check so your validation code accepts them during testing.'],
  ['Can I use these for real purchases?', 'No, and you should not try. These numbers have no funds and are not issued by any bank. For real payment testing, use the official test cards from your payment processor (like Stripe or PayPal) in their sandbox mode.'],
  ['Which card networks are supported?', 'Visa, Mastercard, American Express, Discover, and JCB. Each uses the correct starting digits and length so the format matches that network.'],
  ['Is this legal to use?', 'Yes. Generating format-valid fake numbers for software testing is a standard, legitimate developer task. Using real or stolen card data is illegal, but these random test numbers are not tied to anyone.'],
];

export default function TestCardGeneratorPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <TestCardGeneratorTool />
    </ToolPage>
  );
}
