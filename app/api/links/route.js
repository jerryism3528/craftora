import { auth } from '../../../auth';
import { checkToolAccess, recordUsage } from '../../../lib/limits';
import { query, queryOne } from '../../../lib/db';
import { newCode, normalizeUrl, isUnsafe, RESERVED, GO_BASE } from '../../../lib/shortlinks';

export const dynamic = 'force-dynamic';
const TOOL = 'url-shortener';
const EXPIRY = { '7': 7, '30': 30, '90': 90 };

function err(message, status) {
  return Response.json({ ok: false, error: message }, { status });
}

async function user() {
  const session = await auth();
  return session?.user?.id ? String(session.user.id) : null;
}

export async function POST(req) {
  const userId = await user();
  if (!userId) return err('Please sign in to create short links.', 401);
  const access = await checkToolAccess(userId, TOOL);
  if (!access.allowed) return err(access.reason, 429);

  let body;
  try { body = await req.json(); } catch (e) { return err('Invalid request.', 400); }

  const norm = normalizeUrl(body.url);
  if (norm.error) return err(norm.error, 400);

  let alias = String(body.alias || '').trim();
  if (alias) {
    if (!/^[A-Za-z0-9_-]{3,40}$/.test(alias)) return err('Custom names can use letters, numbers, - and _ (3 to 40 characters).', 400);
    if (RESERVED.has(alias.toLowerCase())) return err('That name is reserved. Please pick another.', 400);
    const taken = await queryOne('SELECT 1 FROM short_links WHERE lower(code) = lower($1)', [alias]);
    if (taken) return err('That custom name is already taken. Try another.', 409);
  }

  if (await isUnsafe(norm.url)) {
    return err('This link was flagged by Google Safe Browsing as unsafe (phishing or malware), so it cannot be shortened.', 422);
  }

  const days = EXPIRY[String(body.expiry)] || null;
  let row = null;
  for (let i = 0; i < 5 && !row; i++) {
    const code = alias || newCode(6);
    try {
      row = await queryOne(
        `INSERT INTO short_links (code, url, user_id, expires_at)
         VALUES ($1, $2, $3, CASE WHEN $4::int IS NULL THEN NULL ELSE now() + ($4::int * interval '1 day') END)
         RETURNING id, code, url, clicks, expires_at, created_at`,
        [code, norm.url, userId, days]
      );
    } catch (e) {
      if (e.code !== '23505' || alias) return err('Could not create the link. Please try again.', 500);
    }
  }
  if (!row) return err('Could not create the link. Please try again.', 500);

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  await recordUsage(userId, ip, TOOL, 1);
  return Response.json({ ok: true, link: { ...row, short: `${GO_BASE}/${row.code}` } });
}

export async function GET() {
  const userId = await user();
  if (!userId) return err('Please sign in.', 401);
  const rows = await query(
    `SELECT id, code, url, clicks, expires_at, created_at, disabled,
            (expires_at IS NOT NULL AND expires_at < now()) AS expired
     FROM short_links WHERE user_id = $1 ORDER BY created_at DESC LIMIT 500`,
    [userId]
  );
  return Response.json({ ok: true, links: rows.map((r) => ({ ...r, short: `${GO_BASE}/${r.code}` })) });
}

export async function DELETE(req) {
  const userId = await user();
  if (!userId) return err('Please sign in.', 401);
  const id = parseInt(req.nextUrl.searchParams.get('id'), 10);
  if (!id) return err('Invalid link.', 400);
  const del = await queryOne('DELETE FROM short_links WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
  if (!del) return err('Link not found.', 404);
  await query('DELETE FROM link_clicks WHERE link_id = $1', [id]);
  return Response.json({ ok: true });
}
