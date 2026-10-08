import ToolPage from '../../components/ToolPage';
import BulkEmailVerifierTool from '../../components/BulkEmailVerifierTool';
import { getTool } from '../../lib/tools';

const tool = getTool('bulk-email-verifier');

export const metadata = {
  title: 'Bulk Email Verifier: Validate an Email List Free',
  description:
    'Free bulk email verifier. Paste a whole list and check every address against its real mail server, with safe, risky, and invalid results and CSV export. Clean your email list before you send.',
  alternates: { canonical: '/bulk-email-verifier' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Bulk Email Verifier: Validate an Email List Free | Craftora',
    description: 'Verify a whole email list in batches, filter safe, risky, and invalid, and export to CSV. Free with an account.',
    url: 'https://craftora.dev/bulk-email-verifier',
    type: 'website',
  },
};

const howItWorks = [
  ['Paste your list', 'Paste your email addresses, one per line or comma-separated. Duplicates are removed automatically.'],
  ['Verify in batches', 'Craftora checks each address against its real mail server, with a live progress bar.'],
  ['Filter and export', 'Filter by safe, risky, or invalid, then export the clean results to CSV.'],
];

const features = [
  'Verify a whole email list, processed in batches with a live progress bar.',
  'Real mail-server (SMTP) checks, not just format validation.',
  'Clear results: Safe, Risky, Invalid, or Unknown, with reasons.',
  'Detects disposable addresses, role accounts, and catch-all domains.',
  'Filter the list by status and export everything to CSV.',
  'No email is ever sent. Free with a Craftora account, 50 checks per day.',
];

const faqs = [
  ['How do I verify a list of emails at once?', 'Paste your whole list into the box and click Verify. Craftora processes the addresses in batches, checks each against its real mail server, and shows a progress bar. When it is done, you can filter and export the results.'],
  ['How many emails can I verify per day?', 'A free Craftora account includes 50 email checks per day, shared across the single and bulk verifiers. The bulk verifier processes them in batches of 25. Only successful checks count toward your limit.'],
  ['What do the results mean?', 'Safe means the address is valid and can receive mail. Invalid means the mailbox does not exist or the domain cannot receive email. Risky means delivery is uncertain, for example a catch-all domain or a role account. Unknown means the server did not respond clearly.'],
  ['Do you send emails to verify the list?', 'No. Verification uses an SMTP conversation that stops before any message is sent. Nobody on your list receives anything.'],
  ['Why should I clean my email list?', 'Sending to invalid addresses hurts your sender reputation and can get your emails sent to spam or blocked. Removing invalid and risky addresses before a campaign improves deliverability and protects your domain.'],
  ['Can I export the results?', 'Yes. After verification you can export the full results to a CSV file, with each address, its status, the reason, and any flags, ready to import into your email tool.'],
];

export default function BulkEmailVerifierPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <BulkEmailVerifierTool />
    </ToolPage>
  );
}
