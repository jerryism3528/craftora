import ToolPage from '../../components/ToolPage';
import BinSearchTool from '../../components/BinSearchTool';
import { getTool } from '../../lib/tools';

const tool = getTool('bin-search');

export const metadata = {
  title: 'BIN Search: Find Card BINs by Bank, Country, Brand',
  description:
    'Free BIN search tool. Search a database of over 340,000 BINs by bank name, country, card brand, or type (credit or debit). Find the BIN ranges for any issuer and export the results to CSV.',
  alternates: { canonical: '/bin-search' },
  openGraph: {
    title: 'BIN Search: Find Card BINs by Bank, Country, Brand | Craftora',
    description: 'Search 340,000+ BINs by bank, country, brand, or card type. Find issuer BIN ranges and export to CSV.',
    url: 'https://craftora.dev/bin-search',
    type: 'website',
  },
};

const howItWorks = [
  ['Set your filters', 'Enter a bank name, or pick a country, card brand, or card type. Combine filters to narrow the search.'],
  ['Search the database', 'Craftora searches over 340,000 BINs and returns every match in a results table.'],
  ['Browse and export', 'Page through the results and export the current page to CSV.'],
];

const features = [
  'Search by bank name, country, card brand, or credit/debit type.',
  'Combine filters to find exactly the BINs you need.',
  'Database of over 340,000 BINs covering issuers worldwide.',
  'Paginated results for large searches.',
  'Export results to CSV.',
  'Free with a Craftora account, 200 searches per day.',
];

const faqs = [
  ['What is a BIN search?', 'A BIN search finds card BIN ranges based on what you know, such as a bank name or country. Instead of starting with a card number, you start with the issuer and get back the BINs that belong to it. It is the reverse of a BIN lookup.'],
  ['How is this different from the BIN Checker?', 'The BIN Checker takes BINs you already have and returns their details. BIN Search is the opposite: you do not have a BIN, you search by bank, country, brand, or type to find matching BINs. Use the checker when you have a card, use search when you want to discover BINs.'],
  ['Can I find all BINs for a specific bank?', 'Yes. Enter the bank name (a partial name works, like "Chase") and Craftora returns the BINs on record for that issuer. You can add a country or brand filter to narrow it further.'],
  ['What filters can I combine?', 'You can combine a bank name with a country, a card brand (Visa, Mastercard, and more), and a card type (credit or debit). The more filters you add, the more specific the results.'],
  ['How accurate and complete is the data?', 'The database has over 340,000 BINs from a public source and covers the major issuers and networks well. It is not exhaustive, so some smaller or newer BIN ranges may not appear.'],
  ['Why do I need an account?', 'BIN Search runs queries against a large database on the server, so a free account is needed, with 200 searches per day. For looking up a single card you already have, the Card Validator needs no signup.'],
];

export default function BinSearchPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <BinSearchTool />
    </ToolPage>
  );
}
