import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import VerifyTool from '../../components/sign/VerifyTool';

const SITE = 'https://craftora.dev';

export const metadata = {
  title: 'Verify a Signed PDF: Check if a Document Is Authentic',
  description: 'Check if a PDF signed with Craftora Sign is authentic and unchanged. Upload the file to see who signed it and when. Free, and the file never leaves your device.',
  alternates: { canonical: '/verify-document' },
  openGraph: { title: 'Verify a Signed PDF | Craftora', description: 'Check if a signed PDF is authentic and unchanged. Free.', url: `${SITE}/verify-document`, type: 'website' },
};

const faqs = [
  ['How does document verification work?', 'Your browser calculates a SHA-256 fingerprint of the PDF and checks it against the fingerprints of documents completed with Craftora Sign. The file itself is never uploaded.'],
  ['Why does my signed PDF show no match?', 'Any change to the file changes its fingerprint. Re-saving, editing, compressing, printing to PDF, or scanning the document all create a different file. Use the original signed PDF from the completion email or your Craftora account.'],
  ['Can I verify documents signed with other services?', 'No. This page verifies documents completed with Craftora Sign. Other services have their own verification tools.'],
  ['What details are shown when a document matches?', 'The document title and ID, when it was completed, who sent it, and the names of the signers with partly hidden email addresses.'],
];

export default function VerifyPage() {
  const schema = [
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Verify Signed PDF', url: `${SITE}/verify-document`, applicationCategory: 'BusinessApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE }, { '@type': 'ListItem', position: 2, name: 'Document Signer', item: `${SITE}/document-signer` }, { '@type': 'ListItem', position: 3, name: 'Verify Document', item: `${SITE}/verify-document` }] },
  ];
  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <nav className="text-sm text-slate-500 dark:text-slate-400 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-600">Home</Link> <span className="mx-1">/</span>
          <Link href="/document-signer" className="hover:text-indigo-600">Document Signer</Link> <span className="mx-1">/</span>
          <span className="text-slate-700 dark:text-slate-200">Verify Document</span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Verify a Signed PDF</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mt-3">Check that a document signed with Craftora Sign is authentic and has not been changed since everyone signed it.</p>
        <div className="mt-8"><VerifyTool /></div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-12">Frequently asked questions</h2>
        <div className="mt-4 space-y-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <summary className="font-semibold text-slate-900 dark:text-white cursor-pointer">{q}</summary>
              <p className="text-slate-700 dark:text-slate-300 mt-2">{a}</p>
            </details>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
