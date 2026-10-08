import { crawlSite, validateStartUrl } from '../../../../lib/sitemap-crawler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const PER_HOUR = 3;
const MAX_ACTIVE = 3;
const hits = new Map();
let active = 0;

function clientIp(req) {
  const xff = req.headers.get('x-forwarded-for') || '';
  return xff.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

function checkLimit(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 3600000);
  hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < 3600000)) hits.delete(k);
  if (list.length >= PER_HOUR) {
    const mins = Math.ceil((3600000 - (now - list[0])) / 60000);
    return { ok: false, mins };
  }
  return { ok: true, list };
}

const json = (body, status) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request.' }, 400); }

  let startUrl;
  try { startUrl = await validateStartUrl(body?.url); } catch (e) { return json({ error: e.message }, 400); }

  const ip = clientIp(req);
  const lim = checkLimit(ip);
  if (!lim.ok) return json({ error: `You have used your ${PER_HOUR} free crawls for this hour. Try again in about ${lim.mins} minutes, or use Paste URLs mode (unlimited).` }, 429);
  if (active >= MAX_ACTIVE) return json({ error: 'The crawler is busy right now. Please try again in a minute.' }, 503);

  lim.list.push(Date.now());
  active++;
  const remaining = PER_HOUR - lim.list.length;
  const enc = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj) => { try { controller.enqueue(enc.encode(JSON.stringify(obj) + '\n')); } catch {} };
      send({ type: 'remaining', remaining });
      try {
        const result = await crawlSite(startUrl, { onEvent: send, signal: req.signal });
        send({ type: 'done', ...result });
      } catch (e) {
        send({ type: 'error', error: e.message || 'Crawl failed.' });
      } finally {
        active--;
        try { controller.close(); } catch {}
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}

