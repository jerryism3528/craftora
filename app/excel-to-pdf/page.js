import ToolPage from '../../components/ToolPage';
import OfficeToPdfTool from '../../components/OfficeToPdfTool';
import { getTool } from '../../lib/tools';

const tool = getTool('excel-to-pdf');

export const metadata = {
  title: 'Excel to PDF: Convert XLS and XLSX to PDF Free',
  description:
    'Free Excel to PDF converter. Turn XLS and XLSX spreadsheets into clean PDF files online, with every sheet, table, and chart included. Accurate, fast, and your file is deleted after conversion.',
  alternates: { canonical: '/excel-to-pdf' },
  openGraph: {
    title: 'Excel to PDF: Convert XLS and XLSX to PDF Free | Craftora',
    description: 'Convert Excel spreadsheets to PDF online with tables and charts preserved. Free with an account.',
    url: 'https://craftora.dev/excel-to-pdf',
    type: 'website',
  },
};

const howItWorks = [
  ['Upload your spreadsheet', 'Choose an XLS or XLSX file, or drag it into the box.'],
  ['Convert to PDF', 'Craftora renders every sheet with a full office engine.'],
  ['Download the PDF', 'Your PDF downloads automatically, ready to share or print.'],
];

const features = [
  'Converts XLS, XLSX, ODS, and CSV files to PDF.',
  'Includes every sheet in the workbook.',
  'Keeps tables, cell formatting, and charts.',
  'Files up to 20 MB.',
  'Your file is deleted from our server right after conversion.',
  'Free with a Craftora account, 20 conversions per day.',
];

const faqs = [
  ['How do I convert Excel to PDF?', 'Upload your XLS or XLSX file, click Convert to PDF, and the PDF downloads automatically. Every sheet in the workbook is included.'],
  ['Are all sheets converted?', 'Yes. Each sheet in your workbook becomes part of the PDF, in order.'],
  ['Why is my wide spreadsheet split across pages?', 'Very wide sheets can run past the page width. For the best fit, set the print area and page orientation (landscape) in Excel before converting, and the PDF will follow those settings.'],
  ['Can I convert a CSV file?', 'Yes. CSV files are supported and converted into a clean table layout in the PDF.'],
  ['Is my spreadsheet kept private?', 'Your file is converted on our server and deleted right after. It is never stored or shared.'],
  ['Why do I need an account?', 'Conversion uses real server power, so a free account helps prevent abuse. You get 20 conversions per day at no cost.'],
];

export default function ExcelToPdfPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <OfficeToPdfTool tool="excel-to-pdf" accept=".xls,.xlsx,.ods,.csv" label="Excel" formats="XLS, XLSX, ODS, or CSV" />
    </ToolPage>
  );
}
