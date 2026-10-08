import ToolPage from '../../components/ToolPage';
import MediaConvertTool from '../../components/MediaConvertTool';
import { getTool } from '../../lib/tools';

const tool = getTool('audio-converter');

export const metadata = {
  title: 'Audio Converter: Convert WAV, M4A, FLAC, OGG to MP3 Free',
  description:
    'Free online audio converter. Convert WAV to MP3, M4A to MP3, FLAC to MP3, OGG, AAC, WMA, OPUS, and more. Choose 128, 192, or 320 kbps quality. Files up to 100 MB and 60 minutes.',
  keywords: [
    'audio converter', 'wav to mp3', 'm4a to mp3', 'flac to mp3', 'mp3 to wav', 'ogg to mp3',
    'wma to mp3', 'aac to mp3', 'opus to mp3', 'convert audio online', 'mp3 converter',
  ],
  alternates: { canonical: '/audio-converter' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Audio Converter: Convert WAV, M4A, FLAC, OGG to MP3 Free | Craftora',
    description: 'Convert audio between MP3, WAV, M4A, AAC, OGG, FLAC, and OPUS. Free with an account.',
    url: 'https://craftora.dev/audio-converter',
    type: 'website',
  },
};

const howItWorks = [
  ['Upload your audio', 'Choose an MP3, WAV, M4A, AAC, OGG, FLAC, WMA, OPUS, AIFF, or AMR file up to 100 MB.'],
  ['Pick a format and quality', 'Choose the output format and a bitrate: 128 kbps for small files, 320 kbps for the best quality.'],
  ['Download', 'Your converted audio downloads automatically with its title and artist tags kept.'],
];

const features = [
  'Converts MP3, WAV, M4A, AAC, OGG, FLAC, WMA, OPUS, AIFF, and AMR.',
  'Outputs MP3, WAV, M4A, AAC, OGG, FLAC, or OPUS.',
  'Choose 128, 192, or 320 kbps for MP3, M4A, AAC, and OPUS.',
  'Keeps song details like title, artist, and album.',
  'Audio up to 60 minutes and 100 MB.',
  'Your file is deleted from our server right after conversion.',
];

const faqs = [
  ['How do I convert WAV to MP3?', 'Upload the WAV file, choose MP3, pick a quality, and click Convert. MP3 files are around 10 times smaller than WAV with almost no audible difference at 192 or 320 kbps.'],
  ['How do I convert M4A to MP3?', 'Upload the M4A file (common from iPhone voice memos and iTunes), choose MP3, and convert. The MP3 will play on any device or car stereo.'],
  ['Which bitrate should I pick?', '128 kbps is fine for voice recordings and podcasts, 192 kbps is great for most music, and 320 kbps gives the best MP3 quality for music you care about.'],
  ['What is the difference between MP3, WAV, and FLAC?', 'MP3 is small and plays everywhere. WAV is uncompressed and very large. FLAC is lossless like WAV but about half the size. Choose MP3 for sharing and FLAC or WAV for editing or archiving.'],
  ['Are song tags kept?', 'Yes. Title, artist, album, and other details from the original file are copied to the converted file when the format supports them.'],
  ['Is there a length limit?', 'Audio files can be up to 60 minutes long and 100 MB.'],
  ['Why do I need an account?', 'Conversion runs on our servers, so a free account helps prevent abuse. You get 20 audio conversions per day at no cost.'],
];

export default function AudioConverterPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <MediaConvertTool
        tool="audio-converter"
        accept=".mp3,.wav,.m4a,.aac,.ogg,.oga,.flac,.wma,.opus,.aiff,.aif,.amr"
        label="audio"
        formatsText="MP3, WAV, M4A, AAC, OGG, FLAC, WMA, OPUS, AIFF, or AMR"
        outputs={[['mp3', 'MP3'], ['wav', 'WAV'], ['m4a', 'M4A'], ['aac', 'AAC'], ['ogg', 'OGG'], ['flac', 'FLAC'], ['opus', 'OPUS']]}
        defaultTo="mp3"
        option={{ label: 'Quality', default: '192', values: [['128', '128 kbps'], ['192', '192 kbps'], ['320', '320 kbps']], hideFor: ['wav', 'flac', 'ogg'] }}
        dailyLimit={20}
        icon="FileAudio"
      />
    </ToolPage>
  );
}
