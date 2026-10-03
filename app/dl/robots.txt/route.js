import { DL_BASE } from '../../../lib/downloaders';

export const dynamic = 'force-static';

export function GET() {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${DL_BASE}/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain' } });
}
