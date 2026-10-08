import Header from '../../../../../components/Header';
import DocEditor from '../../../../../components/sign/DocEditor';

export const metadata = { title: 'Prepare document: Craftora Sign', robots: { index: false, follow: false } };

export default function EditDocumentPage({ params }) {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 pb-16 min-h-[70vh]"><DocEditor id={params.id} /></main>
    </>
  );
}
