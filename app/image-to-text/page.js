import ToolPage from '../../components/ToolPage';
import ImageToTextTool from '../../components/ImageToTextTool';
import { getTool } from '../../lib/tools';

const tool = getTool('image-to-text');

export const metadata = {
  title: 'Image to Text: Free Online OCR Converter',
  description:
    'Extract text from an image online for free with OCR. Convert a picture, screenshot, or scan of printed text into editable text you can copy or download. No signup, no watermarks, all in your browser.',
  alternates: { canonical: '/image-to-text' },
  openGraph: {
    title: 'Image to Text: Free Online OCR Converter | Craftora',
    description: 'Turn images and screenshots into editable text for free with in-browser OCR. No uploads, no signup.',
    url: 'https://craftora.dev/image-to-text',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your image', 'Drop an image, screenshot, or scan that contains text into the box, or choose it from your device.'],
  ['Pick the language', 'Choose the language of the text so the OCR reads it as accurately as possible.'],
  ['Extract and copy', 'Click extract, then copy the recognized text or download it as a text file.'],
];

const features = [
  'Extract text from photos, screenshots, and scans with OCR.',
  'Reads English plus several other languages.',
  'Copy the text or download it as a .txt file.',
  'Edit the recognized text right on the page before saving.',
  'OCR runs in your browser, so your image is never uploaded to a server.',
  'Completely free with no signup, no watermarks, and no daily limits.',
];

const faqs = [
  ['How do I extract text from an image for free?', 'Add your image above, pick the language, and click Extract text. Craftora reads the text with OCR in your browser, then you can copy it or download it as a file. It is free with no signup.'],
  ['What is OCR?', 'OCR stands for optical character recognition. It is the technology that looks at an image of text, like a photo or scan, and turns it into real, editable text you can copy and edit.'],
  ['How is Craftora different from other OCR tools?', 'Many OCR sites upload your image to their servers to read it. Craftora runs the OCR right in your browser, so your image never leaves your device, with no daily limits or watermarks.'],
  ['How accurate is the text extraction?', 'Accuracy is high on clear, printed text and screenshots. Handwriting, blurry photos, and low contrast images are harder for any free OCR, so a sharper image gives a better result.'],
  ['Why does the first scan take a few seconds?', 'The first time you extract text, Craftora loads the language data needed to read it. That happens once per visit, and later scans are faster.'],
  ['Do my images get uploaded anywhere?', 'No. The OCR runs entirely in your browser on your own device. Your image is never sent to any server.'],
];

export default function ImageToTextPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <ImageToTextTool />
    </ToolPage>
  );
}
