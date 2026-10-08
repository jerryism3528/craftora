import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import SeoSiteReport from '../../../components/seo/SeoSiteReport';

export const metadata = {
  title: 'Website SEO Audit Report',
  robots: { index: false, follow: false },
};

export default function SeoReportPage({ params }) {
  return (
    <>
      <div className="print:hidden"><Header /></div>
      <main className="max-w-6xl mx-auto px-4 py-10 min-h-[70vh]">
        <SeoSiteReport id={params.id} />
      </main>
      <div className="print:hidden"><Footer /></div>
    </>
  );
}
