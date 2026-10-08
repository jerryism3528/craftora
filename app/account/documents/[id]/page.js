import { Suspense } from 'react';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import DocDetail from '../../../../components/sign/DocDetail';

export const metadata = { title: 'Document: Craftora Sign', robots: { index: false, follow: false } };

export default function DocumentPage({ params }) {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-10 min-h-[70vh]"><Suspense fallback={null}><DocDetail id={params.id} /></Suspense></main>
      <Footer />
    </>
  );
}
