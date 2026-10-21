import { PAYMENT_ICONS } from '../lib/payment-icons';

// Row of accepted payment methods. Chips stay white in dark mode so brand colors stay readable.
function Chip({ id }) {
  if (id === 'usdc') {
    return (
      <span title="USDC (Coinbase)" className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#2775CA" /><text x="12" y="16.5" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">$</text></svg>
        <span className="text-xs font-bold text-[#2775CA]">USDC</span>
      </span>
    );
  }
  const i = PAYMENT_ICONS[id];
  if (!i) return null;
  return (
    <span title={i.label} className="inline-flex h-9 w-14 items-center justify-center rounded-md border border-slate-200 bg-white">
      <svg viewBox="0 0 24 24" className="h-7 w-12" role="img" aria-label={i.label} preserveAspectRatio="xMidYMid meet"><path d={i.path} fill={i.hex} /></svg>
    </span>
  );
}

export const SUB_METHODS = ['paypal', 'visa', 'mastercard', 'amex', 'discover'];
export const ONCE_METHODS = ['applepay', 'googlepay', 'paypal', 'venmo', 'visa', 'mastercard', 'amex', 'discover'];

export default function PaymentMethods({ methods, label, className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {label && <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>}
      <ul className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Accepted payment methods">
        {methods.map((m) => <li key={m}><Chip id={m} /></li>)}
      </ul>
    </div>
  );
}
