import ToolPage from '../../components/ToolPage';
import SplitPdfTool from '../../components/SplitPdfTool';
import { getTool } from '../../lib/tools';

const tool = getTool('split-pdf');

export const metadata = {
  title: 'Split PDF: Extract Pages or Split PDF Online Free',
  description:
    'Split PDF files online for free. Extract specific pages or a page range, or split every page into separate PDFs. No signup, no watermarks, and your files never leave your browser.',
  alternates: { canonical: '/split-pdf' },
  openGraph: {
    title: 'Split PDF: Extract Pages or Split PDF Online Free | Craftora',
    description: 'Extract pages from a PDF or split every page, free and private. Browser-based, no watermarks.',
    url: 'https://craftora.dev/split-pdf',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your PDF', 'Drop your PDF file into the box or choose it from your device. Craftora reads how many pages it has.'],
  ['Choose what to split', 'Extract specific pages or a range like 2-5, or split every page into its own separate PDF file.'],
  ['Split and download', 'Click split and your extracted PDF, or a zip of every page, downloads instantly from your browser.'],
];

const features = [
  'Extract a single page, several pages, or a page range from any PDF.',
  'Split every page of a PDF into separate files, delivered in one zip.',
  'Files are processed in your browser, so nothing is uploaded to a server.',
  'No watermarks added to your split PDF files, ever.',
  'Completely free with no signup and no daily limits.',
  'Works on desktop, tablet, and mobile browsers.',
];

const faqs = [
  ['How do I split a PDF for free?', 'Add your PDF above, choose extract pages (enter something like 1-3, 5) or split every page, then click the button. Your files download instantly. It is free with no signup and no watermarks.'],
  ['How is Craftora different from iLovePDF or Smallpdf for splitting?', 'iLovePDF and Smallpdf upload your PDF to their servers to split it. Craftora splits the file right in your browser, so your document never leaves your device, and there are no daily limits or watermarks on the free tier.'],
  ['Can I extract just one page from a PDF?', 'Yes. Choose extract pages and enter a single page number, like 4. You will get a new PDF containing just that page.'],
  ['Can I split a PDF into individual pages?', 'Yes. Choose split every page and Craftora creates a separate PDF for each page, then bundles them into a single zip file you can download.'],
  ['Do my files get uploaded anywhere?', 'No. Splitting runs entirely in your browser on your own device. Your PDF never gets sent to any server.'],
  ['Is there a page limit?', 'There is no fixed limit. You can split PDFs as large as your device can comfortably handle.'],
];

export default function SplitPdfPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <SplitPdfTool />
    </ToolPage>
  );
}
