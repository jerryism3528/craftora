import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'About Craftora: Free, Privacy-First Online Tools',
  description:
    'Craftora is a free online tools suite built around privacy and speed. Learn what Craftora is, how it keeps your files private, and why the tools are free.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div>
      <Header />
      <main className="editorial-width max-w-4xl px-4 sm:px-7 py-16 sm:py-24">
        <nav aria-label="Breadcrumb" className="text-sm muted mb-9">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="px-2">/</span>
          <span>About</span>
        </nav>

        <p className="brand-text text-xs font-extrabold tracking-[.16em] uppercase mb-4">About Craftora</p>
        <h1 className="font-extrabold tracking-tight text-4xl" style={{ color: 'var(--ink)' }}>
          Useful tools, made simpler
        </h1>

        <div className="mt-8 space-y-6 leading-8 text-lg" style={{ color: 'var(--ink)' }}>
          <p className="muted">
            Craftora is a free online tools suite built for quick, everyday tasks: merging PDFs, compressing images, converting files, verifying emails, running SEO checks, and more. No signup for the everyday tools, no watermarks, and no clutter.
          </p>
          <p className="muted">
            Most tools sites upload your files to their servers just to process them. Craftora is different. Wherever it is technically possible, your files are processed directly in your browser, so they never leave your device. That makes Craftora faster and more private than tools like iLovePDF, Smallpdf, or TinyWow for most day-to-day jobs.
          </p>
          <p className="muted">
            For the few tools that genuinely need a server (such as large file conversion or email verification), uploaded files are deleted automatically within one hour and are never sold or shared.
          </p>
          <p className="muted">
            Craftora is free because most tools run in your browser and cost almost nothing to serve. If Craftora saves you time, you can support it through a small donation, but every core tool stays free either way.
          </p>
        </div>

        <div className="mt-10">
          <Link
            href="/all-tools"
            className="inline-flex rounded-xl px-5 py-3 font-bold text-sm"
            style={{ background: 'var(--brand)', color: '#fff' }}
          >
            Explore all tools
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
