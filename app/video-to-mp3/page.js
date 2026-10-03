import ToolPage from '../../components/ToolPage';
import MediaConvertTool from '../../components/MediaConvertTool';
import { getTool } from '../../lib/tools';

const tool = getTool('video-to-mp3');

export const metadata = {
  title: 'Video to MP3: Convert MP4 to MP3 and Extract Audio Free',
  description:
    'Free video to MP3 converter. Extract the audio from MP4, MOV, MKV, AVI, WEBM, and other videos and save it as MP3, M4A, or WAV in up to 320 kbps quality. Files up to 100 MB.',
  keywords: [
    'video to mp3', 'mp4 to mp3', 'convert mp4 to mp3', 'extract audio from video', 'mov to mp3',
    'mkv to mp3', 'webm to mp3', 'avi to mp3', 'video to audio', 'mp4 to mp3 converter',
  ],
  alternates: { canonical: '/video-to-mp3' },
  openGraph: {
    title: 'Video to MP3: Convert MP4 to MP3 and Extract Audio Free | Craftora',
    description: 'Extract audio from any video and save it as MP3, M4A, or WAV in up to 320 kbps. Free with an account.',
    url: 'https://craftora.dev/video-to-mp3',
    type: 'website',
  },
};

const howItWorks = [
  ['Upload your video', 'Choose an MP4, MOV, MKV, AVI, WEBM, or other video file up to 100 MB.'],
  ['Pick the audio format', 'Choose MP3 (default), M4A, AAC, or WAV, and a quality up to 320 kbps.'],
  ['Download the audio', 'The soundtrack is extracted and downloads automatically as an audio file.'],
];

const features = [
  'Extracts audio from MP4, MOV, MKV, AVI, WEBM, WMV, FLV, 3GP, and more.',
  'Save as MP3, M4A, AAC, or WAV.',
  'Choose 128, 192, or 320 kbps quality.',
  'Perfect for saving music, lectures, podcasts, and interviews from videos.',
  'Videos up to 60 minutes and 100 MB.',
  'Your file is deleted from our server right after conversion.',
];

const faqs = [
  ['How do I convert MP4 to MP3?', 'Upload your MP4 video, keep MP3 selected, and click Convert. The audio track is extracted and saved as an MP3 that plays on any phone, computer, or car stereo.'],
  ['How do I extract audio from a video?', 'Upload any video file and choose the audio format you want. Craftora pulls the soundtrack out and gives you just the audio, without the picture.'],
  ['Which quality should I choose?', '192 kbps is great for most music and speech. Choose 320 kbps for the best music quality, or 128 kbps for small files like lectures and voice notes.'],
  ['Does it work with iPhone videos?', 'Yes. iPhone videos are usually MOV files, which are fully supported. Upload the MOV and convert it to MP3.'],
  ['Can I convert a YouTube link?', 'No. Craftora converts video files you already have on your device. Only convert videos you own or have the right to use.'],
  ['Is there a length limit?', 'Videos can be up to 60 minutes long and 100 MB.'],
  ['Why do I need an account?', 'Conversion runs on our servers, so a free account helps prevent abuse. You get 20 conversions per day at no cost.'],
];

export default function VideoToMp3Page() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <MediaConvertTool
        tool="video-to-mp3"
        accept=".mp4,.mov,.avi,.mkv,.webm,.wmv,.flv,.m4v,.3gp,.mpeg,.mpg,.ts"
        label="video"
        formatsText="MP4, MOV, MKV, AVI, WEBM, WMV, FLV, 3GP, or MPEG"
        outputs={[['mp3', 'MP3'], ['m4a', 'M4A'], ['aac', 'AAC'], ['wav', 'WAV']]}
        defaultTo="mp3"
        option={{ label: 'Quality', default: '192', values: [['128', '128 kbps'], ['192', '192 kbps'], ['320', '320 kbps']], hideFor: ['wav'] }}
        dailyLimit={20}
        icon="Headphones"
      />
    </ToolPage>
  );
}
