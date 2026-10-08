import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import DocsDashboard from '../../../components/sign/DocsDashboard';

export const metadata = { title: 'My Documents: Craftora Sign', robots: { index: false, follow: false } };

export default function DocumentsPage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-10 min-h-[70vh]"><DocsDashboard /></main>
      <Footer />
    </>
  );
}
