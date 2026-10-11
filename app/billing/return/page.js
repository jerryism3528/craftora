import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import BillingReturn from '../../../components/BillingReturn';

export const metadata = {
  title: 'Confirming your subscription',
  robots: { index: false, follow: false },
};

export default function BillingReturnPage() {
  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-4 py-16">
        <BillingReturn />
      </main>
      <Footer />
    </>
  );
}
