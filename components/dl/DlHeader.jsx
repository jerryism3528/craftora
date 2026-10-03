import Link from 'next/link';

const NAV = [
  ['/tiktok-downloader', 'TikTok'],
  ['/instagram-reels-downloader', 'Instagram'],
  ['/facebook-video-downloader', 'Facebook'],
  ['/twitter-video-downloader', 'X'],
  ['/youtube-video-downloader', 'YouTube'],
];

export default function DlHeader() {
  return (
    <header className="border-b surface" style={{ background: 'var(--surface)' }}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-extrabold text-xl" style={{ color: 'var(--ink)' }}>Craftora</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: 'var(--brand)', color: '#fff' }}>Downloader</span>
        </Link>
        <nav className="flex-1 flex items-center gap-5 overflow-x-auto text-sm font-semibold whitespace-nowrap">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} style={{ color: 'var(--ink)' }}>{label}</Link>
          ))}
        </nav>
        <a href="https://craftora.dev/all-tools" className="hidden sm:inline-flex shrink-0 text-sm font-bold brand-text">70+ free tools</a>
      </div>
    </header>
  );
}
