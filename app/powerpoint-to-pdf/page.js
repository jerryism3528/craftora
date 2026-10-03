import ToolPage from '../../components/ToolPage';
import OfficeToPdfTool from '../../components/OfficeToPdfTool';
import { getTool } from '../../lib/tools';

const tool = getTool('powerpoint-to-pdf');

export const metadata = {
  title: 'PowerPoint to PDF: Convert PPT and PPTX to PDF Free',
  description:
    'Free PowerPoint to PDF converter. Turn PPT and PPTX presentations into PDF online, one slide per page with images and layout preserved. Easy to share, print, or submit.',
  alternates: { canonical: '/powerpoint-to-pdf' },
  openGraph: {
    title: 'PowerPoint to PDF: Convert PPT and PPTX to PDF Free | Craftora',
    description: 'Convert PowerPoint presentations to PDF online, one slide per page. Free with an account.',
    url: 'https://craftora.dev/powerpoint-to-pdf',
    type: 'website',
  },
};

const howItWorks = [
  ['Upload your presentation', 'Choose a PPT or PPTX file, or drag it into the box.'],
  ['Convert to PDF', 'Craftora renders each slide with a full office engine.'],
  ['Download the PDF', 'Your PDF downloads automatically, one slide per page.'],
];

const features = [
  'Converts PPT, PPTX, and ODP presentations to PDF.',
  'One slide per page, in order.',
  'Keeps images, shapes, text, and slide layout.',
  'Files up to 20 MB.',
  'Your file is deleted from our server right after conversion.',
  'Free with a Craftora account, 20 conversions per day.',
];

const faqs = [
  ['How do I convert PowerPoint to PDF?', 'Upload your PPT or PPTX file, click Convert to PDF, and the PDF downloads automatically with one slide per page.'],
  ['Are animations and transitions kept?', 'No. A PDF is a static document, so animations, transitions, and embedded videos are not included. Each slide is saved as it appears in its final state.'],
  ['Why convert a presentation to PDF?', 'A PDF opens the same on every device without PowerPoint, keeps your layout fixed, and is easy to email, print, or upload to a portal.'],
  ['Will my fonts look the same?', 'Standard fonts carry over exactly. Unusual custom fonts may be replaced with a close match if they are not available on the server.'],
  ['Is my presentation kept private?', 'Your file is converted on our server and deleted right after. It is never stored or shared.'],
  ['Why do I need an account?', 'Conversion uses real server power, so a free account helps prevent abuse. You get 20 conversions per day at no cost.'],
];

export default function PowerPointToPdfPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <OfficeToPdfTool tool="powerpoint-to-pdf" accept=".ppt,.pptx,.odp" label="PowerPoint" formats="PPT, PPTX, or ODP" />
    </ToolPage>
  );
}
