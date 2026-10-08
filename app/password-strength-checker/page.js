import ToolPage from '../../components/ToolPage';
import PasswordStrengthTool from '../../components/PasswordStrengthTool';
import { getTool } from '../../lib/tools';

const tool = getTool('password-strength-checker');

export const metadata = {
  title: 'Password Strength Checker: Test Your Password Free',
  description:
    'Free password strength checker. Test how strong your password is, see the estimated time to crack it, and get tips to improve it. Checked entirely in your browser, never uploaded, no signup.',
  alternates: { canonical: '/password-strength-checker' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Password Strength Checker: Test Your Password Free | Craftora',
    description: 'Test your password strength and crack time, with tips to improve it. Private, in your browser, no signup.',
    url: 'https://craftora.dev/password-strength-checker',
    type: 'website',
  },
};

const howItWorks = [
  ['Type a password', 'Enter or paste the password you want to test. Use the eye icon to show or hide it.'],
  ['See the score', 'Get an instant strength rating, an entropy estimate, and an estimated time to crack it.'],
  ['Follow the tips', 'Craftora lists exactly what to change (length, symbols, and more) to make it stronger.'],
];

const features = [
  'Instant strength rating from very weak to very strong.',
  'Estimated time to crack the password in an offline attack.',
  'Checks length and character variety with a clear checklist.',
  'Flags common passwords, repeats, and predictable sequences.',
  'Specific, actionable tips to improve any weak password.',
  'Checked entirely in your browser and never uploaded. Free, no signup.',
];

const faqs = [
  ['How do I check my password strength for free?', 'Type or paste your password and Craftora rates it instantly, shows how long it would take to crack, and tells you how to make it stronger. It is free and checked entirely in your browser.'],
  ['Is it safe to type my password into this tool?', 'Yes. The check runs entirely on your own device in the browser. Your password is never sent to a server, logged, or stored. That said, as a habit, never enter a real password into a tool you do not trust.'],
  ['What does the crack time mean?', 'It estimates how long a fast offline attack (billions of guesses per second) would take to find your password by brute force. Longer and more varied passwords push this from seconds to millions of years.'],
  ['What is entropy?', 'Entropy measures how unpredictable a password is, in bits. More bits means more possible combinations and a harder password to guess. Around 70 bits or more is considered strong.'],
  ['Why is my long password still rated weak?', 'Length helps, but common words, repeated characters, and sequences like "123" or "abc" are easy to guess and lower the score. The tips will point out exactly what to fix.'],
  ['Do I need to sign up?', 'No. The password strength checker is free with no account and no limits.'],
];

export default function PasswordStrengthCheckerPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <PasswordStrengthTool />
    </ToolPage>
  );
}
