import ToolPage from '../../components/ToolPage';
import RotatePdfTool from '../../components/RotatePdfTool';
import { getTool } from '../../lib/tools';

const tool = getTool('rotate-pdf');

export const metadata = {
  title: 'Rotate PDF: Rotate PDF Pages Online Free',
  description:
    'Rotate PDF pages online for free. Turn pages left, right, or 180 degrees, all pages or just some, and download in seconds. No signup, no watermarks, and your files never leave your browser.',
  alternates: { canonical: '/rotate-pdf' },
  openGraph: {
    title: 'Rotate PDF: Rotate PDF Pages Online Free | Craftora',
    description: 'Rotate PDF pages left, right, or 180 degrees for free, right in your browser. No uploads, no watermarks.',
    url: 'https://craftora.dev/rotate-pdf',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your PDF', 'Drop your PDF file into the box or choose it from your device. Nothing is uploaded to a server.'],
  ['Choose the rotation', 'Turn pages left 90, right 90, or flip 180 degrees. Apply it to every page or just the ones you pick.'],
  ['Rotate and download', 'Click rotate and your corrected PDF downloads instantly, ready to read the right way up.'],
];

const features = [
  'Rotate PDF pages left 90, right 90, or a full 180 degrees.',
  'Rotate every page at once, or select specific pages and ranges.',
  'The rotation is saved permanently in the PDF, so it opens the right way everywhere.',
  'Files are processed in your browser, so nothing is uploaded to a server.',
  'No watermarks added to your rotated PDF, ever.',
  'Completely free with no signup and no daily limits.',
];

const faqs = [
  ['How do I rotate a PDF for free?', 'Add your PDF above, choose a rotation direction, pick all pages or specific pages, and click Rotate. Your corrected PDF downloads instantly. It is free with no signup and no watermarks.'],
  ['How is Craftora different from iLovePDF or Smallpdf?', 'iLovePDF and Smallpdf upload your PDF to their servers to rotate it. Craftora rotates the file directly in your browser, so your document never leaves your device, with no daily limits or watermarks on the free tier.'],
  ['Can I rotate only some pages?', 'Yes. Choose specific pages and enter the page numbers or ranges, like 1-2, 4. Only those pages are rotated, the rest are left as they are.'],
  ['Is the rotation permanent?', 'Yes. The new orientation is saved into the PDF itself, so it displays correctly in any PDF reader, not just while previewing.'],
  ['Do my files get uploaded anywhere?', 'No. Rotation runs entirely in your browser on your own device. Your PDF is never sent to any server.'],
  ['Why is my scanned PDF sideways?', 'Scanners and phone cameras often save pages in the wrong orientation. Rotating them left or right by 90 degrees usually fixes it so the text reads normally.'],
];

export default function RotatePdfPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <RotatePdfTool />
    </ToolPage>
  );
}
