import { GUIDES } from '../../../lib/seo-guides';

export default function sitemap() {
  const base = 'https://craftora.dev/seo-audit/checks';
  return [
    { url: base, changeFrequency: 'monthly', priority: 0.7 },
    ...Object.values(GUIDES).map((g) => ({ url: `${base}/${g.slug}`, changeFrequency: 'monthly', priority: 0.6 })),
  ];
}
