import ToolPage from '../../components/ToolPage';
import ConvertFromPdfTool from '../../components/ConvertFromPdfTool';
import { getTool } from '../../lib/tools';

const tool = getTool('pdf-to-powerpoint');

export const metadata = {
  title: 'PDF to PowerPoint: Convert PDF to PPTX Slides Free',
  description:
    'Free PDF to PowerPoint converter. Turn every page of a PDF into a PowerPoint slide online, looking exactly like the original. Present your PDF in PowerPoint, Keynote, or Google Slides.',
  alternates: { canonical: '/pdf-to-powerpoint' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'PDF to PowerPoint: Convert PDF to PPTX Slides Free | Craftora',
    description: 'Turn each PDF page into a PowerPoint slide that looks exactly like the original. Free with an account.',
    url: 'https://craftora.dev/pdf-to-powerpoint',
    type: 'website',
  },
};

const howItWorks = [
  ['Upload your PDF', 'Choose a PDF file, or drag it into the box.'],
  ['Convert to slides', 'Each PDF page becomes one high-quality PowerPoint slide.'],
  ['Present it', 'Download the PPTX and present it in PowerPoint, Keynote, or Google Slides.'],
];

const features = [
  'One PDF page becomes one PowerPoint slide.',
  'Slides look exactly like your original PDF.',
  'Slide size matches your PDF page shape.',
  'Opens in PowerPoint, Keynote, and Google Slides.',
  'Your file is deleted from our server right after conversion.',
  'Free with a Craftora account, 20 conversions per day.',
];

const faqs = [
  ['How do I convert a PDF to PowerPoint?', 'Upload your PDF, click Convert to PowerPoint, and the PPTX downloads automatically with one slide per page.'],
  ['Can I edit the text on the slides?', 'Each slide is a high-quality image of your PDF page, so it looks exactly like the original but the text is not editable. You can add new text boxes, notes, and animations on top. If you need editable text, convert the PDF to Word instead.'],
  ['Why would I convert a PDF to PowerPoint?', 'It lets you present a PDF full screen with slide controls, add speaker notes, insert extra slides, or combine it with an existing deck.'],
  ['Will the slides look sharp?', 'Yes. Pages are rendered at high resolution, so text and images stay crisp on large screens and projectors.'],
  ['Is my file kept private?', 'Your PDF is converted on our server and deleted right after. It is never stored or shared.'],
  ['Why do I need an account?', 'Conversion runs on our servers, so a free account helps prevent abuse. You get 20 conversions per day at no cost.'],
];

export default function PdfToPowerPointPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <ConvertFromPdfTool tool="pdf-to-powerpoint" outLabel="PowerPoint" outExt="pptx" note="Each PDF page becomes one slide that looks exactly like the original. The slides are images, so the text is not editable, but you can add your own text, notes, and slides on top." />
    </ToolPage>
  );
}
