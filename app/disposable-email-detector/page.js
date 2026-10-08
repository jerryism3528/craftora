import ToolPage from '../../components/ToolPage';
import DisposableDetectorTool from '../../components/DisposableDetectorTool';
import { getTool } from '../../lib/tools';

const tool = getTool('disposable-email-detector');

export const metadata = {
  title: 'Disposable Email Detector: Find Temp Emails Free',
  description:
    'Free disposable email detector. Check a list of emails against a database of over 9,000 temporary and throwaway domains, then download the clean list. Catch fake signups before they cost you.',
  alternates: { canonical: '/disposable-email-detector' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Disposable Email Detector: Find Temp Emails Free | Craftora',
    description: 'Detect disposable and temporary email addresses in your list against 9,000+ known domains. Free with an account.',
    url: 'https://craftora.dev/disposable-email-detector',
    type: 'website',
  },
};

const howItWorks = [
  ['Paste your emails', 'Paste the email addresses you want to check, one per line or comma-separated.'],
  ['Detect disposables', 'Craftora checks each domain against a database of over 9,000 known disposable email services.'],
  ['Download the clean list', 'Filter out the disposable ones and download only the real, safe addresses.'],
];

const features = [
  'Checks against a database of 9,000+ disposable and temporary email domains.',
  'Instantly flags throwaway services like Mailinator, Temp-Mail, and YOPmail.',
  'Also flags role accounts (like info@ and support@) as extra intel.',
  'Filter results by safe, disposable, or invalid.',
  'Download a clean list of only the real addresses.',
  'Free with a Craftora account, 100 checks per day.',
];

const faqs = [
  ['What is a disposable email address?', 'A disposable or temporary email is a throwaway inbox from services like Mailinator or Temp-Mail. People use them to sign up for things without revealing a real address. They often expire in minutes, so they are useless for real contact and a red flag on signups.'],
  ['How does the detector work?', 'Craftora takes the domain part of each email (the part after the @) and checks it against a database of over 9,000 known disposable email domains. If the domain is on the list, the address is flagged as disposable.'],
  ['Why should I block disposable emails?', 'Disposable emails are used for fake signups, free-trial abuse, and spam. Blocking them keeps your user list real, protects promotions from abuse, and improves the quality of your leads and email deliverability.'],
  ['Does this check if the mailbox exists?', 'No. This tool checks whether the domain is a known disposable service, which is a fast domain-level check. To confirm an address is real and can receive mail, use the Email Verifier, which checks the mailbox itself.'],
  ['How current is the disposable domain list?', 'The list is based on a widely used, actively maintained open-source database of disposable domains. It covers the temp-mail services people actually use. New services appear constantly, so no list is ever perfectly complete, but this catches the vast majority.'],
  ['Do I need an account?', 'Yes. This tool runs a database lookup on the server, so a free Craftora account is needed, with 100 checks per day. Browser-only tools on Craftora need no account.'],
];

export default function DisposableEmailDetectorPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <DisposableDetectorTool />
    </ToolPage>
  );
}
