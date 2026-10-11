import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import AccountBilling from '../../../components/AccountBilling';

export const metadata = {
  title: 'Billing',
  robots: { index: false, follow: false },
};

export default function AccountBillingPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Billing</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1">Your plan, subscription, and renewal date.</p>
        <AccountBilling />
      </main>
      <Footer />
    </>
  );
}
