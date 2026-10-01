import { auth } from '../../../../auth';
import { checkToolAccess, recordUsage } from '../../../../lib/limits';
import { query } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

const TOOL = 'bin-checker';
const BATCH_MAX = 100;

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

  let bins;
  try {
    const body = await req.json();
    bins = Array.isArray(body.bins) ? body.bins : [];
  } catch (e) {
    return Response.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  // Clean: digits only, first 8, dedupe, min 6 digits.
  bins = [...new Set(bins.map((b) => String(b || '').replace(/\D/g, '').slice(0, 8)).filter((b) => b.length >= 6))].slice(0, BATCH_MAX);
  if (bins.length === 0) return Response.json({ ok: false, error: 'No valid BINs found. Enter at least the first 6 digits of each card.' }, { status: 400 });

  // Cap to remaining allowance.
  const allowedCount = access.remaining >= 999999 ? bins.length : Math.min(bins.length, access.remaining);
  const toCheck = bins.slice(0, allowedCount);

  // Build a list of both 8 and 6 digit prefixes to match.
  const prefixes8 = toCheck.map((b) => b.slice(0, 8));
  const prefixes6 = toCheck.map((b) => b.slice(0, 6));
  const allPrefixes = [...new Set([...prefixes8, ...prefixes6])];

  const rows = await query('SELECT bin, brand, type, category, issuer, country FROM bin_lookup WHERE bin = ANY($1)', [allPrefixes]);
  const map = new Map(rows.map((r) => [r.bin, r]));

  const results = toCheck.map((b) => {
    const row = map.get(b.slice(0, 8)) || map.get(b.slice(0, 6));
    if (!row) return { bin: b, found: false };
    return {
      bin: b,
      found: true,
      brand: titleCase(row.brand),
      type: titleCase(row.type),
      category: titleCase(row.category),
      bank: titleCase(row.issuer),
      country: row.country || '',
    };
  });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  await recordUsage(userId, ip, TOOL, toCheck.length);

  const remaining = access.remaining >= 999999 ? 999999 : Math.max(access.remaining - toCheck.length, 0);
  const skipped = bins.length - toCheck.length;

  return Response.json({ ok: true, results, remaining, skipped });
}
