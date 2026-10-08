import ToolPage from '../../components/ToolPage';
import ConvertFromPdfTool from '../../components/ConvertFromPdfTool';
import { getTool } from '../../lib/tools';

const tool = getTool('pdf-to-excel');

export const metadata = {
  title: 'PDF to Excel: Convert PDF Tables to XLSX Free',
  description:
    'Free PDF to Excel converter. Extract tables from PDF files into an editable XLSX spreadsheet online, each table on its own sheet. Great for bank statements, invoices, and reports.',
  alternates: { canonical: '/pdf-to-excel' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'PDF to Excel: Convert PDF Tables to XLSX Free | Craftora',
    description: 'Extract tables from a PDF into an editable Excel spreadsheet. Free with an account.',
    url: 'https://craftora.dev/pdf-to-excel',
    type: 'website',
  },
};

const howItWorks = [
  ['Upload your PDF', 'Choose a PDF that contains tables, or drag it into the box.'],
  ['Extract the tables', 'Craftora detects each table and places it on its own sheet.'],
  ['Work in Excel', 'Download the XLSX and sort, filter, or calculate in Excel or Google Sheets.'],
];

const features = [
  'Extracts tables from PDF into an editable XLSX file.',
  'Each table goes on its own clearly named sheet.',
  'Works great on statements, invoices, price lists, and reports.',
  'If no tables are found, the text is listed line by line instead.',
  'Your file is deleted from our server right after conversion.',
  'Free with a Craftora account, 20 conversions per day.',
];

const faqs = [
  ['How do I convert a PDF to Excel?', 'Upload your PDF, click Convert to Excel, and the XLSX downloads automatically. Each table found in the PDF is placed on its own sheet.'],
  ['What kind of PDFs work best?', 'PDFs with clear tables, such as bank statements, invoices, and reports created by software, convert best. Tables drawn with lines or clear column spacing are detected most reliably.'],
  ['What if my PDF has no tables?', 'If no tables are detected, Craftora lists the text line by line with page numbers, so you still get the content in a spreadsheet.'],
  ['Can I convert a scanned PDF to Excel?', 'A scanned PDF is an image with no real text inside. Run it through PDF OCR first, then convert the result to Excel.'],
  ['Is my file kept private?', 'Your PDF is converted on our server and deleted right after. It is never stored or shared.'],
  ['Why do I need an account?', 'Conversion runs on our servers, so a free account helps prevent abuse. You get 20 conversions per day at no cost.'],
];

export default function PdfToExcelPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <ConvertFromPdfTool tool="pdf-to-excel" outLabel="Excel" outExt="xlsx" note="Each table in your PDF goes on its own sheet. Works best on PDFs made by software with clear tables. Scanned PDFs need PDF OCR first." />
    </ToolPage>
  );
}
