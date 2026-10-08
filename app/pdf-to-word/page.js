import ToolPage from '../../components/ToolPage';
import ConvertFromPdfTool from '../../components/ConvertFromPdfTool';
import { getTool } from '../../lib/tools';

const tool = getTool('pdf-to-word');

export const metadata = {
  title: 'PDF to Word: Convert PDF to Editable DOCX Free',
  description:
    'Free PDF to Word converter. Turn PDF files into editable DOCX documents online, with text, paragraphs, tables, and images kept in place. Edit your PDF in Microsoft Word or Google Docs.',
  alternates: { canonical: '/pdf-to-word' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'PDF to Word: Convert PDF to Editable DOCX Free | Craftora',
    description: 'Convert PDF to an editable Word document online with layout and tables preserved. Free with an account.',
    url: 'https://craftora.dev/pdf-to-word',
    type: 'website',
  },
};

const howItWorks = [
  ['Upload your PDF', 'Choose a PDF file, or drag it into the box.'],
  ['Convert to Word', 'Craftora rebuilds the text, paragraphs, tables, and images as an editable document.'],
  ['Edit in Word', 'Download the DOCX and edit it in Microsoft Word, Google Docs, or LibreOffice.'],
];

const features = [
  'Converts PDF to an editable DOCX Word document.',
  'Keeps paragraphs, fonts, tables, and images in place.',
  'Opens in Microsoft Word, Google Docs, and LibreOffice.',
  'Handles PDFs up to 100 pages and 20 MB.',
  'Your file is deleted from our server right after conversion.',
  'Free with a Craftora account, 20 conversions per day.',
];

const faqs = [
  ['How do I convert a PDF to Word?', 'Upload your PDF, click Convert to Word, and the editable DOCX downloads automatically. Open it in Word or Google Docs to make changes.'],
  ['Will the formatting stay the same?', 'Text, paragraphs, tables, and images are rebuilt in the same positions. Very complex layouts, like magazines with many overlapping columns, may need small touch-ups after converting.'],
  ['Can I convert a scanned PDF to Word?', 'A scanned PDF is just a picture of a page, with no real text inside. Run it through PDF OCR first to add a text layer, then convert the result to Word.'],
  ['Does it work on password protected PDFs?', 'No. Remove the password first with the Unlock PDF tool, then convert it.'],
  ['Is my file kept private?', 'Your PDF is converted on our server and deleted right after. It is never stored or shared.'],
  ['Why do I need an account?', 'Conversion runs on our servers, so a free account helps prevent abuse. You get 20 conversions per day at no cost.'],
];

export default function PdfToWordPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <ConvertFromPdfTool tool="pdf-to-word" outLabel="Word" outExt="docx" note="Works best on PDFs created from documents. Scanned PDFs have no real text inside, so run them through PDF OCR first." />
    </ToolPage>
  );
}
