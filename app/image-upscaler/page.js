import ToolPage from '../../components/ToolPage';
import ImageUpscalerTool from '../../components/ImageUpscalerTool';
import { getTool } from '../../lib/tools';

const tool = getTool('image-upscaler');

export const metadata = {
  title: 'Image Upscaler: Enlarge Images Online Free',
  description:
    'Free online image upscaler. Enlarge and upscale images 2x, 3x, or 4x with high-quality smoothing and sharpening, right in your browser. Make small images bigger without heavy pixelation. No signup.',
  alternates: { canonical: '/image-upscaler' },
  openGraph: {
    title: 'Image Upscaler: Enlarge Images Online Free | Craftora',
    description: 'Upscale and enlarge images 2x to 4x with smoothing and sharpening, free and private in your browser.',
    url: 'https://craftora.dev/image-upscaler',
    type: 'website',
  },
};

const howItWorks = [
  ['Upload your image', 'Choose a JPG, PNG, or WebP image you want to make bigger.'],
  ['Pick a scale', 'Select 2x, 3x, or 4x, and keep sharpening on for crisper results.'],
  ['Download the result', 'Compare the original and upscaled versions side by side, then download the larger image.'],
];

const features = [
  'Enlarge images by 2x, 3x, or 4x their original size.',
  'High-quality step-up smoothing for cleaner enlargement.',
  'Optional sharpening to keep edges crisp.',
  'Side-by-side preview of the original and upscaled image.',
  'Runs entirely in your browser, so your image is never uploaded.',
  'Completely free with no signup and no limits.',
];

const faqs = [
  ['How do I upscale an image for free?', 'Upload your image, choose 2x, 3x, or 4x, and click Upscale. Craftora enlarges it with high-quality smoothing and sharpening, then you can download the result. It is free and runs in your browser.'],
  ['Does upscaling make a blurry image sharp?', 'Upscaling makes an image larger and applies smoothing and sharpening to reduce pixelation, so it looks cleaner at the bigger size. It cannot invent detail that was never captured, so a very blurry or tiny source has limits. For heavy restoration, a dedicated AI upscaler goes further.'],
  ['What is the difference from an AI upscaler?', 'This tool uses high-quality resizing plus sharpening in your browser, which is fast, private, and free. AI upscalers use trained models to add detail and can do more on very low-resolution images, but they are slower and usually upload your image to a server. Craftora keeps everything on your device.'],
  ['What image sizes work best?', 'It works on any size, but the best results come from images that are already reasonably clear. Enlarging a small, sharp image looks great. Enlarging a tiny, blurry one improves the size but cannot fully restore lost detail.'],
  ['Is my image private?', 'Yes. All processing happens in your browser on your own device. Your image is never uploaded to any server.'],
  ['Do I need to sign up?', 'No. The image upscaler is free with no account and no limits.'],
];

export default function ImageUpscalerPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <ImageUpscalerTool />
    </ToolPage>
  );
}
