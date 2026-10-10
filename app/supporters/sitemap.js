import { getWall } from '../../lib/supporters';

export const dynamic = 'force-dynamic';

// Listed in the sitemap only once the wall is indexable (10 or more names).
export default async function sitemap() {
  const { total } = await getWall();
  return total >= 10 ? [{ url: 'https://craftora.dev/supporters', changeFrequency: 'weekly', priority: 0.4 }] : [];
}
