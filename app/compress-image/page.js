import ToolPage from '../../components/ToolPage';
import CompressImageTool from '../../components/CompressImageTool';
import { getTool } from '../../lib/tools';

const tool = getTool('compress-image');

export const metadata = {
  title: 'Compress Image: Reduce Image File Size Online Free',
  description:
    'Compress JPG, PNG, and WebP images online for free. Reduce image file size in seconds while keeping quality, with no signup, no watermarks, and full privacy. Your images never leave your browser.',
  alternates: { canonical: '/compress-image' },
  openGraph: {
    title: 'Compress Image: Reduce Image File Size Online Free | Craftora',
    description: 'Shrink JPG, PNG, and WebP images for free, right in your browser. No uploads, no watermarks, no signup.',
    url: 'https://craftora.dev/compress-image',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your images', 'Drop your JPG, PNG, or WebP images into the box or choose them from your device. Add as many as you like.'],
  ['Pick a quality', 'Choose smaller file, balanced, or better quality to control the size and sharpness tradeoff.'],
  ['Compress and download', 'See how much smaller each image got, then download them one by one or all together in a zip.'],
];

const features = [
  'Compress JPG, PNG, and WebP images to reduce their file size.',
  'Compress many images at once and download them all in a single zip.',
  'See the exact before and after size and the percentage saved for each image.',
  'Images are compressed in your browser, so nothing is uploaded to a server.',
  'No watermarks added to your images, ever.',
  'Completely free with no signup and no daily limits.',
];

const faqs = [
  ['How do I compress an image for free?', 'Add your images above, pick a quality level, and click Compress. Each image is shrunk in your browser and you can download them individually or as a zip. It is free with no signup and no watermarks.'],
  ['How is Craftora different from TinyPNG or iLoveIMG?', 'TinyPNG and iLoveIMG upload your images to their servers to compress them. Craftora compresses images right in your browser, so your files never leave your device, with no daily upload limits.'],
  ['Will compressing lower the image quality?', 'Craftora reduces file size by re-encoding the image at your chosen quality. Better quality keeps images sharp with moderate savings, while smaller file gives the biggest reduction. You can preview the result size before downloading.'],
  ['Can I compress many images at once?', 'Yes. Add as many images as you like, compress them all in one click, and download them together as a single zip file.'],
  ['Do my images get uploaded anywhere?', 'No. Compression runs entirely in your browser on your own device. Your images are never sent to any server.'],
  ['What image formats are supported?', 'You can compress JPG, PNG, and WebP images. The compressed output is saved as an optimized JPG.'],
];

export default function CompressImagePage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <CompressImageTool />
    </ToolPage>
  );
}
