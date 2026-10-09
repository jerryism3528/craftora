import Link from 'next/link';
import { COMPANY, addressLine } from '../lib/company';

// "Who we are" box for the Privacy Policy and Terms pages.
export default function CompanyNotice({ kind = 'privacy' }) {
  return (
    <div className="my-6 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-4 text-sm text-slate-800 dark:text-slate-100">
      <div className="font-bold text-slate-900 dark:text-white">Who we are</div>
      <p className="mt-1">
        Craftora (craftora.dev) is owned and operated by <strong>{COMPANY.legalName}</strong>, a {COMPANY.state} limited liability company,
        located at {addressLine}.
        {kind === 'privacy'
          ? ` ${COMPANY.legalName} is responsible for the personal data described in this policy.`
          : ` In these terms, "Craftora", "we", "us", and "our" mean ${COMPANY.legalName}.`}
      </p>
      <p className="mt-1">
        Contact: <a href={`mailto:${COMPANY.supportEmail}`} className="text-indigo-700 dark:text-indigo-300 font-semibold hover:underline">{COMPANY.supportEmail}</a>
        {' '}or <a href={`mailto:${COMPANY.email}`} className="text-indigo-700 dark:text-indigo-300 font-semibold hover:underline">{COMPANY.email}</a>.
        {' '}<Link href="/about" className="text-indigo-700 dark:text-indigo-300 font-semibold hover:underline">About us</Link>
      </p>
    </div>
  );
}
