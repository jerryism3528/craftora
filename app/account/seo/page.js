import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import SeoDashboard from '../../../components/seo/SeoDashboard';

export const metadata = {
  title: 'SEO Dashboard: Your Website Audits',
  robots: { index: false, follow: false },
};

export default function SeoDashboardPage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-10 min-h-[70vh]">
        <SeoDashboard />
      </main>
      <Footer />
    </>
  );
}
