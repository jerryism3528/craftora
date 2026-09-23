import ToolPage from '../../components/ToolPage';
import RotateFlipImageTool from '../../components/RotateFlipImageTool';
import { getTool } from '../../lib/tools';

const tool = getTool('rotate-image');

export const metadata = {
  title: 'Rotate and Flip Image Online Free',
  description:
    'Rotate and flip images online for free. Rotate JPG, PNG, and WebP photos left, right, or 180 degrees, flip them horizontally or vertically, and download in seconds. No signup, no watermarks, all in your browser.',
  alternates: { canonical: '/rotate-image' },
  openGraph: {
    title: 'Rotate and Flip Image Online Free | Craftora',
    description: 'Rotate or flip images for free, right in your browser. Live preview, no uploads, no watermarks, no signup.',
    url: 'https://craftora.dev/rotate-image',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your image', 'Drop your JPG, PNG, or WebP image into the box or choose it from your device. Nothing is uploaded.'],
  ['Rotate or flip it', 'Rotate left, right, or 180 degrees, and flip horizontally or vertically. A live preview shows the result.'],
  ['Apply and download', 'Click apply and your rotated or flipped image downloads instantly, right from your browser.'],
];

const features = [
  'Rotate images left 90, right 90, or a full 180 degrees.',
  'Flip images horizontally or vertically, or combine flips with a rotation.',
  'See a live preview of every change before you download.',
  'Works with JPG, PNG, and WebP images.',
  'Images are edited in your browser, so nothing is uploaded to a server.',
  'Completely free with no signup, no watermarks, and no daily limits.',
];

const faqs = [
  ['How do I rotate an image for free?', 'Add your image above, click Left 90, Right 90, or 180 to rotate it, and watch the live preview. When it looks right, click Apply and download. It is free with no signup and no watermarks.'],
  ['How do I flip an image?', 'Use Flip horizontal to mirror the image left to right, or Flip vertical to mirror it top to bottom. You can flip and rotate together, then download the result.'],
  ['What is the difference between rotate and flip?', 'Rotating turns the whole image by an angle, like turning a photo sideways. Flipping mirrors it, so text and faces face the other way. Craftora does both on this page.'],
  ['How is Craftora different from other image editors?', 'Many online editors upload your photo to their servers. Craftora rotates and flips the image right in your browser, so your file never leaves your device, with no daily limits or watermarks.'],
  ['Can I fix a sideways photo from my phone?', 'Yes. Phone photos often come out sideways or upside down. Rotate left or right by 90 degrees, or use 180, until it reads the right way, then download.'],
  ['Do my images get uploaded anywhere?', 'No. Rotating and flipping run entirely in your browser on your own device. Your image is never sent to any server.'],
];

export default function RotateImagePage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <RotateFlipImageTool />
    </ToolPage>
  );
}
