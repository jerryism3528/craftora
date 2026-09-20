import ToolPage from '../../components/ToolPage';
import PdfToJpgTool from '../../components/PdfToJpgTool';
import { getTool } from '../../lib/tools';

const tool = getTool('pdf-to-jpg');

export const metadata = {
  title: 'PDF to JPG: Convert PDF to Images Online Free',
  description:
    'Convert PDF to JPG online for free. Turn every page of a PDF into a high-quality JPG image in seconds, with no signup, no watermarks, and full privacy. Your files never leave your browser.',
  alternates: { canonical: '/pdf-to-jpg' },
  openGraph: {
    title: 'PDF to JPG: Convert PDF to Images Online Free | Craftora',
    description: 'Turn PDF pages into JPG images for free, right in your browser. No uploads, no watermarks, no signup.',
    url: 'https://craftora.dev/pdf-to-jpg',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your PDF', 'Drop your PDF file into the box or choose it from your device. Nothing is uploaded to a server.'],
  ['Pick image quality', 'Choose standard for smaller images, or high quality for sharper detail on each page.'],
  ['Convert and download', 'Each page becomes a JPG. A multi-page PDF downloads as a zip, a single page as one JPG image.'],
];

const features = [
  'Convert every page of a PDF into a separate JPG image.',
  'Choose standard or high quality to balance sharpness and file size.',
  'Files are converted in your browser, so nothing is uploaded to a server.',
  'No watermarks added to your images, ever.',
  'Multi-page PDFs are delivered together in a single zip download.',
  'Completely free with no signup and no daily limits.',
];

const faqs = [
  ['How do I convert a PDF to JPG for free?', 'Add your PDF above, pick a quality, and click Convert to JPG. Each page becomes a JPG image and downloads instantly. It is free with no signup and no watermarks.'],
  ['How is Craftora different from iLovePDF or Smallpdf?', 'iLovePDF and Smallpdf upload your PDF to their servers to convert it. Craftora converts the file directly in your browser, so your document never leaves your device, with no daily limits or watermarks on the free tier.'],
  ['Does the whole PDF become one image?', 'No. Each page of your PDF becomes its own JPG image. If the PDF has several pages, the images are bundled into a single zip file for easy download.'],
  ['Will the image quality be good?', 'Yes. Choose the high quality setting to render each page at higher resolution for crisp, clear images. Standard quality gives smaller files that are still clean.'],
  ['Do my files get uploaded anywhere?', 'No. Conversion runs entirely in your browser on your own device. Your PDF is never sent to any server.'],
  ['Can I convert just one page?', 'The tool converts every page of the PDF. If your PDF has a single page, you get one JPG. To pick specific pages first, use the Split PDF tool, then convert the result.'],
];

export default function PdfToJpgPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <PdfToJpgTool />
    </ToolPage>
  );
}
