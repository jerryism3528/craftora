import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CompanyNotice from '../../components/CompanyNotice';

export const metadata = {
  title: 'Privacy Policy',
  description:
    'Craftora privacy policy. Learn how Craftora handles your files and data: browser-first processing, automatic file deletion within one hour, and no selling of data.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  const updated = 'October 2026';
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
<CompanyNotice kind="privacy" />
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
              Browser-based tools (most PDF, image, text, and developer tools) process your files on your own device. The files are not uploaded to Craftora. To count free daily uses of PDF and image tools, the page sends us only the tool name, the number of files and their sizes, never the files or their contents. Server-based tools (such as large file conversion and email verification) temporarily receive your file to do the job, then delete it automatically within one hour.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl mb-2">Accounts</h2>
            <p className="muted">
              You can use the everyday tools with no account. A free account is only needed for tools that save results for you, such as the Email Verifier and SEO Audit. If you create an account, we store your email address and your saved results so you can return to them. You can request deletion at any time.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl mb-2">Payments</h2>
            <p className="muted">
              Paid plans are optional. Card, PayPal, Venmo, Apple Pay, and Google Pay payments are processed by PayPal. USDC payments are processed by Coinbase. Craftora never sees or stores your full card number or wallet keys.
            </p>
            <p className="muted mt-3">
              From PayPal we receive the order or subscription ID, the amount, the payment method type (for example card or PayPal), the payer email, and the payment status. From Coinbase we receive the checkout ID, the amount, the payment status, and the blockchain transaction ID, which is public on the Base network. We keep these records to activate your plan, handle refunds, send renewal reminders, and meet tax and accounting rules. PayPal and Coinbase handle your payment details under their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl mb-2">Abuse prevention</h2>
            <p className="muted">
              To keep free daily limits fair and protect the service, we record your IP address and basic device information (a random device ID saved in your browser) when you use server-based tools, use a PDF or image tool, or sign in. We use this only to enforce limits and stop abuse, never for advertising.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl mb-2">Analytics and cookies</h2>
            <p className="muted">
              We use Google Analytics to understand which pages and tools are used, so we can improve them. It sets cookies and records things like the pages you visit, your browser and device type, and your approximate country or city. It never receives your files or anything you type into a tool (only searches on the All Tools page are counted), and we do not send it private pages such as signing links, reports, your account, or billing. Google signals and ad personalization are turned off. You can opt out with the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="brand-text hover:underline">Google Analytics opt-out add-on</a> or by blocking cookies in your browser.
            </p>
            <p className="muted mt-3">
              Other cookies are only used to keep the site working, such as keeping you signed in and remembering your preferences like light or dark mode. We do not sell your personal data.
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
