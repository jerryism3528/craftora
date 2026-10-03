import ToolPage from '../../components/ToolPage';
import BinListTool from '../../components/BinListTool';
import { getTool } from '../../lib/tools';

const tool = getTool('bin-list');

export const metadata = {
  title: 'BIN List: Browse Card BIN Ranges by Country and Network',
  description:
    'Free BIN list and directory. Browse over 340,000 card BINs by network (Visa, Mastercard, and more) and by country. See BIN ranges, issuing banks, and card types, and export any list to CSV.',
  alternates: { canonical: '/bin-list' },
  openGraph: {
    title: 'BIN List: Browse Card BIN Ranges by Country and Network | Craftora',
    description: 'Browse 340,000+ BINs by network and country. See ranges, banks, and card types. Free, no signup.',
    url: 'https://craftora.dev/bin-list',
    type: 'website',
  },
};

const howItWorks = [
  ['Pick a network or country', 'Browse the directory and click a card network or a country to open its BIN list.'],
  ['See the BIN ranges', 'View the BINs with their issuing bank, card brand, and type (credit or debit).'],
  ['Export what you need', 'Page through the list and export any page to CSV.'],
];

const features = [
  'Browse over 340,000 BINs by card network and by country.',
  'See the issuing bank, brand, and card type for each BIN.',
  'A clean directory view, no searching required.',
  'Paginated lists for large networks and countries.',
  'Export any page to CSV.',
  'Completely free with no signup.',
];

const faqs = [
  ['What is a BIN list?', 'A BIN list is a directory of Bank Identification Numbers, the first 6 to 8 digits of card numbers, grouped so you can browse them. Craftora lets you browse BINs by card network (like Visa or Mastercard) and by country, and see the bank and card type for each.'],
  ['What is a BIN range?', 'A BIN range is a block of BINs assigned to a single issuer or card product. Issuers are given ranges by the card networks, so one bank can have many BINs. Browsing by network or country shows you the BINs that fall within those ranges.'],
  ['How is this different from BIN Search?', 'The BIN List is a browsable directory: you click a network or country and scroll the results, no typing needed. BIN Search is for targeted queries, like finding all BINs for a specific bank name. Use the list to explore, use search to find something specific.'],
  ['Can I see BINs for a specific country?', 'Yes. The directory lets you click any of the top countries to see the BINs on record for that country, with the bank, brand, and card type for each.'],
  ['Is the BIN list free?', 'Yes. Browsing the BIN list is completely free with no signup. For bulk BIN lookups or searching by bank name, a free account unlocks those server tools.'],
  ['How accurate is the data?', 'The list is based on a public BIN database with over 340,000 entries. It covers the major networks and countries well, though it is not exhaustive and some smaller or newer ranges may be missing.'],
];

export default function BinListPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <BinListTool />
    </ToolPage>
  );
}
