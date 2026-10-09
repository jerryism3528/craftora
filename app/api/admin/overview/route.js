import { query, queryOne } from '../../../../lib/db';
import { requireAdmin, ok, forbid, dirStats, IMAGES_DIR } from '../../../../lib/admin';
import { DOCS_DIR } from '../../../../lib/signer';

export const dynamic = 'force-dynamic';

async function safe(fn, fallback) { try { return await fn(); } catch (e) { console.error('overview:', e.message); return fallback; } }

export async function GET() {
  if (!(await requireAdmin())) return forbid();

  const [users, plans, usage, series, topTools, seo, docs, mod, docsDisk, imagesDisk] = await Promise.all([
    safe(() => queryOne(`SELECT count(*)::int AS total,
        count(*) FILTER (WHERE created_at > now() - interval '24 hours')::int AS new24h,
        count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS new7d,
        count(*) FILTER (WHERE suspended_until > now())::int AS suspended,
        count(*) FILTER (WHERE is_supporter)::int AS supporters
      FROM users`), {}),
    safe(() => query(`SELECT plan, count(*)::int AS n FROM users
      WHERE plan <> 'free' AND (plan_expires_at IS NULL OR plan_expires_at > now()) GROUP BY plan`), []),
    safe(() => queryOne(`SELECT
        COALESCE(sum(amount) FILTER (WHERE created_at > now() - interval '24 hours'), 0)::int AS uses24h,
        COALESCE(sum(amount), 0)::int AS uses7d,
        count(DISTINCT user_id) FILTER (WHERE created_at > now() - interval '24 hours')::int AS active24h,
        count(DISTINCT user_id)::int AS active7d
      FROM usage_log WHERE created_at > now() - interval '7 days'`), {}),
    safe(() => query(`SELECT to_char(d, 'YYYY-MM-DD') AS day,
        (SELECT count(*) FROM users u WHERE u.created_at >= d AND u.created_at < d + interval '1 day')::int AS signups,
        (SELECT COALESCE(sum(amount), 0) FROM usage_log l WHERE l.created_at >= d AND l.created_at < d + interval '1 day')::int AS uses
      FROM generate_series(date_trunc('day', now()) - interval '29 days', date_trunc('day', now()), interval '1 day') d ORDER BY d`), []),
    safe(() => query(`SELECT tool_slug, sum(amount)::int AS uses, count(DISTINCT user_id)::int AS users
      FROM usage_log WHERE created_at > now() - interval '7 days' GROUP BY tool_slug ORDER BY uses DESC LIMIT 10`), []),
    safe(() => queryOne(`SELECT count(*)::int AS total,
        count(*) FILTER (WHERE status = 'running')::int AS running,
        count(*) FILTER (WHERE created_at > now() - interval '24 hours')::int AS last24h,
        count(*) FILTER (WHERE status = 'failed' AND created_at > now() - interval '7 days')::int AS failed7d
      FROM seo_audits`), {}),
    safe(() => query(`SELECT status, count(*)::int AS n FROM sign_docs GROUP BY status`), []),
    safe(() => queryOne(`SELECT
        (SELECT count(*) FROM reports WHERE status = 'open')::int AS openReports,
        (SELECT count(*) FROM admin_notifications WHERE NOT is_read)::int AS unread,
        (SELECT count(*) FROM images WHERE NOT removed)::int AS images,
        (SELECT count(*) FROM short_links WHERE NOT disabled)::int AS links`), {}),
    dirStats(DOCS_DIR),
    dirStats(IMAGES_DIR),
  ]);

  return ok({ users, plans, usage, series, topTools, seo, docs, mod, storage: { docs: docsDisk, images: imagesDisk } });
}
