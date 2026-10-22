import ToolPage from '../../components/ToolPage';
import InvoiceGeneratorTool from '../../components/InvoiceGeneratorTool';
import { getTool } from '../../lib/tools';

const tool = getTool('invoice-generator');

export const metadata = {
  title: 'Invoice Generator: Create Free PDF Invoices',
  description:
    'Free online invoice generator. Add your logo, line items, tax, discounts, and payment method, then download a professional PDF invoice. Runs in your browser, no signup, nothing stored.',
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
  'Create professional PDF invoices in minutes, with your logo or company name and your brand color.',
  'Automatic subtotal, discount, tax, shipping, and total, with paid and balance due.',
  'Unlimited line items. Long invoices continue onto extra pages with page numbers.',
  'Optional payment method, processor, and how the charge appears on the card or bank statement.',
  'Paid, Unpaid, and Overdue stamps, payment terms with automatic due dates, and PO numbers.',
  '18 currencies or your own, plus a Next invoice button that keeps your details.',
  'Runs in your browser, nothing is uploaded or stored. Free with no signup.',
];

const faqs = [
  ['How do I create an invoice for free?', 'Fill in your business and client details, add your line items with quantities and prices, and click Download PDF. Craftora calculates the totals and tax and gives you a clean invoice. It is free and runs in your browser.'],
  ['Is the invoice a real PDF?', 'Yes. Craftora generates a proper PDF file you can email, print, or attach, with your details, itemized charges, tax, and total laid out professionally.'],
  ['Can I add tax to the invoice?', 'Yes. Enter a tax rate as a percentage and it is applied to the subtotal automatically, with the tax amount and final total shown on the invoice.'],
  ['Can I use my own currency?', 'Yes. Set the currency symbol to anything you need, like $, EUR, GBP, or Rs, and it is used throughout the invoice.'],
  ['Can I show how the invoice was paid?', 'Yes. In the optional Payment method section, choose Cash, Bank transfer, Card, PayPal, Stripe, Square, Zelle, crypto, and more. For card and online payments you can add the payment processor and the name that appears on the client card or bank statement, so they recognize the charge. You can also add a transaction or reference ID.'],
  ['Can I add a discount, shipping, or a partial payment?', 'Yes. Add a flat or percentage discount, a shipping charge, and any amount already paid. The invoice shows the total, the amount paid, and the balance due.'],
  ['What if my invoice has many items?', 'Add as many line items as you need. Long descriptions wrap neatly, and if the items do not fit on one page the invoice continues onto the next page with the table header repeated and page numbers added.'],
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
