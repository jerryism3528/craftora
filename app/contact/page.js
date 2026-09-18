import Link from 'next/link';
import * as Lucide from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Contact Craftora',
  description:
    'Get in touch with Craftora. Questions, feedback, or a tool request? Email the Craftora team at support@craftora.dev.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div>
      <Header />
      <main className="editorial-width max-w-3xl px-4 sm:px-7 py-16 sm:py-24">
        <nav aria-label="Breadcrumb" className="text-sm muted mb-9">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="px-2">/</span>
          <span>Contact</span>
        </nav>

        <p className="brand-text text-xs font-extrabold tracking-[.16em] uppercase mb-3">Get in touch</p>
        <h1 className="font-extrabold tracking-tight text-4xl" style={{ color: 'var(--ink)' }}>Contact Craftora</h1>
        <p className="muted mt-5 text-lg leading-8">
          Have a question, found a bug, or want to request a new tool? We would love to hear from you. Email is the fastest way to reach the Craftora team.
        </p>

        <div className="mt-10 border surface rounded-2xl p-7 flex items-start gap-4">
          <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--surface-soft)' }}>
            <Lucide.Mail className="brand-text w-5 h-5" />
          </span>
          <div>
            <strong className="block" style={{ color: 'var(--ink)' }}>Email us</strong>
            <a href="mailto:support@craftora.dev" className="brand-text hover:underline text-lg font-semibold">
              support@craftora.dev
            </a>
            <p className="muted text-sm mt-2">We usually reply within a couple of days.</p>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/all-tools" className="inline-flex rounded-xl px-5 py-3 font-bold text-sm" style={{ background: 'var(--brand)', color: '#fff' }}>
            Browse all tools
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
