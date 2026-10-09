import { query, queryOne } from '../../../../lib/db';
import { requireAdmin, logAction, ok, bad, forbid, readJson, pageArgs } from '../../../../lib/admin';
import { getPlans, applyGrantToUser, clearPlanCache } from '../../../../lib/plans';

export const dynamic = 'force-dynamic';

// GET: search and page through users.
// ?q=&plan=free|pro|business|paid&status=suspended|admin|supporter&page=
export async function GET(req) {
  if (!(await requireAdmin())) return forbid();
  const url = new URL(req.url);
  const { page, limit, offset } = pageArgs(url, 50);
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const plan = url.searchParams.get('plan') || '';
  const status = url.searchParams.get('status') || '';

  const where = ['TRUE'];
  const args = [];
  if (q) { args.push(`%${q}%`); where.push(`(lower(u.email) LIKE $${args.length} OR lower(u.username) LIKE $${args.length})`); }
  const activePlan = `(CASE WHEN u.plan <> 'free' AND (u.plan_expires_at IS NULL OR u.plan_expires_at > now()) THEN u.plan ELSE 'free' END)`;
  if (plan === 'paid') where.push(`${activePlan} <> 'free'`);
  else if (plan) { args.push(plan); where.push(`${activePlan} = $${args.length}`); }
  if (status === 'suspended') where.push('u.suspended_until > now()');
  if (status === 'admin') where.push('u.is_admin');
  if (status === 'supporter') where.push('u.is_supporter');

  const sqlWhere = where.join(' AND ');
  const total = await queryOne(`SELECT count(*)::int AS n FROM users u WHERE ${sqlWhere}`, args);
  args.push(limit, offset);
  const users = await query(`
    SELECT u.id, u.email, u.username, u.is_admin, u.created_at, u.avatar_url, u.is_supporter, u.reward_tier,
           ${activePlan} AS plan, u.plan_expires_at,
           (u.suspended_until IS NOT NULL AND u.suspended_until > now()) AS suspended, u.suspended_until,
           (SELECT max(created_at) FROM usage_log l WHERE l.user_id = u.id) AS last_active,
           (SELECT COALESCE(sum(amount), 0)::int FROM usage_log l WHERE l.user_id = u.id AND l.created_at > now() - interval '7 days') AS uses7d,
           COALESCE((SELECT array_agg(b.tool_slug) FROM user_tool_blocks b WHERE b.user_id = u.id), '{}') AS blocked_tools,
           EXISTS (SELECT 1 FROM accounts a WHERE a.user_id = u.id AND a.provider = 'google') AS google
    FROM users u WHERE ${sqlWhere}
    ORDER BY u.created_at DESC LIMIT $${args.length - 1} OFFSET $${args.length}`, args);

  return ok({ users, total: total.n, page, pages: Math.max(1, Math.ceil(total.n / limit)) });
}

