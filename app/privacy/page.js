import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Privacy Policy',
  description:
    'Craftora privacy policy. Learn how Craftora handles your files and data: browser-first processing, automatic file deletion within one hour, and no selling of data.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  const updated = 'September 2026';
  return (
    <div>
      <Header />
      <main className="editorial-width max-w-3xl px-4 sm:px-7 py-16 sm:py-24">
        <nav aria-label="Breadcrumb" className="text-sm muted mb-9">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="px-2">/</span>
          <span>Privacy Policy</span>
        </nav>

        <h1 className="font-extrabold tracking-tight text-4xl" style={{ color: 'var(--ink)' }}>Privacy Policy</h1>
        <p className="muted text-sm mt-3">Last updated: {updated}</p>

        <div className="mt-8 space-y-8 leading-7" style={{ color: 'var(--ink)' }}>
          <section>
            <h2 className="font-bold text-xl mb-2">The short version</h2>
            <p className="muted">
              Craftora is built to collect as little as possible. Most tools run entirely in your browser, so your files never reach our servers. For the few tools that need a server, files are deleted automatically within one hour and are never sold or shared.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl mb-2">Files you process</h2>
            <p className="muted">
              Browser-based tools (most PDF, image, text, and developer tools) process your files on your own device. The files are not uploaded to Craftora. Server-based tools (such as large file conversion and email verification) temporarily receive your file to do the job, then delete it automatically within one hour.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl mb-2">Accounts</h2>
            <p className="muted">
              You can use the everyday tools with no account. A free account is only needed for tools that save results for you, such as the Email Verifier and SEO Audit. If you create an account, we store your email address and your saved results so you can return to them. You can request deletion at any time.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl mb-2">Analytics and cookies</h2>
            <p className="muted">
              Craftora may use privacy-friendly analytics to understand which tools are used, in aggregate. We do not sell your personal data. Any cookies used are limited to keeping the site working and remembering your preferences, such as light or dark mode.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl mb-2">Contact</h2>
            <p className="muted">
              Questions about privacy? Reach us any time at <a href="mailto:support@craftora.dev" className="brand-text hover:underline">support@craftora.dev</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
