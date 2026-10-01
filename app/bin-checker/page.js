import ToolPage from '../../components/ToolPage';
import BinCheckerTool from '../../components/BinCheckerTool';
import { getTool } from '../../lib/tools';

const tool = getTool('bin-checker');

export const metadata = {
  title: 'BIN Checker: Bulk BIN Lookup With Bank and Country',
  description:
    'Free bulk BIN checker. Look up many card BINs at once to find the issuing bank, country, card brand, and type (credit or debit). Paste a list and export the results to CSV. For developers and verification.',
  alternates: { canonical: '/bin-checker' },
  openGraph: {
    title: 'BIN Checker: Bulk BIN Lookup With Bank and Country | Craftora',
    description: 'Look up many BINs at once: bank, country, brand, and card type. Export to CSV. Free with an account.',
    url: 'https://craftora.dev/bin-checker',
    type: 'website',
  },
};

const howItWorks = [
  ['Paste your BINs', 'Paste a list of BINs or card numbers, one per line or comma-separated. Only the first 6 to 8 digits are used.'],
  ['Look them up', 'Craftora checks each BIN against a database of over 340,000 BINs and returns the details.'],
  ['Export the results', 'Review the bank, country, brand, and card type in a table, then export everything to CSV.'],
];

const features = [
  'Look up many BINs at once, not one at a time.',
  'Returns the issuing bank, country, card brand, and type (credit or debit).',
  'Database of over 340,000 BINs covering major issuers worldwide.',
  'Paste full card numbers, the BIN is extracted automatically.',
  'Export all results to a CSV file.',
  'Free with a Craftora account, 200 lookups per day.',
];

const faqs = [
  ['What is a BIN?', 'A BIN (Bank Identification Number), also called an IIN, is the first 6 to 8 digits of a card number. It identifies the bank that issued the card, the card network, the country, and whether it is credit or debit.'],
  ['How is this different from the Card Validator?', 'The Card Validator checks a single card number for a valid format and shows its BIN details. The BIN Checker is built for volume: paste a whole list of BINs or cards, get a results table for all of them, and export to CSV. Use the validator for one card, the BIN checker for many.'],
  ['What details does a BIN lookup give?', 'For each BIN, Craftora returns the card brand (Visa, Mastercard, Amex, and more), the card type (credit or debit), the issuing bank, and the country. Some BINs also include a category like classic or business.'],
  ['How accurate is the data?', 'The lookup uses a public BIN database with over 340,000 entries, which covers the vast majority of major banks and networks. Smaller or newly issued regional BINs may not be listed, in which case the row shows as not found.'],
  ['Do you store the card numbers I paste?', 'Only the BIN (first 6 to 8 digits) is used for the lookup, and the rest of any full card number is trimmed and ignored. Nothing is stored. BINs are not tied to any individual cardholder.'],
  ['Why do I need an account?', 'The bulk lookup runs on the server, so a free Craftora account is needed with 200 lookups per day. For a single card with no signup, use the Card Validator instead.'],
];

export default function BinCheckerPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <BinCheckerTool />
    </ToolPage>
  );
}