// POST: perform an admin action on a user.
export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return forbid();

  try {
    const body = await readJson(req);
    const { action, userId, tool, days } = body;
    if (!userId) return bad('Missing user.');

    const target = await queryOne('SELECT id, email, is_admin FROM users WHERE id = $1', [userId]);
    if (!target) return bad('User not found.');

    // Actions that are fine on any account, including admins.
    if (action === 'note') {
      const note = String(body.note || '').slice(0, 2000);
      await query('UPDATE users SET admin_note = $2 WHERE id = $1', [userId, note || null]);
      await logAction(admin.id, 'note', target.email);
      return ok({ message: 'Note saved.' });
    }
    if (action === 'set_supporter') {
      await query('UPDATE users SET is_supporter = $2, supporter_name = $3 WHERE id = $1', [userId, !!body.supporter, String(body.supporterName || '').slice(0, 80) || null]);
      await logAction(admin.id, 'set_supporter', target.email, { supporter: !!body.supporter });
      return ok({ message: body.supporter ? 'Marked as supporter.' : 'Supporter status removed.' });
    }
    if (action === 'set_plan') {
      const plans = await getPlans(true);
      const plan = String(body.plan || 'free');
      if (!plans[plan]) return bad('Unknown plan.');
      // mode: lifetime | months | date
      let expires = null;
      if (plan !== 'free') {
        if (body.mode === 'months') {
          const m = Math.max(1, Math.min(Number(body.months) || 1, 120));
          const d = new Date(); d.setMonth(d.getMonth() + m); expires = d;
        } else if (body.mode === 'date') {
          const d = new Date(body.date);
          if (isNaN(d) || d <= new Date()) return bad('Pick a future date.');
          expires = d;
        }
      }
      await query("UPDATE users SET plan = $2, plan_expires_at = $3, plan_source = 'manual', updated_at = now() WHERE id = $1", [userId, plan, expires]);
      await logAction(admin.id, 'set_plan', target.email, { plan, expires });
      return ok({ message: plan === 'free' ? 'Plan set to Free.' : `Plan set to ${plans[plan].name}${expires ? ` until ${expires.toISOString().slice(0, 10)}` : ' (lifetime)'}.` });
    }
    if (action === 'apply_tier') {
      const tier = await queryOne('SELECT * FROM reward_tiers WHERE key = $1', [body.tier]);
      if (!tier) return bad('Unknown reward tier.');
      clearPlanCache();
      const r = await applyGrantToUser(userId, { plan: tier.plan, months: tier.months, tier: tier.key, supporter: tier.supporter, source: 'manual' });
      await logAction(admin.id, 'apply_tier', target.email, { tier: tier.key });
      return ok({ message: r.changed ? `${tier.name} applied.` : `${tier.name} recorded. The user already had an equal or higher plan.` });
    }

    if (target.is_admin) return bad('You cannot perform this action on an admin account.');

    if (action === 'reset_limits') {
      await query("DELETE FROM usage_log WHERE user_id = $1 AND created_at > now() - interval '24 hours'", [userId]);
      await logAction(admin.id, 'reset_limits', target.email);
      return ok({ message: 'Limits reset for this user.' });
    }
    if (action === 'block_tool') {
      if (!tool) return bad('Missing tool slug.');
      await query('INSERT INTO user_tool_blocks (user_id, tool_slug) VALUES ($1, $2) ON CONFLICT (user_id, tool_slug) DO NOTHING', [userId, String(tool).trim()]);
      await logAction(admin.id, 'block_tool', target.email, { tool });
      return ok({ message: `Blocked ${tool} for this user.` });
    }
    if (action === 'unblock_tool') {
      if (!tool) return bad('Missing tool slug.');
      await query('DELETE FROM user_tool_blocks WHERE user_id = $1 AND tool_slug = $2', [userId, String(tool).trim()]);
      await logAction(admin.id, 'unblock_tool', target.email, { tool });
      return ok({ message: `Unblocked ${tool}.` });
    }
    if (action === 'suspend') {
      const d = Math.max(1, Math.min(Number(days) || 7, 3650));
      await query("UPDATE users SET suspended_until = now() + ($1 || ' days')::interval WHERE id = $2", [String(d), userId]);
      await logAction(admin.id, 'suspend', target.email, { days: d, reason: body.reason || '' });
      return ok({ message: `User suspended for ${d} days.` });
    }
    if (action === 'unsuspend') {
      await query('UPDATE users SET suspended_until = NULL WHERE id = $1', [userId]);
      await logAction(admin.id, 'unsuspend', target.email);
      return ok({ message: 'User unsuspended.' });
    }
    if (action === 'delete') {
      await query('DELETE FROM users WHERE id = $1', [userId]);
      await logAction(admin.id, 'delete_user', target.email);
      return ok({ message: 'User deleted.' });
    }
    return bad('Unknown action.');
  } catch (e) {
    console.error('admin users error:', e);
    return bad('Something went wrong.', 500);
  }
}
