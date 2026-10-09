import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CompanyNotice from '../../components/CompanyNotice';
import { SITE, COMPANY, addressLine } from '../../lib/company';

const UPDATED = 'October 9, 2026';

export const metadata = {
  title: 'Terms of Service | Craftora',
  description: 'The terms for using Craftora free online tools, accounts, the SEO audit, and the Document Signer. Craftora is operated by GE Promo Hub LLC, Florida, USA.',
  alternates: { canonical: '/terms' },
  openGraph: {
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }],
    title: 'Terms of Service | Craftora',
    description: 'The rules for using Craftora tools and accounts.',
    url: `${SITE}/terms`,
    type: 'website',
  },
};

const SECTIONS = [
  ['acceptance', 'Accepting these terms', [
    'By using craftora.dev or any Craftora tool, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use Craftora.',
    'You must be at least 13 years old to use Craftora, and at least 18 years old (or the age of majority where you live) to create an account or send documents for signature.',
  ]],
  ['service', 'The service', [
    'Craftora provides free online tools for PDFs, images, file conversion, text, developer tasks, SEO, email verification, and electronic signatures.',
    'Most tools run entirely in your browser, so your files are not uploaded to our servers. Some tools need our servers to work. Files uploaded to those tools are deleted automatically, usually within one hour.',
    'We may add, change, limit, or remove tools and features at any time. Tools are provided free of charge, and we may introduce optional paid plans in the future. If we do, paid features will be clearly labeled and nothing will be charged without your clear agreement.',
  ]],
  ['accounts', 'Accounts', [
    'Some tools, such as the full-site SEO audit, the Email Verifier, and the Document Signer, require a free account. You agree to give accurate information, keep your password secure, and tell us right away if you think your account has been accessed without permission.',
    'You are responsible for activity on your account. One person may not create multiple accounts to get around limits. Disposable or temporary email addresses are not allowed.',
    'You can delete your history and close your account at any time by contacting us.',
  ]],
  ['limits', 'Fair use and daily limits', [
    'To keep Craftora fast and free for everyone, server-based tools have daily or hourly usage limits. Limits are shown in each tool and may change over time.',
    'You may not try to get around limits, for example by using many accounts, scripts, bots, or rotating IP addresses or VPNs. We track usage per account, device, and IP address to prevent abuse.',
  ]],
  ['acceptable-use', 'Acceptable use', [
    'You agree not to use Craftora to: break any law; upload or process content you do not have the right to use; infringe anyone\'s copyright, trademark, or privacy; send spam or unsolicited messages; harass, threaten, or defraud anyone; or upload malware or harmful code.',
    'The Email Verifier may only be used for addresses you have a lawful reason to contact. You are responsible for following anti-spam and privacy laws such as CAN-SPAM and GDPR when you use the results.',
    'The SEO audit and Sitemap Generator may only be used on websites you own or have permission to audit. Do not use them to overload or attack any website.',
    'Card and BIN tools, including the Test Card Generator, are for software development and testing only. Generated numbers are not real payment cards. Using any Craftora tool for payment fraud or any attempt to make an unauthorized purchase is strictly prohibited and may be reported to the authorities.',
    'Do not try to hack, scrape, reverse engineer, overload, or interfere with Craftora or its servers.',
  ]],
  ['content', 'Your content', [
    'You keep all rights to the files and content you use with Craftora. You give us only the limited permission needed to process, store, and deliver your content so the tools can work, for example to send a document to the signers you choose.',
    'We do not sell your files or personal data, and we do not use your files to train AI models.',
  ]],
  ['signatures', 'Electronic signatures (Document Signer)', [
    'Craftora Sign lets you send PDF documents for electronic signature. In the United States, electronic signatures are generally recognized under the federal ESIGN Act and state laws based on the Uniform Electronic Transactions Act (UETA). Other countries have their own rules, and some documents (for example certain wills, court orders, or real estate filings) may require a handwritten signature, a notary, or another special form.',
    'You are responsible for deciding whether an electronic signature is appropriate for your document, for the content of your documents, and for sending them only to the right people. Craftora is not a party to any agreement signed through the service, and we do not give legal advice.',
    'Each completed document includes a certificate of completion with signer names, email addresses, timestamps, and IP addresses, and a fingerprint (SHA-256) that anyone can check on our Verify Document page.',
    'Signing links expire after 30 days if a document is not completed. Drafts, voided, declined, and expired documents may be deleted after a period of inactivity. Download and keep your own copy of every completed document. We are not responsible for keeping copies forever.',
  ]],
  ['ip', 'Craftora\'s rights', [
    'The Craftora name, logo, website design, and software belong to GE Promo Hub LLC and are protected by law. You may not copy or resell the service or use our brand without written permission.',
  ]],
  ['third-party', 'Third-party sites and services', [
    'Craftora may link to or rely on third-party websites and services, such as Google sign-in and email delivery. We are not responsible for their content or practices, and their own terms apply.',
  ]],
  ['disclaimer', 'Disclaimer', [
    'Craftora is provided "as is" and "as available" without warranties of any kind, whether express or implied, including warranties of merchantability, fitness for a particular purpose, accuracy, and non-infringement.',
    'Tool results such as email verification status, SEO scores, file conversions, and generated content may contain errors. Always check important results yourself and keep backups of your original files.',
  ]],
  ['liability', 'Limitation of liability', [
    'To the fullest extent allowed by law, GE Promo Hub LLC and its owners, employees, and partners will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of data, profits, revenue, or business, arising from your use of Craftora.',
    'Our total liability for any claim related to Craftora is limited to the greater of the amount you paid us in the 12 months before the claim, or 50 US dollars.',
    'Some places do not allow these limits, so they may not fully apply to you.',
  ]],
  ['indemnity', 'Indemnity', [
    'You agree to defend and hold harmless GE Promo Hub LLC from claims, losses, and costs (including reasonable legal fees) that result from your content, your misuse of Craftora, or your breaking these terms or any law.',
  ]],
  ['termination', 'Suspension and termination', [
    'We may suspend or close accounts, block access to tools, or remove content if we reasonably believe these terms have been broken, to protect other users, or when required by law. You may stop using Craftora at any time.',
  ]],
  ['law', 'Governing law', [
    'These terms are governed by the laws of the State of Florida, USA, without regard to conflict of law rules. Any dispute will be handled in the state or federal courts located in Polk County, Florida, unless the law where you live requires otherwise.',
  ]],
  ['changes', 'Changes to these terms', [
    'We may update these terms from time to time. When we do, we will change the "Last updated" date at the top of this page, and for important changes we may also notify account holders by email. Continuing to use Craftora after changes take effect means you accept the updated terms.',
  ]],
];

