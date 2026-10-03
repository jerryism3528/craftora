import { downloaders, DL_BASE } from '../../../lib/downloaders';

export const dynamic = 'force-static';

export function GET() {
  const now = new Date().toISOString();
  const urls = [{ loc: DL_BASE, p: '1.0' }, ...downloaders.map((d) => ({ loc: `${DL_BASE}/${d.slug}`, p: d.live ? '0.9' : '0.6' }))];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${now}</lastmod><priority>${u.p}</priority></url>`).join('\n')}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
