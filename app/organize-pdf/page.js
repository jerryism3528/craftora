import ToolPage from '../../components/ToolPage';
import OrganizePdfTool from '../../components/OrganizePdfTool';
import { getTool } from '../../lib/tools';

const tool = getTool('organize-pdf');

export const metadata = {
  title: 'Organize PDF: Reorder, Rotate, and Delete Pages Free',
  description:
    'Organize PDF pages online for free. Reorder pages, rotate them, and delete pages you do not need, all in one place. No signup, no watermarks, and your files never leave your browser.',
  alternates: { canonical: '/organize-pdf' },
  openGraph: {
    title: 'Organize PDF: Reorder, Rotate, and Delete Pages Free | Craftora',
    description: 'Reorder, rotate, and delete PDF pages for free, right in your browser. No uploads, no watermarks.',
    url: 'https://craftora.dev/organize-pdf',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your PDF', 'Drop your PDF file into the box or choose it from your device. Every page loads as a thumbnail.'],
  ['Reorder, rotate, or delete', 'Move pages left or right to reorder, rotate any page, and remove the pages you do not need.'],
  ['Save your new PDF', 'Click save and your reorganized PDF downloads instantly, exactly the way you arranged it.'],
];

const features = [
  'See every page of your PDF as a thumbnail at a glance.',
  'Reorder pages with simple move controls.',
  'Rotate individual pages so each one sits the right way.',
  'Delete pages you do not need before saving.',
  'Files are processed in your browser, so nothing is uploaded to a server.',
  'No watermarks added to your PDF, ever. Free with no signup.',
];

const faqs = [
  ['How do I organize PDF pages for free?', 'Add your PDF above and every page appears as a thumbnail. Reorder, rotate, or delete pages, then click Save PDF. Your new file downloads instantly. It is free with no signup and no watermarks.'],
  ['How is Craftora different from iLovePDF or Smallpdf?', 'iLovePDF and Smallpdf upload your PDF to their servers to edit the pages. Craftora organizes the file directly in your browser, so your document never leaves your device, with no daily limits or watermarks on the free tier.'],
  ['Can I delete pages from a PDF?', 'Yes. Each page thumbnail has a delete button. Remove any pages you do not want, and they will not appear in the saved PDF.'],
  ['Can I reorder and rotate at the same time?', 'Yes. You can move pages into any order and rotate individual pages, then save everything in one go.'],
  ['Do my files get uploaded anywhere?', 'No. Everything runs in your browser on your own device. Your PDF is never sent to any server.'],
  ['What is the difference between this and Merge or Split PDF?', 'Organize PDF works within a single PDF to reorder, rotate, and delete its pages. Use Merge PDF to combine separate files, and Split PDF to pull pages out into a new file.'],
];

export default function OrganizePdfPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <OrganizePdfTool />
    </ToolPage>
  );
}