export default function TermsPage() {
  const schema = [
    { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Terms of Service', url: `${SITE}/terms`, dateModified: '2026-10-09', publisher: { '@id': `${SITE}/#organization` } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE }, { '@type': 'ListItem', position: 2, name: 'Terms of Service', item: `${SITE}/terms` }] },
  ];
  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <nav className="text-sm text-slate-500 dark:text-slate-400 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-600">Home</Link> <span className="mx-1">/</span>
          <span className="text-slate-700 dark:text-slate-200">Terms of Service</span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Terms of Service</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Last updated: {UPDATED}</p>
        <CompanyNotice kind="terms" />

        <nav aria-label="Contents" className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="font-bold text-slate-900 dark:text-white text-sm">Contents</div>
          <ol className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm list-decimal list-inside marker:text-slate-500 dark:marker:text-slate-400">
            {SECTIONS.map(([id, title]) => <li key={id}><a href={`#${id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{title}</a></li>)}
            <li><a href="#contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">Contact us</a></li>
          </ol>
        </nav>

        {SECTIONS.map(([id, title, paras], i) => (
          <section key={id} id={id} className="mt-10 scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{i + 1}. {title}</h2>
            {paras.map((p, j) => <p key={j} className="text-slate-700 dark:text-slate-300 mt-3 leading-relaxed">{p}</p>)}
            {id === 'signatures' && <p className="text-slate-700 dark:text-slate-300 mt-3">Check a signed copy any time at <Link href="/verify-document" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Verify Document</Link>, or start a new one with the <Link href="/document-signer" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Document Signer</Link>.</p>}
          </section>
        ))}

        <section id="contact" className="mt-10 scroll-mt-24">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{SECTIONS.length + 1}. Contact us</h2>
          <p className="text-slate-700 dark:text-slate-300 mt-3 leading-relaxed">
            Questions about these terms? Email <a href={`mailto:${COMPANY.supportEmail}`} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">{COMPANY.supportEmail}</a> or write to {COMPANY.legalName}, {addressLine}.
            Read how we handle your data in our <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Privacy Policy</Link>, or learn <Link href="/about" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">about Craftora</Link>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
