import ToolPage from '../../components/ToolPage';
import InvoiceGeneratorTool from '../../components/InvoiceGeneratorTool';
import { getTool } from '../../lib/tools';

const tool = getTool('invoice-generator');

export const metadata = {
  title: 'Invoice Generator: Create Free PDF Invoices',
  description:
    'Free online invoice generator. Fill in your business, client, and line items, and download a clean professional PDF invoice with automatic totals and tax. Runs in your browser, no signup, nothing stored.',
  alternates: { canonical: '/invoice-generator' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Invoice Generator: Create Free PDF Invoices | Craftora',
    description: 'Create and download professional PDF invoices with automatic totals and tax. Free, private, no signup.',
    url: 'https://craftora.dev/invoice-generator',
    type: 'website',
  },
};

const howItWorks = [
  ['Fill in the details', 'Add your business info, the client, and an invoice number and dates.'],
  ['Add your line items', 'Enter each item with a quantity and price. Totals and tax are calculated automatically.'],
  ['Download the PDF', 'Download a clean, professional PDF invoice ready to send to your client.'],
];

const features = [
  'Create professional PDF invoices in minutes.',
  'Automatic subtotal, tax, and total calculation.',
  'Add as many line items as you need.',
  'Set your own currency symbol and tax rate.',
  'Add notes for payment terms or a thank-you message.',
  'Runs in your browser, nothing is uploaded or stored. Free with no signup.',
];

const faqs = [
  ['How do I create an invoice for free?', 'Fill in your business and client details, add your line items with quantities and prices, and click Download PDF. Craftora calculates the totals and tax and gives you a clean invoice. It is free and runs in your browser.'],
  ['Is the invoice a real PDF?', 'Yes. Craftora generates a proper PDF file you can email, print, or attach, with your details, itemized charges, tax, and total laid out professionally.'],
  ['Can I add tax to the invoice?', 'Yes. Enter a tax rate as a percentage and it is applied to the subtotal automatically, with the tax amount and final total shown on the invoice.'],
  ['Can I use my own currency?', 'Yes. Set the currency symbol to anything you need, like $, EUR, GBP, or Rs, and it is used throughout the invoice.'],
  ['Is my invoice data private?', 'Yes. The invoice is built entirely in your browser on your own device. Nothing you enter is uploaded or stored anywhere.'],
  ['Do I need to sign up?', 'No. The invoice generator is free with no account and no limits.'],
];

export default function InvoiceGeneratorPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <InvoiceGeneratorTool />
    </ToolPage>
  );
}
