import ToolPage from '../../components/ToolPage';
import MediaConvertTool from '../../components/MediaConvertTool';
import { getTool } from '../../lib/tools';

const tool = getTool('video-converter');

export const metadata = {
  title: 'Video Converter: Convert MP4, MOV, AVI, MKV, WEBM Free',
  description:
    'Free online video converter. Convert MOV to MP4, AVI to MP4, MKV to MP4, WEBM to MP4, and more, or turn a video into a GIF. Choose 1080p, 720p, or 480p to shrink file size. Files up to 100 MB.',
  keywords: [
    'video converter', 'mov to mp4', 'avi to mp4', 'mkv to mp4', 'webm to mp4', 'mp4 to webm',
    'video to gif', 'mp4 to gif', 'wmv to mp4', 'convert video online', 'reduce video size',
  ],
  alternates: { canonical: '/video-converter' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Video Converter: Convert MP4, MOV, AVI, MKV, WEBM Free | Craftora',
    description: 'Convert videos between MP4, MOV, AVI, MKV, and WEBM, or make a GIF. Free with an account.',
    url: 'https://craftora.dev/video-converter',
    type: 'website',
  },
};

const howItWorks = [
  ['Upload your video', 'Choose an MP4, MOV, AVI, MKV, WEBM, WMV, FLV, 3GP, or MPEG file up to 100 MB.'],
  ['Pick a format and size', 'Choose MP4, WEBM, MOV, MKV, AVI, or GIF, and optionally lower the resolution to make the file smaller.'],
  ['Download', 'Your converted video downloads automatically, ready to play, share, or upload.'],
];

const features = [
  'Converts MP4, MOV, AVI, MKV, WEBM, WMV, FLV, M4V, 3GP, and MPEG videos.',
  'Outputs MP4 (plays everywhere), WEBM, MOV, MKV, AVI, or animated GIF.',
  'Resize to 1080p, 720p, or 480p to cut the file size for sharing.',
  'MP4 output is web-optimized so it starts playing instantly online.',
  'Videos up to 15 minutes and 100 MB.',
  'Your file is deleted from our server right after conversion.',
];

const faqs = [
  ['How do I convert a video to MP4?', 'Upload your video, choose MP4, and click Convert. MP4 plays on every phone, computer, TV, and website, so it is the safest format for sharing.'],
  ['How do I convert MOV to MP4?', 'Upload the MOV file (common from iPhones and Macs), pick MP4, and convert. The MP4 will play on Windows, Android, and any website.'],
  ['Can I make a video file smaller?', 'Yes. Choose 720p or 480p resolution when converting. Lower resolution creates a much smaller file that is easier to email or upload, while still looking good on phones.'],
  ['How do I turn a video into a GIF?', 'Upload your video and choose GIF. Craftora converts the first 30 seconds into a high-quality looping GIF, sized for sharing in chats and on social media.'],
  ['Which format should I choose?', 'Choose MP4 for the best compatibility, WEBM for websites, MOV for Apple editing apps, MKV for archiving, and GIF for short looping clips.'],
  ['Is there a length limit?', 'Videos can be up to 15 minutes long and 100 MB. For longer videos, trim them first or lower the resolution.'],
  ['Why do I need an account?', 'Video conversion uses a lot of server power, so a free account helps prevent abuse. You get 10 video conversions per day at no cost.'],
];

export default function VideoConverterPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <MediaConvertTool
        tool="video-converter"
        accept=".mp4,.mov,.avi,.mkv,.webm,.wmv,.flv,.m4v,.3gp,.mpeg,.mpg,.ts"
        label="video"
        formatsText="MP4, MOV, AVI, MKV, WEBM, WMV, FLV, 3GP, or MPEG"
        outputs={[['mp4', 'MP4'], ['webm', 'WEBM'], ['mov', 'MOV'], ['mkv', 'MKV'], ['avi', 'AVI'], ['gif', 'GIF']]}
        defaultTo="mp4"
        option={{ label: 'Resolution', default: 'original', values: [['original', 'Original'], ['1080', '1080p'], ['720', '720p'], ['480', '480p']], hideFor: ['gif'] }}
        dailyLimit={10}
        icon="FileVideo"
        note="Videos up to 15 minutes. GIF output uses the first 30 seconds. Lower the resolution to make the file smaller."
      />
    </ToolPage>
  );
}
