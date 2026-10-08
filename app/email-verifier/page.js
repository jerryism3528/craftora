import ToolPage from '../../components/ToolPage';
import EmailVerifierTool from '../../components/EmailVerifierTool';
import { getTool } from '../../lib/tools';

const tool = getTool('email-verifier');

export const metadata = {
  title: 'Email Verifier: Check if an Email Is Valid Free',
  description:
    'Free email verifier. Check whether an email address is valid and deliverable in real time, with a clear safe, risky, or invalid result. Detects disposable and role accounts. No email is ever sent.',
  alternates: { canonical: '/email-verifier' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Email Verifier: Check if an Email Is Valid Free | Craftora',
    description: 'Verify email addresses in real time and see if they are valid and deliverable. Free with a Craftora account.',
    url: 'https://craftora.dev/email-verifier',
    type: 'website',
  },
};

const howItWorks = [
  ['Paste your emails', 'Enter one or more email addresses, one per line or comma-separated.'],
  ['Verify in real time', 'Craftora checks each address against its actual mail server and returns a clear status.'],
  ['Read and export', 'See which are safe, risky, or invalid, filter the results, and export them to CSV.'],
];

const features = [
  'Real-time verification against the actual mail server (SMTP), not just a format check.',
  'Clear results: Safe, Risky, Invalid, or Unknown, each with a plain-English reason.',
  'Detects disposable addresses, role accounts (like info@), and catch-all domains.',
  'Verify up to 50 addresses at a time and export the results to CSV.',
  'No email is ever sent during verification.',
  'Free with a Craftora account, 50 checks per day.',
];

const faqs = [
  ['How does email verification work?', 'Craftora connects to the mail server behind an address and asks whether the mailbox exists, without sending any email. It checks the format, the domain\'s mail records (MX), and the mailbox itself, then returns a clear status.'],
  ['What do Safe, Risky, and Invalid mean?', 'Safe means the address is valid and can receive mail. Invalid means the mailbox does not exist or the domain cannot receive email. Risky means it may work but is uncertain, for example a catch-all domain, a role account, or a full mailbox.'],
  ['Do you send an email to verify it?', 'No. Verification uses an SMTP conversation with the mail server that stops before any message is sent. The person you are checking receives nothing.'],
  ['Why do I need an account?', 'Email verification connects to real mail servers, so it needs limits to stay fast and free and to prevent abuse. A free Craftora account gives you 50 checks per day. Browser-based tools on Craftora need no account.'],
  ['What is a catch-all domain?', 'A catch-all domain accepts mail for any address, so the server says yes even for addresses that do not really exist. Craftora flags these as risky because deliverability cannot be guaranteed.'],
  ['Can I verify a whole list at once?', 'The single verifier handles up to 50 addresses at a time. For larger lists, use the Bulk Email Verifier, which is built for batches.'],
];

export default function EmailVerifierPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <EmailVerifierTool />
    </ToolPage>
  );
}
