import ToolPage from '../../components/ToolPage';
import SchemaGeneratorTool from '../../components/SchemaGeneratorTool';
import { getTool } from '../../lib/tools';

const tool = getTool('schema-generator');

export const metadata = {
  title: 'Schema Markup Generator: Free JSON-LD Structured Data',
  description:
    'Free schema markup generator. Create JSON-LD structured data for Organization, LocalBusiness, Article, Product, FAQ, and Breadcrumb to earn rich results in Google. Runs in your browser, ready to paste.',
  alternates: { canonical: '/schema-generator' },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Craftora: free online tools that just work' }], 
    title: 'Schema Markup Generator: Free JSON-LD Structured Data | Craftora',
    description: 'Generate JSON-LD schema for FAQ, Article, Product, LocalBusiness, and more. Free, ready to paste, no signup.',
    url: 'https://craftora.dev/schema-generator',
    type: 'website',
  },
};

const howItWorks = [
  ['Pick a schema type', 'Choose the type that fits your page: Organization, LocalBusiness, Article, Product, FAQ, or Breadcrumb.'],
  ['Fill in the details', 'Enter the fields for that type. FAQ and Breadcrumb let you add as many entries as you need.'],
  ['Copy the JSON-LD', 'Copy the generated script and paste it into the <head> of your page.'],
];

const features = [
  'Generate JSON-LD structured data, the format Google recommends.',
  'Supports Organization, LocalBusiness, Article, Product, FAQPage, and BreadcrumbList.',
  'Add unlimited questions for FAQ schema and levels for breadcrumbs.',
  'Clean, correctly nested output that follows the schema.org spec.',
  'Live preview updates as you type.',
  'Runs in your browser, ready to paste. Free with no signup.',
];

const faqs = [
  ['What is schema markup?', 'Schema markup is structured data you add to a page so search engines understand its content. It can unlock rich results, like star ratings, FAQ dropdowns, and breadcrumbs, which make your listing stand out and get more clicks.'],
  ['What is JSON-LD?', 'JSON-LD is the format Google recommends for schema markup. It sits in a script tag in your page\'s head and describes the page separately from the visible HTML, so it is clean and easy to manage. This tool outputs JSON-LD.'],
  ['How do I add schema to my website?', 'Generate the JSON-LD here, then paste the whole <script> block into the <head> section of your page. After publishing, test it with Google\'s Rich Results Test to confirm it is valid.'],
  ['Which schema type should I use?', 'Use Organization for a brand or company, LocalBusiness for a physical location, Article for blog posts, Product for store items, FAQPage for a Q&A section, and BreadcrumbList for navigation paths. You can add more than one type across a page.'],
  ['Does schema markup improve SEO?', 'Schema does not directly boost rankings, but it helps you win rich results and helps search engines and AI understand your page. Both can meaningfully increase click-through and visibility.'],
  ['Do I need to sign up?', 'No. The schema markup generator is free with no account and no limits.'],
];

export default function SchemaGeneratorPage() {
  return (
    <ToolPage tool={tool} howItWorks={howItWorks} features={features} faqs={faqs}>
      <SchemaGeneratorTool />
    </ToolPage>
  );
}
