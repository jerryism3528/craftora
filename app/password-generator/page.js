import ToolPage from '../../components/ToolPage';
import PasswordGeneratorTool from '../../components/PasswordGeneratorTool';
import { getTool } from '../../lib/tools';

const tool = getTool('password-generator');

export const metadata = {
  title: 'Password Generator: Free Strong Random Passwords',
  description:
    'Free strong password generator. Create secure, random passwords with custom length, symbols, and numbers, and see the strength instantly. Generated in your browser, never uploaded, no signup.',
  alternates: { canonical: '/password-generator' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Password Generator: Free Strong Random Passwords | Craftora',
    description: 'Create secure random passwords with a custom length and character set. Private, in your browser, no signup.',
    url: 'https://craftora.dev/password-generator',
    type: 'website',
  },
};

const howItWorks = [
  ['Set the length', 'Use the slider to choose how long your password should be, from 6 up to 64 characters.'],
  ['Pick character types', 'Toggle lowercase, uppercase, numbers, and symbols to match the rules of the site you are using.'],
  ['Copy your password', 'A strong password is generated instantly with a strength meter. Copy it with one click.'],
];

const features = [
  'Generate strong, random passwords instantly.',
  'Adjustable length from 6 to 64 characters.',
  'Toggle lowercase, uppercase, numbers, and symbols.',
  'Live strength meter based on real entropy.',
  'Uses your browser\'s secure random generator, nothing is uploaded or stored.',
  'Completely free with no signup and no limits.',
];

const faqs = [
  ['How do I generate a strong password for free?', 'Set your length, pick the character types, and Craftora creates a secure random password instantly. Copy it with one click. It is free, generated in your browser, and never uploaded.'],
  ['What makes a password strong?', 'Length and variety. A strong password is long (16 characters or more) and mixes uppercase, lowercase, numbers, and symbols. That makes it far harder to guess or brute-force. The strength meter here shows how you are doing.'],
  ['Are these passwords really random and safe?', 'Yes. Craftora uses your browser\'s cryptographically secure random generator (the same kind used for encryption keys), not a weak predictable one. Passwords are made on your device and never sent anywhere.'],
  ['How long should my password be?', 'Aim for at least 16 characters. Longer is stronger. For important accounts, 20 or more with all character types gives excellent protection. Use a password manager so length is not a hassle to remember.'],
  ['Do you store or see the passwords I generate?', 'No. Everything happens in your browser on your own device. Craftora never receives, logs, or stores any password you generate.'],
  ['Do I need to sign up?', 'No. The password generator is free with no account and no limits.'],
];

export default function PasswordGeneratorPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <PasswordGeneratorTool />
    </ToolPage>
  );
}
