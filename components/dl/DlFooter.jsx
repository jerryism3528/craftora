import Link from 'next/link';
import { downloaders } from '../../lib/downloaders';

const TOOLS = [
  ['video-to-mp3', 'Video to MP3'],
  ['video-converter', 'Video Converter'],
  ['audio-converter', 'Audio Converter'],
  ['transcription', 'Audio and Video Transcription'],
  ['compress-image', 'Compress Image'],
  ['merge-pdf', 'Merge PDF'],
];

export default function DlFooter() {
  return (
    <footer className="border-t surface mt-20" style={{ background: 'var(--surface)' }}>
      <div className="max-w-6xl mx-auto px-5 py-12 grid sm:grid-cols-3 gap-10">
        <div>
          <p className="font-extrabold text-lg" style={{ color: 'var(--ink)' }}>Craftora Downloader</p>
          <p className="muted text-sm mt-2 leading-6">Free online video downloader for TikTok, Instagram, Facebook, X, and more. No app, no login, no watermark.</p>
        </div>
        <div>
          <p className="font-bold text-sm mb-3" style={{ color: 'var(--ink)' }}>Downloaders</p>
          <ul className="space-y-2 text-sm">
            {downloaders.map((d) => (
              <li key={d.slug}><Link href={`/${d.slug}`} className="muted">{d.name}{!d.live ? ' (soon)' : ''}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-bold text-sm mb-3" style={{ color: 'var(--ink)' }}>More free tools on Craftora</p>
          <ul className="space-y-2 text-sm">
            {TOOLS.map(([slug, name]) => (
              <li key={slug}><a href={`https://craftora.dev/${slug}`} className="muted">{name}</a></li>
            ))}
            <li><a href="https://craftora.dev/all-tools" className="brand-text font-semibold">See all 70+ tools</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-5 pb-10 text-xs muted leading-5">
        Craftora is not affiliated with TikTok, Instagram, Facebook, X, Dailymotion, YouTube, or any other platform. All trademarks belong to their owners. Only download content you own or have permission to use. © {new Date().getFullYear()} Craftora.
      </div>
    </footer>
  );
}
