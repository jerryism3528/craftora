import ToolPage from '../../components/ToolPage';
import UnlockPdfTool from '../../components/UnlockPdfTool';
import { getTool } from '../../lib/tools';

const tool = getTool('unlock-pdf');

export const metadata = {
  title: 'Unlock PDF: Remove PDF Password Online Free',
  description:
    'Unlock a PDF online for free by removing its password. Enter the password you know and download an unprotected copy in seconds. No signup, no watermarks, and your file never leaves your browser.',
  alternates: { canonical: '/unlock-pdf' },
  openGraph: {
    title: 'Unlock PDF: Remove PDF Password Online Free | Craftora',
    description: 'Remove the password from a PDF you can open, for free, right in your browser. No uploads, no watermarks.',
    url: 'https://craftora.dev/unlock-pdf',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your PDF', 'Drop your password protected PDF into the box or choose it from your device. Nothing is uploaded.'],
  ['Enter the password', 'Type the password you already know for the PDF. This is needed to unlock it.'],
  ['Unlock and download', 'Click unlock and an unprotected copy of your PDF downloads instantly, with no password needed to open it.'],
];

const features = [
  'Remove the password from a PDF you can already open.',
  'Download a clean, unprotected copy that opens without a password.',
  'The PDF is unlocked in your browser, so nothing is uploaded to a server.',
  'No watermarks added to your unlocked PDF, ever.',
  'Completely free with no signup and no daily limits.',
  'Works on desktop, tablet, and mobile browsers.',
];

const faqs = [
  ['How do I remove a password from a PDF for free?', 'Add your PDF above, enter the password you know, then click Unlock PDF. An unprotected copy downloads instantly. It is free with no signup and no watermarks.'],
  ['Do I need to know the password?', 'Yes. Craftora removes a password from a PDF you can already open by entering the correct password. It does not and cannot crack or guess unknown passwords.'],
  ['How is Craftora different from iLovePDF or Smallpdf?', 'iLovePDF and Smallpdf upload your PDF to their servers to unlock it. Craftora removes the password right in your browser, so your document never leaves your device, with no daily limits.'],
  ['Can Craftora open a PDF if I lost the password?', 'No. If you do not have the password, the file cannot be unlocked. This is by design, so PDF protection stays meaningful and your documents stay secure.'],
  ['Do my files get uploaded anywhere?', 'No. Unlocking runs entirely in your browser on your own device. Your PDF and password are never sent to any server.'],
  ['Can I add a password back later?', 'Yes. Use the Protect PDF tool to add a new password to any PDF whenever you need to.'],
];

export default function UnlockPdfPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <UnlockPdfTool />
    </ToolPage>
  );
}
