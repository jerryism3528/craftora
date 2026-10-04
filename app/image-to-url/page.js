import ToolPage from '../../components/ToolPage';
import ImageHostTool from '../../components/ImageHostTool';
import { getTool } from '../../lib/tools';

const tool = getTool('image-to-url');

export const metadata = {
  title: 'Image to URL: Free Image Hosting, Upload Image and Get Link',
  description:
    'Free image hosting. Upload an image and get a direct link, share page, HTML, Markdown, and BBCode instantly. JPG, PNG, WebP, and GIF up to 6 MB, auto-optimized with no visible quality loss.',
  keywords: ['image to url', 'free image hosting', 'upload image get link', 'image link generator', 'image url generator', 'photo to link', 'image uploader', 'host image free', 'direct image link', 'image hosting for forums', 'bbcode image hosting', 'imgbb alternative', 'postimages alternative', 'convert image to url'],
  alternates: { canonical: '/image-to-url' },
  openGraph: {
    title: 'Image to URL: Free Image Hosting With Direct Links | Craftora',
    description: 'Upload images and get direct links, HTML, Markdown, and BBCode. Free with an account.',
    url: 'https://craftora.dev/image-to-url',
    type: 'website',
  },
};

const howItWorks = [
  ['Upload your images', 'Drag in or choose JPG, PNG, WebP, or GIF images up to 6 MB each. You can upload several at once.'],
  ['We optimize them', 'Craftora compresses each image with no visible quality loss and removes hidden location data for your privacy.'],
  ['Copy your link', 'Get a direct image link, a share page, and ready-made HTML, Markdown, and BBCode to paste anywhere.'],
];

const features = [
  'Get a direct image URL that works in websites, emails, forums, and chats.',
  'Ready-made HTML, Markdown, and BBCode embed codes.',
  'A share page for every image with social media previews.',
  'Automatic compression with no visible quality loss.',
  'Location and camera data removed from photos for privacy.',
  'Upload several images at once, up to 6 MB each.',
  'Manage and delete your images any time.',
];

const faqs = [
  ['How do I convert an image to a URL?', 'Sign in, upload your image, and Craftora instantly gives you a direct link to it, plus a share page and embed codes. Copy the link and paste it anywhere.'],
  ['What is a direct image link?', 'A direct link points to the image file itself, ending in .jpg, .png, .webp, or .gif. It works inside websites, emails, forums, and anywhere that accepts an image URL.'],
  ['How do I embed an image in a forum or blog?', 'Use the BBCode tab for most forums, the HTML tab for websites and blogs, and the Markdown tab for GitHub, Reddit, and Discord.'],
  ['How many images can I upload?', 'Each free account can host up to 10 images at a time. Delete an old image to free up a slot.'],
  ['How long are images kept?', 'Images stay online for 6 months from upload, then are removed automatically. Your image list shows how many days each one has left.'],
  ['Are my images public?', 'Yes. Anyone with the link can view an uploaded image, and images appear on the public Explore page. Do not upload private or sensitive photos.'],
  ['Does compression reduce quality?', 'No visible loss. Images are re-saved with high-quality settings that typically make files 30 to 60% smaller, so they load faster everywhere you share them.'],
  ['Is it an ImgBB or PostImages alternative?', 'Yes. You get direct links, share pages, and HTML, Markdown, and BBCode for free, with automatic optimization and privacy cleanup.'],
];

export default function ImageToUrlPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <ImageHostTool />
    </ToolPage>
  );
}
