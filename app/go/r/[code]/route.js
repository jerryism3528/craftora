import { query, queryOne } from '../../../../lib/db';
import { parseAgent, isBot } from '../../../../lib/shortlinks';

export const dynamic = 'force-dynamic';

const MAIN = 'https://' + 'craftora.dev';

function gone() {
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Link not available | Craftora</title></head>
<body style="font-family:system-ui,sans-serif;background:#f7f8ff;color:#1c2340;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0">
<div style="text-align:center;padding:24px;max-width:420px"><h1 style="font-size:22px">This link is not available</h1>
<p style="color:#6b7290">It may have expired, been removed, or never existed.</p>
<p><a href="${MAIN}/url-shortener" style="color:#3430a8;font-weight:700">Create your own short link free on Craftora</a></p></div></body></html>`;
  return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function GET(req, { params }) {
  const link = await queryOne('SELECT id, url, expires_at, disabled FROM short_links WHERE code = $1', [params.code]);
  if (!link || link.disabled || (link.expires_at && new Date(link.expires_at) < new Date())) return gone();

  const ua = req.headers.get('user-agent') || '';
  if (!isBot(ua)) {
    const { device, browser } = parseAgent(ua);
    let ref = null;
    try { const r = req.headers.get('referer'); if (r) ref = new URL(r).hostname; } catch (e) {}
    query('UPDATE short_links SET clicks = clicks + 1, last_click_at = now() WHERE id = $1', [link.id]).catch(() => {});
    query('INSERT INTO link_clicks (link_id, device, browser, referrer) VALUES ($1, $2, $3, $4)', [link.id, device, browser, ref]).catch(() => {});
  }
  return Response.redirect(link.url, 302);
}
