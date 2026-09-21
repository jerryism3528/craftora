import ToolPage from '../../components/ToolPage';
import AddPageNumbersTool from '../../components/AddPageNumbersTool';
import { getTool } from '../../lib/tools';

const tool = getTool('add-page-numbers');

export const metadata = {
  title: 'Add Page Numbers to PDF Online Free',
  description:
    'Add page numbers to a PDF online for free. Choose the position, number format, and starting number, then download in seconds. No signup, no watermarks, and your files never leave your browser.',
  alternates: { canonical: '/add-page-numbers' },
  openGraph: {
    title: 'Add Page Numbers to PDF Online Free | Craftora',
    description: 'Add page numbers to any PDF for free, right in your browser. Pick position and format. No uploads, no watermarks.',
    url: 'https://craftora.dev/add-page-numbers',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your PDF', 'Drop your PDF file into the box or choose it from your device. Nothing is uploaded to a server.'],
  ['Choose position and format', 'Pick where the number sits, the format like 1 or 1 / 10 or Page 1, and the starting number.'],
  ['Add numbers and download', 'Click the button and your numbered PDF downloads instantly, ready to print or share.'],
];

const features = [
  'Add page numbers to any PDF in six positions, top or bottom, left, center, or right.',
  'Choose a plain number, a number out of total like 1 / 10, or a Page 1 style label.',
  'Set the starting number, useful when a document begins after a cover page.',
  'Files are processed in your browser, so nothing is uploaded to a server.',
  'No watermarks added to your PDF, ever.',
  'Completely free with no signup and no daily limits.',
];

const faqs = [
  ['How do I add page numbers to a PDF for free?', 'Add your PDF above, choose a position, format, and starting number, then click Add page numbers. Your numbered PDF downloads instantly. It is free with no signup and no watermarks.'],
  ['How is Craftora different from iLovePDF or Smallpdf?', 'iLovePDF and Smallpdf upload your PDF to their servers to add page numbers. Craftora adds them directly in your browser, so your document never leaves your device, with no daily limits or watermarks on the free tier.'],
  ['Can I start numbering from a page other than the first?', 'Yes. Set the starting number to control what the first page shows. For example, start at 0 or 2 if your document has a cover page you do not want counted as page 1.'],
  ['Can I choose where the page number appears?', 'Yes. You can place the number at the top or bottom, aligned left, center, or right, so it fits your document layout.'],
  ['Do my files get uploaded anywhere?', 'No. Page numbers are added entirely in your browser on your own device. Your PDF is never sent to any server.'],
  ['Will the page numbers print?', 'Yes. The numbers are written into the PDF itself, so they appear on screen and when you print or share the file.'],
];

export default function AddPageNumbersPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <AddPageNumbersTool />
    </ToolPage>
  );
}
