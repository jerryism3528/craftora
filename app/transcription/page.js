import ToolPage from '../../components/ToolPage';
import TranscriptionTool from '../../components/TranscriptionTool';
import { getTool } from '../../lib/tools';

const tool = getTool('transcription');

export const metadata = {
  title: 'Transcribe Audio and Video to Text Free, With Subtitles',
  description:
    'Free AI transcription. Convert audio and video to text in English, Urdu, Hindi, Arabic, and 90+ languages. Get timestamps and download SRT or VTT subtitle files. MP3, WAV, M4A, MP4, MOV and more.',
  keywords: [
    'transcribe audio to text', 'audio to text', 'video to text', 'speech to text', 'transcription free',
    'mp3 to text', 'mp4 to text', 'srt generator', 'subtitle generator', 'auto captions', 'urdu speech to text',
    'transcribe video', 'voice to text', 'whisper transcription',
  ],
  alternates: { canonical: '/transcription' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Transcribe Audio and Video to Text Free, With Subtitles | Craftora',
    description: 'AI transcription in 90+ languages with timestamps and SRT/VTT subtitle downloads. Free with an account.',
    url: 'https://craftora.dev/transcription',
    type: 'website',
  },
};

const howItWorks = [
  ['Upload your file', 'Choose an audio file (MP3, WAV, M4A, OGG, FLAC) or a video (MP4, MOV, MKV, WEBM) up to 100 MB.'],
  ['Pick the language', 'Leave it on auto-detect, or choose the spoken language for the best accuracy.'],
  ['Watch the progress', 'A live progress bar shows the upload, then the transcription percentage as it works.'],
  ['Copy or download', 'Copy the text, or download it as TXT, SRT, or VTT subtitles with timestamps.'],
];

const features = [
  'AI speech to text powered by the Whisper model.',
  'Works with audio and video: MP3, WAV, M4A, AAC, OGG, FLAC, MP4, MOV, MKV, WEBM, and more.',
  'Auto-detects the language, or choose from 90+ including English, Urdu, Hindi, Arabic, and Punjabi.',
  'Timestamped transcript view for easy navigation.',
  'Download SRT and VTT subtitle files ready for YouTube, video editors, and players.',
  'Live progress bar with percentage while it works.',
  '30 minutes of transcription per day, free with an account.',
  'Your file is deleted as soon as the transcript is ready.',
];

const faqs = [
  ['How do I transcribe audio to text for free?', 'Upload your audio file, choose the language or leave it on auto-detect, and click Transcribe. When it finishes, copy the text or download it as a TXT file. You get 30 minutes of transcription per day with a free account.'],
  ['Can I transcribe a video?', 'Yes. Upload an MP4, MOV, MKV, WEBM, or other video file and Craftora transcribes the speech from its audio track. You do not need to convert it to audio first.'],
  ['How do I make subtitles for a video?', 'Transcribe the video, then click SRT or VTT to download a subtitle file with timestamps. SRT works with YouTube, Premiere Pro, CapCut, VLC, and most video tools. VTT is the standard for web video players.'],
  ['Does it support Urdu and Hindi?', 'Yes. Craftora supports 90+ languages, including Urdu, Hindi, Punjabi, Arabic, Bengali, and Persian. For mixed or regional speech, choosing the language manually gives the best results.'],
  ['How accurate is the transcription?', 'Clear speech with little background noise transcribes very accurately. Heavy accents, music, overlapping voices, or poor recordings lower accuracy, so a quick read-through before publishing is a good idea.'],
  ['How long does it take?', 'Roughly 1 minute of processing for every 2 to 3 minutes of audio. A live progress bar shows exactly how far along it is. If others are transcribing at the same time, you may wait briefly in line.'],
  ['What are the limits?', 'Each day you get 30 minutes of audio, and a single file can use the whole allowance. Files can be up to 100 MB. The allowance refreshes 24 hours after your first use.'],
  ['Is my recording private?', 'Your file is processed on our own server and deleted as soon as the transcript is ready. The transcript itself expires after 1 hour, so download what you need. Nothing is shared or used for training.'],
];

export default function TranscriptionPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <TranscriptionTool />
    </ToolPage>
  );
}
