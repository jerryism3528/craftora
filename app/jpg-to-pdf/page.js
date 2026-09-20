import ToolPage from '../../components/ToolPage';
import JpgToPdfTool from '../../components/JpgToPdfTool';
import { getTool } from '../../lib/tools';

const tool = getTool('jpg-to-pdf');

export const metadata = {
  title: 'JPG to PDF: Convert Images to PDF Online Free',
  description:
    'Convert JPG and PNG images to PDF online for free. Combine multiple images into one PDF, reorder them, and download in seconds. No signup, no watermarks, and your files never leave your browser.',
  alternates: { canonical: '/jpg-to-pdf' },
  openGraph: {
    title: 'JPG to PDF: Convert Images to PDF Online Free | Craftora',
    description: 'Turn JPG and PNG images into a single PDF for free, right in your browser. No uploads, no watermarks.',
    url: 'https://craftora.dev/jpg-to-pdf',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your images', 'Drop your JPG or PNG images into the box or choose them from your device. Add as many as you need.'],
  ['Order and set the page', 'Drag images into the right order, then choose fit-to-image or a standard A4 page layout.'],
  ['Convert and download', 'Click convert and your images are combined into a single PDF that downloads instantly.'],
];

const features = [
  'Combine multiple JPG and PNG images into one PDF document.',
  'Reorder images before converting so pages come out in the right order.',
  'Choose fit-to-image pages or center each image on a standard A4 page.',
  'Files are converted in your browser, so nothing is uploaded to a server.',
  'No watermarks added to your PDF, ever.',
  'Completely free with no signup and no daily limits.',
];

const faqs = [
  ['How do I convert JPG to PDF for free?', 'Add your JPG or PNG images above, put them in order, choose a page size, and click Convert to PDF. Your combined PDF downloads instantly. It is free with no signup and no watermarks.'],
  ['How is Craftora different from iLovePDF or Smallpdf?', 'iLovePDF and Smallpdf upload your images to their servers to build the PDF. Craftora creates the PDF directly in your browser, so your images never leave your device, with no daily limits or watermarks on the free tier.'],
  ['Can I combine several images into one PDF?', 'Yes. Add as many JPG or PNG images as you like, arrange them in the order you want, and they are combined into a single PDF, one image per page.'],
  ['Does it support PNG as well as JPG?', 'Yes. You can add both JPG and PNG images, and mix them in the same PDF.'],
  ['What is the difference between fit-to-image and A4?', 'Fit-to-image makes each PDF page exactly match the size of the image. A4 places each image centered on a standard A4 page, which is better for printing.'],
  ['Do my files get uploaded anywhere?', 'No. The PDF is built entirely in your browser on your own device. Your images are never sent to any server.'],
];

export default function JpgToPdfPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <JpgToPdfTool />
    </ToolPage>
  );
}
