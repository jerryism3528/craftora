import ToolPage from '../../components/ToolPage';
import WatermarkPdfTool from '../../components/WatermarkPdfTool';
import { getTool } from '../../lib/tools';

const tool = getTool('watermark-pdf');

export const metadata = {
  title: 'Add Watermark to PDF Online Free',
  description:
    'Add a text watermark to a PDF online for free. Set the text, opacity, size, color, and angle, tiled or centered, then download in seconds. No signup, no watermarks from us, and your files never leave your browser.',
  alternates: { canonical: '/watermark-pdf' },
  openGraph: {
    title: 'Add Watermark to PDF Online Free | Craftora',
    description: 'Add a custom text watermark to any PDF for free, right in your browser. No uploads, and no watermark from us.',
    url: 'https://craftora.dev/watermark-pdf',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your PDF', 'Drop your PDF file into the box or choose it from your device. Nothing is uploaded to a server.'],
  ['Design your watermark', 'Type your text, then set the opacity, size, color, and angle. Center it or tile it across every page.'],
  ['Add watermark and download', 'Click the button and your watermarked PDF downloads instantly, ready to share.'],
];

const features = [
  'Add any text watermark, such as CONFIDENTIAL, DRAFT, or your company name.',
  'Control opacity, text size, and color to match your document.',
  'Choose a diagonal or straight watermark, centered or tiled across the whole page.',
  'The watermark is applied to every page of the PDF.',
  'Files are processed in your browser, so nothing is uploaded to a server.',
  'Free with no signup, no daily limits, and no watermark of our own added.',
];

const faqs = [
  ['How do I add a watermark to a PDF for free?', 'Add your PDF above, type your watermark text, adjust the opacity, size, color, and angle, then click Add watermark. Your file downloads instantly. It is free with no signup, and Craftora never adds its own watermark on top.'],
  ['How is Craftora different from iLovePDF or Smallpdf?', 'iLovePDF and Smallpdf upload your PDF to their servers to watermark it. Craftora applies the watermark directly in your browser, so your document never leaves your device, with no daily limits.'],
  ['Can I make the watermark faint or bold?', 'Yes. Use the opacity slider to make it a faint background stamp or a bold overlay, and the size slider to control how large the text is.'],
  ['Can I tile the watermark across the whole page?', 'Yes. Turn on Tile across page to repeat the watermark in a grid over every page, which is harder to crop out. Leave it off for a single centered stamp.'],
  ['Do my files get uploaded anywhere?', 'No. The watermark is applied entirely in your browser on your own device. Your PDF is never sent to any server.'],
  ['Will the watermark appear on every page?', 'Yes. The watermark is applied to all pages of the PDF, so the whole document is marked.'],
];

export default function WatermarkPdfPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <WatermarkPdfTool />
    </ToolPage>
  );
}
