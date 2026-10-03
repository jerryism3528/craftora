import ToolPage from '../../components/ToolPage';
import ConvertFromPdfTool from '../../components/ConvertFromPdfTool';
import { getTool } from '../../lib/tools';

const tool = getTool('pdf-ocr');

export const metadata = {
  title: 'PDF OCR: Make Scanned PDFs Searchable Free',
  description:
    'Free PDF OCR tool. Turn scanned PDFs into searchable, selectable PDFs online. Find words with Ctrl+F, copy text, and keep the original look of every page. No software needed.',
  alternates: { canonical: '/pdf-ocr' },
  openGraph: {
    title: 'PDF OCR: Make Scanned PDFs Searchable Free | Craftora',
    description: 'Add a text layer to scanned PDFs so you can search, select, and copy text. Free with an account.',
    url: 'https://craftora.dev/pdf-ocr',
    type: 'website',
  },
};

const howItWorks = [
  ['Upload a scanned PDF', 'Choose a scanned or photographed PDF, or drag it into the box.'],
  ['Run OCR', 'Craftora reads the text on every page and adds an invisible text layer.'],
  ['Search and copy', 'Download your searchable PDF. Use Ctrl+F to find words and select text to copy.'],
];

const features = [
  'Turns scanned PDFs into searchable, selectable PDFs.',
  'Keeps the original look of every page.',
  'Pages that already have text are left untouched.',
  'Handles PDFs up to 50 pages and 20 MB.',
  'Your file is deleted from our server right after processing.',
  'Free with a Craftora account, 10 OCR jobs per day.',
];

const faqs = [
  ['What does PDF OCR do?', 'OCR (optical character recognition) reads the text in a scanned page and adds an invisible text layer behind the image. The PDF looks the same, but you can now search it, select text, and copy it.'],
  ['How do I make a scanned PDF searchable?', 'Upload the scanned PDF, click Make Searchable, and download the result. Open it and press Ctrl+F to search for any word.'],
  ['Which languages are supported?', 'English text is supported right now. Support for more languages is planned.'],
  ['How accurate is it?', 'Clear, straight, well-lit scans give the best results. Blurry photos, handwriting, or very small print may have some errors.'],
  ['What can I do after OCR?', 'Once your PDF has a text layer, you can convert it to Word or Excel with Craftora to get fully editable text and tables.'],
  ['Why is there a lower daily limit?', 'OCR reads every page as an image, which takes much more server power than other conversions. A free account gets 10 OCR jobs per day.'],
];

export default function PdfOcrPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <ConvertFromPdfTool tool="pdf-ocr" outLabel="searchable PDF" outExt="pdf" nameSuffix="-searchable" dailyLimit={10} buttonText="Make searchable" note="Adds an invisible text layer to scanned pages so you can search, select, and copy text. English text, up to 50 pages. Larger scans can take a couple of minutes." />
    </ToolPage>
  );
}
