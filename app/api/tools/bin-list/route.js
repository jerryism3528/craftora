import { query } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

const hits = new Map();
const LIMIT = 40;
const WINDOW = 60 * 1000;

function rateLimited(ip) {
  const now = Date.now();
  const rec = hits.get(ip) || { count: 0, reset: now + WINDOW };
  if (now > rec.reset) { rec.count = 0; rec.reset = now + WINDOW; }
  rec.count++;
  hits.set(ip, rec);
  if (hits.size > 5000) { for (const [k, v] of hits) if (now > v.reset) hits.delete(k); }
  return rec.count > LIMIT;
}

function titleCase(s) {
  return s ? s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : '';
}

const PAGE_SIZE = 100;

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return Response.json({ ok: false, error: 'Too many requests. Please wait a minute.' }, { status: 429 });
  }

  let mode, value, page;
  try {
    const body = await req.json();
    mode = String(body.mode || 'summary'); // 'summary' | 'brand' | 'country'
    value = String(body.value || '').trim();
    page = Math.max(1, parseInt(body.page, 10) || 1);
  } catch (e) {
    return Response.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  // Summary: counts by brand and country.
  if (mode === 'summary') {
    const brands = await query("SELECT brand, count(*) AS n FROM bin_lookup WHERE brand <> '' GROUP BY brand ORDER BY n DESC LIMIT 12");
    const countries = await query("SELECT country, count(*) AS n FROM bin_lookup WHERE country <> '' GROUP BY country ORDER BY n DESC LIMIT 24");
    return Response.json({
      ok: true,
      mode: 'summary',
      brands: brands.map((r) => ({ name: titleCase(r.brand), raw: r.brand, count: Number(r.n) })),
      countries: countries.map((r) => ({ name: r.country, count: Number(r.n) })),
    });
  }

  // Drill-down list by brand or country.
  if (mode === 'brand' || mode === 'country') {
    if (!value) return Response.json({ ok: false, error: 'Missing value.' }, { status: 400 });
    const col = mode === 'brand' ? 'brand' : 'country';
    const matchVal = mode === 'brand' ? value.toUpperCase() : value;
    const offset = (page - 1) * PAGE_SIZE;
    const rows = await query(
      `SELECT bin, brand, type, issuer, country FROM bin_lookup WHERE ${col} = $1 ORDER BY bin LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
      [matchVal]
    );
    const results = rows.map((r) => ({
      bin: r.bin, brand: titleCase(r.brand), type: titleCase(r.type), bank: titleCase(r.issuer), country: r.country || '',
    }));
    return Response.json({ ok: true, mode, value, page, results, hasMore: rows.length === PAGE_SIZE });
  }

  return Response.json({ ok: false, error: 'Invalid mode.' }, { status: 400 });
}
