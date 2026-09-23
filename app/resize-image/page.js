import ToolPage from '../../components/ToolPage';
import ResizeImageTool from '../../components/ResizeImageTool';
import { getTool } from '../../lib/tools';

const tool = getTool('resize-image');

export const metadata = {
  title: 'Resize Image: Change Image Dimensions Online Free',
  description:
    'Resize images online for free. Change the width and height of JPG, PNG, and WebP images, keep the aspect ratio, and download in seconds. No signup, no watermarks, and your images never leave your browser.',
  alternates: { canonical: '/resize-image' },
  openGraph: {
    title: 'Resize Image: Change Image Dimensions Online Free | Craftora',
    description: 'Change image width and height for free, right in your browser. No uploads, no watermarks, no signup.',
    url: 'https://craftora.dev/resize-image',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your image', 'Drop your JPG, PNG, or WebP image into the box or choose it from your device. Craftora reads its size.'],
  ['Set the new size', 'Enter a width and height, keep the aspect ratio locked, or pick a common size preset.'],
  ['Resize and download', 'Choose a format and download your resized image instantly, right from your browser.'],
];

const features = [
  'Resize JPG, PNG, and WebP images to any width and height.',
  'Lock the aspect ratio so images scale proportionally without stretching.',
  'Pick common sizes like 1920 x 1080 or 1080 x 1080 with one click.',
  'Save the result as JPG, PNG, or WebP.',
  'Images are resized in your browser, so nothing is uploaded to a server.',
  'Completely free with no signup, no watermarks, and no daily limits.',
];

const faqs = [
  ['How do I resize an image for free?', 'Add your image above, enter a new width and height or pick a preset, then click Resize. Your resized image downloads instantly. It is free with no signup and no watermarks.'],
  ['How is Craftora different from iLoveIMG or TinyPNG?', 'iLoveIMG and similar tools upload your image to their servers to resize it. Craftora resizes the image right in your browser, so your file never leaves your device, with no daily limits.'],
  ['How do I resize without stretching the image?', 'Keep Lock aspect ratio turned on. When you change the width, the height updates automatically to keep the same proportions, so the image never looks squashed or stretched.'],
  ['Can I resize to an exact width and height?', 'Yes. Turn off Lock aspect ratio and enter the exact width and height you need. Note that very different proportions may crop or stretch the image.'],
  ['Do my images get uploaded anywhere?', 'No. Resizing runs entirely in your browser on your own device. Your image is never sent to any server.'],
  ['What formats can I save as?', 'You can save your resized image as JPG, PNG, or WebP, whichever suits where you plan to use it.'],
];

export default function ResizeImagePage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <ResizeImageTool />
    </ToolPage>
  );
}
