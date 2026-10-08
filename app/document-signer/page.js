import ToolPage from '../../components/ToolPage';
import DocumentSignerTool from '../../components/sign/DocumentSignerTool';
import { getTool } from '../../lib/tools';

const tool = getTool('document-signer');

export const metadata = {
  title: 'Free Document Signer: Send PDFs for E-Signature Online',
  description:
    'Free online document signing. Upload a PDF, add signers, place signature fields, and send for e-signature. Track who signed and download the signed PDF with a certificate of completion.',
  alternates: { canonical: '/document-signer' },
  openGraph: {
    title: 'Free Document Signer: Send PDFs for E-Signature | Craftora',
    description: 'Request signatures on any PDF for free. Track every signer and get a signed PDF with an audit certificate.',
    url: 'https://craftora.dev/document-signer',
    type: 'website',
  },
};

const howItWorks = [
  ['Upload your PDF', 'Sign in and upload a contract, agreement, form, or any PDF up to 20 MB and 50 pages.'],
  ['Add signers and fields', 'Enter each signer\'s name and email, then click to place signature, initials, date, name, text, and checkbox fields on the pages.'],
  ['Send and get it signed', 'Signers get a private link by email and sign on any device without an account. You get the signed PDF with a certificate of completion.'],
];

const features = [
  'Request signatures from up to 10 people per document.',
  'Signature, initials, date, name, email, text, and checkbox fields.',
  'Draw, type, or upload a signature on phone, tablet, or computer.',
  'Optional signing order, so each person signs in turn.',
  'Live status tracking: sent, opened, signed, or declined.',
  'Reminders, void, and reuse a document as a template.',
  'Certificate of completion with timestamps, IP addresses, and an activity log.',
  'Verify any signed copy at craftora.dev/verify-document.',
  'Signers do not need an account. Free to use.',
];

const faqs = [
  ['Is this document signer really free?', 'Yes. You can send up to 10 documents a day for signature for free with a Craftora account. Signers never need an account or pay anything.'],
  ['Are electronic signatures legally binding?', 'In most countries, including the United States (ESIGN Act and UETA), the European Union (eIDAS), the United Kingdom, Canada, Australia, India, and Pakistan (Electronic Transactions Ordinance 2002), electronic signatures are legally valid for most everyday agreements. Some documents, such as wills or certain property deeds, may still need wet ink or notarization. Check the rules for your document and country.'],
  ['How do signers sign?', 'Each signer receives an email with a private link. They open the document, click the highlighted fields, draw or type their signature, agree to sign electronically, and click Finish. It works on phones too.'],
  ['What is the certificate of completion?', 'When everyone has signed, Craftora adds a final page to the PDF listing the document ID, each signer\'s name and email, when they opened and signed it, their IP address, and the full activity log. It is your proof of who signed and when.'],
  ['Can I set a signing order?', 'Yes. Turn on Set order in the editor. The second signer only gets the email after the first one signs, and so on.'],
  ['How do I verify a signed document?', 'Upload the signed PDF at craftora.dev/verify-document. If the file has not been changed since it was signed, it shows the document details and signers. Any change to the file, even re-saving it, makes the check fail.'],
  ['Is my document private?', 'Yes. Documents are only visible to you and the signers you invite through their private links. You can delete a document and its files at any time.'],
  ['What is the difference between Sign PDF and Document Signer?', 'Sign PDF lets you add your own signature to a PDF instantly in your browser, with no account. Document Signer is for getting signatures from other people by email, with tracking and a certificate.'],
];

export default function DocumentSignerPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <DocumentSignerTool />
    </ToolPage>
  );
}
