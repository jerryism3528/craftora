import Link from 'next/link';
import DlHeader from '../../components/dl/DlHeader';
import DlFooter from '../../components/dl/DlFooter';
import DownloaderTool from '../../components/dl/DownloaderTool';
import PlatformIcon from '../../components/dl/PlatformIcon';
import { downloaders, liveDownloaders, DL_BASE } from '../../lib/downloaders';

export const metadata = {
  title: { absolute: 'Free Video Downloader: TikTok, Instagram, Facebook, X Online | Craftora' },
  description: 'Free online video downloader. Download videos from TikTok without watermark, Instagram Reels, Facebook, X (Twitter), and Dailymotion in HD MP4 or MP3. No app, no login, works on any phone or PC.',
  keywords: ['video downloader', 'online video downloader', 'free video downloader', 'social media video downloader', 'tiktok downloader', 'instagram reels downloader', 'facebook video downloader', 'twitter video downloader', 'download video from link', 'video downloader no watermark', 'all in one video downloader', 'mp4 downloader', 'video to mp3 downloader'],
  alternates: { canonical: DL_BASE },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Free Video Downloader: TikTok, Instagram, Facebook, X | Craftora',
    description: 'Download videos from TikTok, Instagram, Facebook, X, and more in HD. Free, no app, no login.',
    url: DL_BASE, type: 'website', siteName: 'Craftora Downloader',
  },
};

const faqs = [
  ['How do I download a video from a link?', 'Copy the video link from the app (Share, then Copy link), paste it into the box above, and click Get video. Choose MP4 or MP3 and click Download.'],
  ['Which sites are supported?', 'TikTok, Instagram (Reels and videos), Facebook, X (Twitter), and Dailymotion work right now. YouTube, Threads, Vimeo, Bilibili, Douyin, and RedNote are coming soon.'],
  ['Is this video downloader free?', 'Yes. It is completely free with no sign-up. To keep it fast for everyone, each visitor can download up to 20 files per hour.'],
  ['Do I need to install an app?', 'No. Everything works in your browser on iPhone, Android, Windows, and Mac.'],
  ['Do you store the videos?', 'No. Each video is fetched for you, sent to your device, and deleted from our server right away.'],
  ['Can I download private videos?', 'No. Only public posts can be downloaded. Private accounts and login-only content are not accessible.'],
];

function Card({ d }) {
  return (
    <Link href={`/${d.slug}`} className="border surface rounded-2xl p-4 flex items-start gap-3" style={{ background: 'var(--surface)' }}>
      <PlatformIcon item={d} size={42} />
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <strong className="text-sm" style={{ color: 'var(--ink)' }}>{d.name}</strong>
          {!d.live && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md" style={{ background: 'var(--surface-soft)', color: 'var(--muted)' }}>Soon</span>}
        </span>
        <span className="block muted text-xs mt-1 leading-5">{d.short}</span>
      </span>
    </Link>
  );
}

export default function DownloaderHome() {
  const schema = [
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Craftora Video Downloader', url: DL_BASE, applicationCategory: 'MultimediaApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ];
  return (
    <div>
      <DlHeader />
      <main className="max-w-6xl mx-auto px-5">
        <section className="pt-12 pb-8 max-w-3xl">
          <h1 className="font-extrabold text-4xl sm:text-5xl leading-tight" style={{ color: 'var(--ink)' }}>Free Online Video Downloader</h1>
          <p className="muted text-lg mt-4">Download videos from TikTok without watermark, Instagram Reels, Facebook, and X in HD MP4 or MP3. Paste a link, that's it. No app, no login.</p>
        </section>

        <DownloaderTool liveList={liveDownloaders} />

        <section className="mt-14">
          <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>Choose your platform</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
            {downloaders.map((d) => <Card key={d.slug} d={d} />)}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>How to download a video</h2>
          <ol className="grid sm:grid-cols-3 gap-4 mt-5">
            {[['Copy the link', 'In TikTok, Instagram, Facebook, or X, tap Share and Copy link.'], ['Paste it here', 'Paste the link in the box above and click Get video.'], ['Download', 'Pick MP4 or MP3 and the quality, then click Download.']].map(([t, d], i) => (
              <li key={t} className="border surface rounded-2xl p-5" style={{ background: 'var(--surface)' }}>
                <span className="brand-text font-extrabold">Step {i + 1}</span>
                <p className="font-bold mt-1" style={{ color: 'var(--ink)' }}>{t}</p>
                <p className="muted text-sm mt-1">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 max-w-3xl">
          <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>Frequently asked questions</h2>
          <div className="mt-5 space-y-3">
            {faqs.map(([q, a]) => (
              <details key={q} className="border surface rounded-xl p-4" style={{ background: 'var(--surface)' }}>
                <summary className="font-semibold cursor-pointer" style={{ color: 'var(--ink)' }}>{q}</summary>
                <p className="muted text-sm mt-2 leading-6">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <DlFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </div>
  );
}
