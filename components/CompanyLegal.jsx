import Link from 'next/link';
import { COMPANY, addressLine, twitterUrl, organizationSchema } from '../lib/company';

// Sitewide legal line plus Organization structured data. Rendered inside the Footer.
export default function CompanyLegal() {
  return (
    <div className="w-full border-t border-slate-200 dark:border-slate-700 mt-8 pt-6 pb-2 text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }} />
      <p>
        {COMPANY.brand} is a product of <span className="font-semibold text-slate-700 dark:text-slate-200">{COMPANY.legalName}</span>, a {COMPANY.state} limited liability company.
      </p>
      <p className="mt-1">{addressLine}</p>
      <p className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
        <Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400">About us</Link>
        <a href={`mailto:${COMPANY.email}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">{COMPANY.email}</a>
        <a href={twitterUrl} target="_blank" rel="noopener" className="hover:text-indigo-600 dark:hover:text-indigo-400">X @{COMPANY.twitter}</a>
      </p>
    </div>
  );
}
