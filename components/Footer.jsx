import Link from 'next/link';
import * as Lucide from 'lucide-react';
import { categories } from '../lib/tools';

// TODO: replace with the real GoFundMe campaign URL when it's live.
const DONATE_URL = 'https://www.gofundme.com/';

// High-value, high-search tools to surface directly in the footer.
const POPULAR_TOOLS = [
  ['Merge PDF', 'merge-pdf'],
  ['Compress PDF', 'compress-pdf'],
  ['PDF to JPG', 'pdf-to-jpg'],
  ['Compress Image', 'compress-image'],
  ['Resize Image', 'resize-image'],
  ['JSON Formatter', 'json-formatter'],
  ['QR Code Generator', 'qr-code-generator'],
  ['Password Generator', 'password-generator'],
  ['Invoice Generator', 'invoice-generator'],
  ['Email Verifier', 'email-verifier'],
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t surface" style={{ background: 'var(--surface)' }}>
      <div className="editorial-width px-4 sm:px-7 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-9">
          <div>
            <strong className="text-xl font-extrabold" style={{ color: 'var(--ink)' }}>Craftora</strong>
            <p className="muted text-sm leading-6 mt-3 max-w-xs">
              Free online tools that just work. Privacy-first PDF, image, file, SEO, and developer tools with no signup and no watermarks.
            </p>
            
              href={DONATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold mt-5"
              style={{ background: 'var(--brand)', color: '#ffffff' }}
            >
              <Lucide.Heart className="w-4 h-4" />
              Donate
            </a>
          </div>

          <div>
            <h2 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--ink)' }}>Categories</h2>
            <div className="mt-4 space-y-2 text-sm">
              {categories.map((c) => (
                <Link key={c.key} href={`/${c.slug}`} className="block muted hover:underline">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--ink)' }}>Popular tools</h2>
            <div className="mt-4 space-y-2 text-sm">
              {POPULAR_TOOLS.map(([name, slug]) => (
                <Link key={slug} href={`/${slug}`} className="block muted hover:underline">
                  {name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--ink)' }}>Craftora</h2>
            <div className="mt-4 space-y-2 text-sm">
              <Link href="/all-tools" className="block muted hover:underline">All Tools</Link>
              <Link href="/about" className="block muted hover:underline">About</Link>
              <Link href="/privacy" className="block muted hover:underline">Privacy Policy</Link>
              <Link href="/contact" className="block muted hover:underline">Contact</Link>
            </div>
          </div>
        </div>

        <div className="section-rule mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="muted text-xs">© {year} Craftora. All rights reserved.</p>
          <p className="muted text-xs">Free online tools that just work.</p>
        </div>
      </div>
    </footer>
  );
}
