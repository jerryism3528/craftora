import ToolPage from '../../components/ToolPage';
import EbookToPdfTool from '../../components/EbookToPdfTool';
import { getTool } from '../../lib/tools';

const tool = getTool('ebook-to-pdf');

export const metadata = {
  title: 'Ebook to PDF: Convert EPUB, MOBI, AZW3 to PDF Free',
  description:
    'Free ebook to PDF converter. Convert EPUB, MOBI, AZW3, AZW, FB2, and Kindle books to PDF online with a clickable table of contents, page numbers, and your choice of page and text size. Files up to 50 MB, no page limit.',
  keywords: [
    'ebook to pdf', 'epub to pdf', 'mobi to pdf', 'azw3 to pdf', 'azw to pdf', 'kindle to pdf',
    'fb2 to pdf', 'convert ebook to pdf', 'epub to pdf converter', 'cbz to pdf',
  ],
  alternates: { canonical: '/ebook-to-pdf' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Ebook to PDF: Convert EPUB, MOBI, AZW3 to PDF Free | Craftora',
    description: 'Convert EPUB, MOBI, AZW3, and Kindle books to clean, printable PDFs with a table of contents. Up to 50 MB, no page limit.',
    url: 'https://craftora.dev/ebook-to-pdf',
    type: 'website',
  },
};

const howItWorks = [
  ['Upload your ebook', 'Choose an EPUB, MOBI, AZW3, AZW, FB2, LIT, PDB, CBZ, or TXT file up to 50 MB.'],
  ['Pick your layout', 'Choose a page size (A4, Letter, A5, or 6 x 9 book size), a text size, and whether to add a table of contents and page numbers.'],
  ['Download the PDF', 'Your book is converted and downloads as a clean, printable PDF that opens on any device.'],
];

const features = [
  'Converts EPUB, MOBI, AZW3, AZW, FB2, LIT, PDB, CBZ comics, and TXT to PDF.',
  'Handles full-length books with images, files up to 50 MB and no page limit.',
  'Clickable table of contents built from the book chapters.',
  'Choose A4, Letter, A5, or 6 x 9 inch book size for printing.',
  'Small, medium, or large text for comfortable reading.',
  'Optional page numbers, clean margins, and the original cover kept in proportion.',
  'Powered by Calibre, the most trusted ebook conversion engine.',
  'Your file is deleted from our server right after conversion.',
];

const faqs = [
  ['How do I convert an ebook to PDF?', 'Upload your EPUB, MOBI, AZW3, or other ebook file, pick your page size and text size, and click Convert to PDF. The finished PDF downloads automatically.'],
  ['How do I convert EPUB to PDF?', 'Upload the EPUB file and click Convert to PDF. Craftora keeps the chapters, images, and formatting, and can add a clickable table of contents so you can jump between chapters.'],
  ['Can I convert Kindle books (MOBI, AZW, AZW3) to PDF?', 'Yes, as long as the file is DRM-free. MOBI, AZW, and AZW3 are Kindle formats, and Craftora converts them to PDF just like EPUB. Books bought from the Kindle store usually have DRM, which cannot be converted.'],
  ['What is DRM and why can some ebooks not be converted?', 'DRM (digital rights management) is copy protection that stores add to purchased books. DRM-protected files are locked to the store app, so no converter can open them legally. Free and DRM-free ebooks, such as public domain books and many indie titles, convert without issues.'],
  ['Is there a page limit?', 'No. Craftora converts full-length books of any length, including long novels and textbooks, as long as the file is under 50 MB.'],
  ['Which page size should I choose?', 'Pick A4 or Letter for printing at home, A5 for a compact printed book, or 6 x 9 inches for a classic paperback book layout. For reading on a tablet, A5 or 6 x 9 look best.'],
  ['Can I convert comic books (CBZ) to PDF?', 'Yes. CBZ comic archives are converted page by page into a PDF that you can read on any device.'],
  ['Is my ebook kept private?', 'Your file is converted on our server and deleted right after. It is never stored, shared, or added to any library.'],
];

export default function EbookToPdfPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <EbookToPdfTool />
    </ToolPage>
  );
}
