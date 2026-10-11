import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import CryptoReturn from '../../../components/CryptoReturn';

export const metadata = { title: 'Confirming your crypto payment', robots: { index: false, follow: false } };

export default function CryptoReturnPage() {
  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-4 py-16"><CryptoReturn /></main>
      <Footer />
    </>
  );
}
