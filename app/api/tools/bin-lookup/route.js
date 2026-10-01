import { queryOne } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

// Simple in-memory IP rate limit (per server instance): 30 lookups/minute/IP.
const hits = new Map();
const LIMIT = 30;
const WINDOW = 60 * 1000;

function rateLimited(ip) {
  const now = Date.now();
  const rec = hits.get(ip) || { count: 0, reset: now + WINDOW };
  if (now > rec.reset) { rec.count = 0; rec.reset = now + WINDOW; }
  rec.count++;
  hits.set(ip, rec);
  // Occasional cleanup.
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (now > v.reset) hits.delete(k);
  }
  return rec.count > LIMIT;
}

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return Response.json({ ok: false, error: 'Too many lookups. Please wait a minute and try again.' }, { status: 429 });
  }

  let bin;
  try {
    const body = await req.json();
    bin = String(body.bin || '').replace(/\D/g, '');
  } catch (e) {
    return Response.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  if (bin.length < 6) return Response.json({ ok: false, error: 'Enter at least the first 6 digits.' }, { status: 400 });

  // Try 8-digit BIN first, then fall back to 6.
  const bin8 = bin.slice(0, 8);
  const bin6 = bin.slice(0, 6);
  let row = await queryOne('SELECT bin, brand, type, category, issuer, country FROM bin_lookup WHERE bin = $1', [bin8]);
  if (!row) row = await queryOne('SELECT bin, brand, type, category, issuer, country FROM bin_lookup WHERE bin = $1', [bin6]);

  if (!row) {
    return Response.json({ ok: true, found: false });
  }

  const titleCase = (s) => s ? s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : '';

  return Response.json({
    ok: true,
    found: true,
    data: {
      brand: row.brand || '',
      type: row.type || '',
      category: row.category || '',
      bank: titleCase(row.issuer),
      country: row.country || '',
    },
  });
}
