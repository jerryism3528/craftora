import ToolPage from '../../components/ToolPage';
import CropImageTool from '../../components/CropImageTool';
import { getTool } from '../../lib/tools';

const tool = getTool('crop-image');

export const metadata = {
  title: 'Crop Image: Crop Photos Online Free',
  description:
    'Crop images online for free. Drag to crop JPG, PNG, and WebP photos, use aspect ratio presets like 1:1 and 16:9, and download in seconds. No signup, no watermarks, and your images never leave your browser.',
  alternates: { canonical: '/crop-image' },
  openGraph: {
    title: 'Crop Image: Crop Photos Online Free | Craftora',
    description: 'Crop images and photos for free, right in your browser. Aspect ratio presets, no uploads, no watermarks.',
    url: 'https://craftora.dev/crop-image',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your image', 'Drop your JPG, PNG, or WebP image into the box or choose it from your device. Nothing is uploaded.'],
  ['Set the crop area', 'Drag the crop box to move it and drag the handle to resize, or pick an aspect ratio like 1:1 or 16:9.'],
  ['Crop and download', 'Click crop and your cropped image downloads instantly, right from your browser.'],
];

const features = [
  'Crop JPG, PNG, and WebP images by dragging a crop box.',
  'Use aspect ratio presets like 1:1 for social, 16:9 for video, or 4:3.',
  'Crop freely to any size with the free ratio option.',
  'Works with a mouse on desktop or by touch on phones and tablets.',
  'Images are cropped in your browser, so nothing is uploaded to a server.',
  'Completely free with no signup, no watermarks, and no daily limits.',
];

const faqs = [
  ['How do I crop an image for free?', 'Add your image above, drag the crop box to the area you want, or pick an aspect ratio, then click Crop. Your cropped image downloads instantly. It is free with no signup and no watermarks.'],
  ['How do I crop to a square or 16:9?', 'Choose the 1:1 preset for a perfect square, or 16:9 for a widescreen crop. The crop box locks to that shape so your result matches the ratio exactly.'],
  ['How is Craftora different from other croppers?', 'Many online croppers upload your photo to their servers. Craftora crops the image right in your browser, so your file never leaves your device, with no daily limits or watermarks.'],
  ['Can I crop on my phone?', 'Yes. The crop box works by touch, so you can drag and resize it on a phone or tablet just like on a computer.'],
  ['Do my images get uploaded anywhere?', 'No. Cropping runs entirely in your browser on your own device. Your image is never sent to any server.'],
  ['Will cropping reduce the image quality?', 'No. Cropping keeps the original pixels inside the crop area at full quality. It only removes the parts outside the box.'],
];

export default function CropImagePage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <CropImageTool />
    </ToolPage>
  );
}
