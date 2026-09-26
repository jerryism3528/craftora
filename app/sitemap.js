import { tools, categories } from '../lib/tools';
import { getAllPosts } from '../lib/posts';

const SITE = 'https://craftora.dev';

export default function sitemap() {
  const now = new Date();

  const staticPages = [
    { url: `${SITE}/`, priority: 1.0, changeFrequency: 'weekly' },
    { url: `${SITE}/all-tools`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${SITE}/insights`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${SITE}/about`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${SITE}/privacy`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${SITE}/contact`, priority: 0.3, changeFrequency: 'yearly' },
  ];

  const categoryPages = categories.map((c) => ({
    url: `${SITE}/${c.slug}`,
    priority: 0.8,
    changeFrequency: 'weekly',
  }));

  // Only live tool pages (soon tools have no page yet).
  const toolPages = tools
    .filter((t) => t.status === 'live')
    .map((t) => ({
      url: `${SITE}/${t.slug}`,
      priority: 0.9,
      changeFrequency: 'monthly',
    }));

  const postPages = getAllPosts().map((p) => ({
    url: `${SITE}/insights/${p.slug}`,
    lastModified: new Date(p.date),
    priority: 0.7,
    changeFrequency: 'monthly',
  }));

  return [...staticPages, ...categoryPages, ...toolPages, ...postPages].map((e) => ({
    lastModified: now,
    ...e,
  }));
}
