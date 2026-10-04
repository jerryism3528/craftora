import Link from 'next/link';

const MAIN = 'https://' + 'craftora.dev';

export default function ImgHeader() {
  return (
    <header className="border-b surface" style={{ background: 'var(--surface)' }}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-5">
        <a href={`${MAIN}/image-to-url`} className="flex items-center gap-2 shrink-0">
          <span className="font-extrabold text-xl" style={{ color: 'var(--ink)' }}>Craftora</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: 'var(--brand)', color: '#fff' }}>Images</span>
        </a>
        <nav className="flex-1 flex items-center gap-5 text-sm font-semibold">
          <a href={`${MAIN}/image-to-url`} style={{ color: 'var(--ink)' }}>Upload</a>
          <Link href="/explore" style={{ color: 'var(--ink)' }}>Explore</Link>
        </nav>
        <a href={`${MAIN}/all-tools`} className="hidden sm:inline-flex text-sm font-bold brand-text">70+ free tools</a>
      </div>
    </header>
  );
}
