import { auth } from '../../../../auth';
import { checkToolAccess, recordUsage } from '../../../../lib/limits';
import { query } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

const TOOL = 'bin-search';
const PAGE_SIZE = 50;

function titleCase(s) {
  return s ? s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : '';
}

export async function POST(req) {
  const session = await auth();
  const userId = session?.user?.id || null;

  const access = await checkToolAccess(userId, TOOL);
  if (!access.allowed) {
    return Response.json({ ok: false, error: access.reason, needLogin: access.needLogin || false }, { status: access.needLogin ? 401 : 429 });
  }

  let bank, country, brand, type, page;
  try {
    const body = await req.json();
    bank = String(body.bank || '').trim().toLowerCase();
    country = String(body.country || '').trim();
    brand = String(body.brand || '').trim().toUpperCase();
    type = String(body.type || '').trim().toUpperCase();
    page = Math.max(1, parseInt(body.page, 10) || 1);
  } catch (e) {
    return Response.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  if (!bank && !country && !brand && !type) {
    return Response.json({ ok: false, error: 'Enter a bank name, or pick a country, brand, or card type to search.' }, { status: 400 });
  }

  // Build dynamic WHERE.
  const conds = [];
  const params = [];
  let p = 1;
  if (bank) { conds.push(`lower(issuer) LIKE $${p++}`); params.push(`%${bank}%`); }
  if (country) { conds.push(`country = $${p++}`); params.push(country); }
  if (brand) { conds.push(`brand = $${p++}`); params.push(brand); }
  if (type) { conds.push(`type = $${p++}`); params.push(type); }
  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';

  // Count (cap the count query for speed).
  const countRow = await query(`SELECT count(*) AS n FROM (SELECT 1 FROM bin_lookup ${where} LIMIT 5000) sub`, params);
  const totalApprox = Number(countRow[0].n) || 0;

  // Page of results.
  const offset = (page - 1) * PAGE_SIZE;
  const rows = await query(
    `SELECT bin, brand, type, category, issuer, country FROM bin_lookup ${where} ORDER BY bin LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
    params
  );

  const results = rows.map((r) => ({
    bin: r.bin,
    brand: titleCase(r.brand),
    type: titleCase(r.type),
    category: titleCase(r.category),
    bank: titleCase(r.issuer),
    country: r.country || '',
  }));

  // Count one search against the daily limit (only on page 1 to not burn limit on paging).
  if (page === 1) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    await recordUsage(userId, ip, TOOL, 1);
  }

  const remaining = access.remaining >= 999999 ? 999999 : (page === 1 ? Math.max(access.remaining - 1, 0) : access.remaining);

  return Response.json({
    ok: true,
    results,
    page,
    pageSize: PAGE_SIZE,
    totalApprox,
    hasMore: totalApprox > offset + PAGE_SIZE && rows.length === PAGE_SIZE,
    remaining,
  });
}
