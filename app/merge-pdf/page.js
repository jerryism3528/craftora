import ToolPage from '../../components/ToolPage';
import MergePdfTool from '../../components/MergePdfTool';
import { getTool } from '../../lib/tools';

const tool = getTool('merge-pdf');

export const metadata = {
  title: 'Merge PDF: Combine PDF Files Online Free',
  description:
    'Merge PDF files into one document online for free. Combine multiple PDFs, reorder pages, and download instantly. No signup, no watermarks, and your files never leave your browser.',
  alternates: { canonical: '/merge-pdf' },
  openGraph: {
    title: 'Merge PDF: Combine PDF Files Online Free | Craftora',
    description: 'Combine multiple PDF files into one online for free. Private, browser-based, no watermarks.',
    url: 'https://craftora.dev/merge-pdf',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your PDFs', 'Drop your PDF files into the box or choose them from your device. Add two or more files to merge.'],
  ['Put them in order', 'Drag files up or down so the pages combine in exactly the order you want.'],
  ['Merge and download', 'Click merge and your combined PDF downloads instantly, right from your browser.'],
];

const features = [
  'Combine unlimited PDF files into a single document.',
  'Reorder files before merging with simple up and down controls.',
  'Files are processed in your browser, so nothing is uploaded to a server.',
  'No watermarks added to your merged PDF, ever.',
  'Completely free with no signup or daily limits.',
  'Works on desktop, tablet, and mobile browsers.',
];

const faqs = [
  ['How do I merge PDF files for free?', 'Add two or more PDF files above, drag them into the order you want, then click merge. Your combined PDF downloads instantly. It is free with no signup and no watermarks.'],
  ['Is Craftora Merge PDF better than iLovePDF or Smallpdf?', 'For merging, Craftora keeps your files in your browser instead of uploading them to a server like iLovePDF and Smallpdf do, so it is more private and there are no daily limits or watermarks on the free tier.'],
  ['Do my files get uploaded anywhere?', 'No. Merging runs entirely in your browser using your own device. Your PDF files never leave your computer or phone.'],
  ['Is there a limit on how many PDFs I can combine?', 'There is no fixed limit. You can merge as many PDF files as your device can comfortably handle at once.'],
  ['Can I reorder pages before merging?', 'Yes. Use the up and down arrows on each file to set the order before you merge. The final PDF follows that order.'],
  ['Does merging reduce the quality of my PDF?', 'No. Merging combines the original pages as they are, so text and images keep their original quality.'],
];

export default function MergePdfPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <MergePdfTool />
    </ToolPage>
  );
}
