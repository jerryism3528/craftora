import { query, queryOne } from '../../../../../lib/db';
import { requireAdmin, ok, bad, forbid } from '../../../../../lib/admin';
import { getPlans, effectivePlanKey } from '../../../../../lib/plans';

export const dynamic = 'force-dynamic';

async function safe(fn, fb) { try { return await fn(); } catch (e) { console.error('user detail:', e.message); return fb; } }

export async function GET(_req, { params }) {
  if (!(await requireAdmin())) return forbid();
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return bad('Bad id.');
  const u = await queryOne(`SELECT id, email, username, avatar_url, is_admin, email_verified, created_at, updated_at, suspended_until,
      plan, plan_expires_at, plan_source, reward_tier, is_supporter, supporter_name, admin_note, show_on_wall, sponsor_url, sponsor_logo,
      (password_hash IS NOT NULL) AS has_password
    FROM users WHERE id = $1`, [params.id]);
  if (!u) return bad('User not found.', 404);
  const plans = await getPlans();
  const uid = u.id, uidText = String(u.id);

  const wall = await safe(() => queryOne('SELECT id, name, level, visible, photo, pending_photo FROM wall_entries WHERE user_id = $1', [u.id]), null);
  const [usage, recent, blocks, providers, counts, log, grants, ips] = await Promise.all([
    safe(() => query(`SELECT tool_slug, sum(amount)::int AS uses,
        COALESCE(sum(amount) FILTER (WHERE created_at > now() - interval '24 hours'), 0)::int AS uses24h
      FROM usage_log WHERE user_id = $1 AND created_at > now() - interval '30 days' GROUP BY tool_slug ORDER BY uses DESC`, [uid]), []),
    safe(() => query(`SELECT tool_slug, amount, ip, created_at FROM usage_log WHERE user_id = $1 ORDER BY created_at DESC LIMIT 25`, [uid]), []),
    safe(() => query('SELECT tool_slug, created_at FROM user_tool_blocks WHERE user_id = $1 ORDER BY tool_slug', [uid]), []),
    safe(() => query('SELECT provider FROM accounts WHERE user_id = $1', [uid]), []),
    safe(() => queryOne(`SELECT
        (SELECT count(*) FROM seo_audits WHERE user_id = $1)::int AS audits,
        (SELECT count(*) FROM sign_docs WHERE user_id = $1)::int AS docs,
        (SELECT COALESCE(sum(size_bytes), 0) FROM sign_docs WHERE user_id = $1)::bigint AS doc_bytes,
        (SELECT count(*) FROM images WHERE user_id = $1 AND NOT removed)::int AS images,
        (SELECT count(*) FROM short_links WHERE user_id = $1)::int AS links`, [uidText]), {}),
    safe(() => query(`SELECT l.action, l.detail, l.created_at, a.email AS admin_email FROM admin_log l LEFT JOIN users a ON a.id = l.admin_id
      WHERE l.target = $1 ORDER BY l.created_at DESC LIMIT 20`, [u.email]), []),
    safe(() => query('SELECT * FROM plan_grants WHERE lower(email) = lower($1) ORDER BY id DESC', [u.email]), []),
    safe(() => query(`SELECT ip, count(*)::int AS n, max(created_at) AS last FROM usage_log WHERE user_id = $1 AND ip IS NOT NULL GROUP BY ip ORDER BY last DESC LIMIT 10`, [uid]), []),
  ]);

  const activePlan = effectivePlanKey(u, plans);
  return ok({ wall, user: { ...u, active_plan: activePlan, suspended: !!(u.suspended_until && new Date(u.suspended_until) > new Date()) }, usage, recent, blocks, providers: providers.map((p) => p.provider), counts, log, grants, ips });
}
