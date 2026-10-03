import ToolPage from '../../components/ToolPage';
import OfficeToPdfTool from '../../components/OfficeToPdfTool';
import { getTool } from '../../lib/tools';

const tool = getTool('word-to-pdf');

export const metadata = {
  title: 'Word to PDF: Convert DOC and DOCX to PDF Free',
  description:
    'Free Word to PDF converter. Turn DOC and DOCX documents into PDF online with fonts, images, tables, and layout preserved. Fast, accurate, and your file is deleted right after conversion.',
  alternates: { canonical: '/word-to-pdf' },
  openGraph: {
    title: 'Word to PDF: Convert DOC and DOCX to PDF Free | Craftora',
    description: 'Convert Word documents to PDF online with layout, fonts, and images preserved. Free with an account.',
    url: 'https://craftora.dev/word-to-pdf',
    type: 'website',
  },
};

const howItWorks = [
  ['Upload your Word file', 'Choose a DOC or DOCX document, or drag it into the box.'],
  ['Convert to PDF', 'Craftora renders your document with a full office engine, keeping the layout intact.'],
  ['Download the PDF', 'Your PDF downloads automatically, ready to share, print, or submit.'],
];

const features = [
  'Converts DOC, DOCX, ODT, RTF, and TXT files to PDF.',
  'Keeps fonts, images, tables, headers, and page layout.',
  'Powered by a full office rendering engine for accurate results.',
  'Files up to 20 MB.',
  'Your file is deleted from our server right after conversion.',
  'Free with a Craftora account, 20 conversions per day.',
];

const faqs = [
  ['How do I convert a Word document to PDF?', 'Upload your DOC or DOCX file, click Convert to PDF, and the PDF downloads automatically. Craftora uses a full office rendering engine, so your formatting carries over.'],
  ['Will my formatting stay the same?', 'Yes. Fonts, images, tables, headers, footers, and page breaks are preserved. Documents using unusual custom fonts may substitute a close match if that font is not available.'],
  ['Can I convert old .doc files?', 'Yes. Both the older .doc format and the modern .docx format are supported, along with ODT, RTF, and plain text.'],
  ['Is my document kept private?', 'Your file is sent securely to our server, converted, and deleted right after. It is never stored, shared, or used for anything else.'],
  ['Why do I need an account?', 'Word conversion runs on our servers using real computing power, so a free account helps prevent abuse. You get 20 conversions per day at no cost.'],
  ['What if my document is password protected?', 'Password-protected Word files cannot be converted. Remove the password in Word first, then upload the document again.'],
];

export default function WordToPdfPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <OfficeToPdfTool tool="word-to-pdf" accept=".doc,.docx,.odt,.rtf,.txt" label="Word" formats="DOC, DOCX, ODT, RTF, or TXT" />
    </ToolPage>
  );
}
