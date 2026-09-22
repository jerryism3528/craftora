import ToolPage from '../../components/ToolPage';
import SignPdfTool from '../../components/SignPdfTool';
import { getTool } from '../../lib/tools';

const tool = getTool('sign-pdf');

export const metadata = {
  title: 'Sign PDF: Add Your Signature to a PDF Online Free',
  description:
    'Sign a PDF online for free. Draw or type your signature, place it on any page, and download the signed document in seconds. No signup, no watermarks, and your file never leaves your browser.',
  alternates: { canonical: '/sign-pdf' },
  openGraph: {
    title: 'Sign PDF: Add Your Signature to a PDF Online Free | Craftora',
    description: 'Draw or type your signature and add it to any PDF for free, right in your browser. No uploads, no watermarks.',
    url: 'https://craftora.dev/sign-pdf',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your PDF', 'Drop your PDF file into the box or choose it from your device. Nothing is uploaded to a server.'],
  ['Create your signature', 'Draw your signature with a mouse or finger, or type your name in a signature style.'],
  ['Place it and download', 'Choose the page and position, set the size, then download your signed PDF instantly.'],
];

const features = [
  'Draw your signature by hand or type it in a signature style.',
  'Place your signature on any page, in any corner or the center.',
  'Adjust the signature size to fit the space on your document.',
  'Files are signed in your browser, so nothing is uploaded to a server.',
  'No watermarks added to your signed PDF, ever.',
  'Completely free with no signup and no daily limits.',
];

const faqs = [
  ['How do I sign a PDF for free?', 'Add your PDF above, draw or type your signature, choose the page and position, then click Sign PDF. Your signed document downloads instantly. It is free with no signup and no watermarks.'],
  ['How is Craftora different from iLovePDF or Smallpdf?', 'iLovePDF and Smallpdf upload your PDF to their servers to sign it. Craftora adds your signature right in your browser, so your document never leaves your device, with no daily limits.'],
  ['Can I draw my signature with my finger?', 'Yes. On a phone or tablet you can draw your signature directly with your finger, or use a mouse or trackpad on a computer.'],
  ['Can I sign on a specific page?', 'Yes. Choose which page to sign and where the signature sits, so it lands exactly where it belongs, like a signature line on the last page.'],
  ['Is this a legally binding e-signature?', 'Craftora places a visible signature image on your PDF, which is fine for most everyday agreements and forms. For contracts that require a certified digital signature with an audit trail, use a dedicated e-signature service.'],
  ['Do my files get uploaded anywhere?', 'No. Signing runs entirely in your browser on your own device. Your PDF and signature are never sent to any server.'],
];

export default function SignPdfPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <SignPdfTool />
    </ToolPage>
  );
}
