import { auth } from '../../../../auth';
import { query, queryOne } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const session = await auth();
  const userId = session?.user?.id ? String(session.user.id) : null;
  if (!userId) return Response.json({ ok: false, error: 'Please sign in.' }, { status: 401 });
  const id = parseInt(req.nextUrl.searchParams.get('id'), 10);
  const link = await queryOne('SELECT id, code, url, clicks, created_at FROM short_links WHERE id = $1 AND user_id = $2', [id, userId]);
  if (!link) return Response.json({ ok: false, error: 'Link not found.' }, { status: 404 });

  const [daily, devices, browsers, referrers] = await Promise.all([
    query(`SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, count(*)::int AS n FROM link_clicks
           WHERE link_id = $1 AND created_at > now() - interval '30 days' GROUP BY 1 ORDER BY 1`, [id]),
    query(`SELECT COALESCE(device, 'Unknown') AS k, count(*)::int AS n FROM link_clicks WHERE link_id = $1 GROUP BY 1 ORDER BY 2 DESC`, [id]),
    query(`SELECT COALESCE(browser, 'Unknown') AS k, count(*)::int AS n FROM link_clicks WHERE link_id = $1 GROUP BY 1 ORDER BY 2 DESC LIMIT 6`, [id]),
    query(`SELECT COALESCE(referrer, 'Direct / unknown') AS k, count(*)::int AS n FROM link_clicks WHERE link_id = $1 GROUP BY 1 ORDER BY 2 DESC LIMIT 8`, [id]),
  ]);
  return Response.json({ ok: true, link, daily, devices, browsers, referrers });
}
