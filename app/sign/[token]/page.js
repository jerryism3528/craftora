import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import SignerView from '../../../components/sign/SignerView';

export const metadata = { title: 'Review and sign: Craftora Sign', robots: { index: false, follow: false }, referrer: 'no-referrer' };

export default function SignPage({ params }) {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 pb-16 min-h-[70vh]"><SignerView token={params.token} /></main>
      <Footer />
    </>
  );
}
