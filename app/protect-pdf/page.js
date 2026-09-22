import ToolPage from '../../components/ToolPage';
import ProtectPdfTool from '../../components/ProtectPdfTool';
import { getTool } from '../../lib/tools';

const tool = getTool('protect-pdf');

export const metadata = {
  title: 'Protect PDF: Add a Password to a PDF Online Free',
  description:
    'Password protect a PDF online for free. Add strong AES encryption to your PDF so only people with the password can open it. No signup, no watermarks, and your file never leaves your browser.',
  alternates: { canonical: '/protect-pdf' },
  openGraph: {
    title: 'Protect PDF: Add a Password to a PDF Online Free | Craftora',
    description: 'Add a password and encryption to any PDF for free, right in your browser. No uploads, no watermarks.',
    url: 'https://craftora.dev/protect-pdf',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your PDF', 'Drop your PDF file into the box or choose it from your device. Nothing is uploaded to a server.'],
  ['Set a password', 'Type a password and confirm it. This becomes the password needed to open the PDF.'],
  ['Protect and download', 'Click protect and your encrypted PDF downloads instantly, locked with your password.'],
];

const features = [
  'Add a password so only people who know it can open your PDF.',
  'Uses AES encryption, the standard used for secure PDFs.',
  'The PDF is encrypted in your browser, so nothing is uploaded to a server.',
  'No watermarks added to your protected PDF, ever.',
  'Completely free with no signup and no daily limits.',
  'Works on desktop, tablet, and mobile browsers.',
];

const faqs = [
  ['How do I password protect a PDF for free?', 'Add your PDF above, type a password and confirm it, then click Protect PDF. Your encrypted PDF downloads instantly. It is free with no signup and no watermarks.'],
  ['How is Craftora different from iLovePDF or Smallpdf?', 'iLovePDF and Smallpdf upload your PDF to their servers to encrypt it, so your file leaves your device. Craftora encrypts the PDF right in your browser, so it never gets uploaded anywhere, with no daily limits.'],
  ['How strong is the protection?', 'Craftora uses AES encryption, the same standard used for secure PDFs. It is strong protection for everyday privacy and sharing. As with any password, choose one that is hard to guess.'],
  ['What happens if I forget the password?', 'The PDF cannot be opened without it, and Craftora cannot recover it, because your file and password are never stored or uploaded. Keep the password somewhere safe.'],
  ['Do my files get uploaded anywhere?', 'No. The encryption runs entirely in your browser on your own device. Your PDF and password are never sent to any server.'],
  ['Can I remove the password later?', 'Yes. If you know the password, use the Unlock PDF tool to remove it and save an unprotected copy.'],
];

export default function ProtectPdfPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <ProtectPdfTool />
    </ToolPage>
  );
}
