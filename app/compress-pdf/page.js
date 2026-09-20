import ToolPage from '../../components/ToolPage';
import CompressPdfTool from '../../components/CompressPdfTool';
import { getTool } from '../../lib/tools';

const tool = getTool('compress-pdf');

export const metadata = {
  title: 'Compress PDF: Reduce PDF File Size Online Free',
  description:
    'Compress PDF files online for free and reduce PDF file size in seconds. Shrink PDFs for email and upload with no signup, no watermarks, and full privacy. Your files never leave your browser.',
  alternates: { canonical: '/compress-pdf' },
  openGraph: {
    title: 'Compress PDF: Reduce PDF File Size Online Free | Craftora',
    description: 'Reduce PDF file size for free, right in your browser. No watermarks, no uploads, no signup.',
    url: 'https://craftora.dev/compress-pdf',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your PDF', 'Drop your PDF file into the box or choose it from your device. Nothing is uploaded to a server.'],
  ['Compress it', 'Craftora repacks the PDF and strips hidden bloat to reduce the file size, right in your browser.'],
  ['Download the smaller PDF', 'See how much smaller it got, then download your compressed PDF instantly.'],
];

const features = [
  'Reduce PDF file size to make files easier to email and upload.',
  'See the exact before and after size and percentage saved.',
  'Files are compressed in your browser, so nothing is uploaded to a server.',
  'No watermarks added to your compressed PDF, ever.',
  'Completely free with no signup and no daily limits.',
  'Works on desktop, tablet, and mobile browsers.',
];

const faqs = [
  ['How do I compress a PDF for free?', 'Add your PDF above and click Compress PDF. Craftora shrinks the file in your browser and shows how much smaller it is, then you download it. It is free with no signup and no watermarks.'],
  ['How is Craftora different from iLovePDF or Smallpdf for compression?', 'iLovePDF and Smallpdf upload your PDF to their servers to compress it. Craftora compresses the file directly in your browser, so your document never leaves your device, with no daily limits or watermarks on the free tier.'],
  ['Will compressing reduce the quality of my PDF?', 'Craftora compresses by repacking the file and removing hidden bloat rather than degrading your pages, so text stays sharp. The amount saved depends on how the original PDF was made.'],
  ['Why did my PDF only shrink a little?', 'PDFs that are already well optimized, or that are mostly scanned images, have less room to shrink in the browser. Files exported from Word, Canva, or design tools usually compress the most.'],
  ['Do my files get uploaded anywhere?', 'No. Compression runs entirely in your browser on your own device. Your PDF is never sent to any server.'],
  ['Is there a file size limit?', 'There is no fixed limit. You can compress PDFs as large as your device can comfortably handle.'],
];

export default function CompressPdfPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <CompressPdfTool />
    </ToolPage>
  );
}
