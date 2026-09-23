import ToolPage from '../../components/ToolPage';
import ConvertImageTool from '../../components/ConvertImageTool';
import { getTool } from '../../lib/tools';

const tool = getTool('convert-image');

export const metadata = {
  title: 'Convert Image: JPG, PNG, and WebP Converter Free',
  description:
    'Convert images online for free. Change JPG, PNG, and WebP formats in seconds, convert many images at once, with no signup, no watermarks, and full privacy. Your images never leave your browser.',
  alternates: { canonical: '/convert-image' },
  openGraph: {
    title: 'Convert Image: JPG, PNG, and WebP Converter Free | Craftora',
    description: 'Convert between JPG, PNG, and WebP for free, right in your browser. No uploads, no watermarks, no signup.',
    url: 'https://craftora.dev/convert-image',
    type: 'website',
  },
};

const howItWorks = [
  ['Add your images', 'Drop your images into the box or choose them from your device. Add as many as you like.'],
  ['Choose a format', 'Pick the format you want: JPG, PNG, or WebP. WebP gives the smallest files for the web.'],
  ['Convert and download', 'Convert all your images at once, then download them one by one or together in a zip.'],
];

const features = [
  'Convert between JPG, PNG, and WebP image formats.',
  'Convert many images at once and download them all in a single zip.',
  'WebP output produces smaller files that load faster on websites.',
  'JPG output adds a clean white background where images were transparent.',
  'Images are converted in your browser, so nothing is uploaded to a server.',
  'Completely free with no signup, no watermarks, and no daily limits.',
];

const faqs = [
  ['How do I convert an image for free?', 'Add your images above, choose the format you want, and click Convert. Each image is converted in your browser and you can download them individually or as a zip. It is free with no signup and no watermarks.'],
  ['How do I convert PNG to JPG or JPG to PNG?', 'Add your PNG or JPG images, choose the target format (JPG or PNG), and click Convert. The converted images download instantly. It works both ways, and for WebP too.'],
  ['What is WebP and should I use it?', 'WebP is a modern image format that makes much smaller files than JPG or PNG at similar quality. It is great for websites because pages load faster. Most current browsers support it.'],
  ['How is Craftora different from other converters?', 'Many online converters upload your images to their servers. Craftora converts images right in your browser, so your files never leave your device, with no daily limits or watermarks.'],
  ['Can I convert several images at once?', 'Yes. Add as many images as you like, convert them all in one click, and download them together as a single zip file.'],
  ['Do my images get uploaded anywhere?', 'No. Conversion runs entirely in your browser on your own device. Your images are never sent to any server.'],
];

export default function ConvertImagePage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <ConvertImageTool />
    </ToolPage>
  );
}
