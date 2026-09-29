import { query, queryOne } from './db';

// Check whether a user may use a server tool right now, and how many they have left today.
// Returns { allowed, reason, remaining, dailyLimit, batchLimit }.
export async function checkToolAccess(userId, toolSlug) {
  // Tool config.
  const cfg = await queryOne('SELECT daily_limit, batch_limit, anon_limit, enabled FROM tool_limits WHERE tool_slug = $1', [toolSlug]);
  if (!cfg) return { allowed: false, reason: 'This tool is not available right now.' };
  if (!cfg.enabled) return { allowed: false, reason: 'This tool is temporarily disabled.' };

  // Must be logged in (all our server tools require an account).
  if (!userId) return { allowed: false, reason: 'Please sign in to use this tool.', needLogin: true };

  // User status: suspended? Admins bypass all limits.
  const user = await queryOne('SELECT suspended_until, is_admin FROM users WHERE id = $1', [userId]);
  if (!user) return { allowed: false, reason: 'Account not found.' };
  if (user.is_admin) return { allowed: true, reason: '', remaining: 999999, dailyLimit: 999999, batchLimit: cfg.batch_limit || null, usedCount: 0, isAdmin: true };
  if (user.suspended_until && new Date(user.suspended_until) > new Date()) {
    return { allowed: false, reason: 'Your account is suspended. Contact support if you think this is a mistake.' };
  }

  // Tool blocked for this specific user?
  const blocked = await queryOne('SELECT 1 FROM user_tool_blocks WHERE user_id = $1 AND tool_slug = $2', [userId, toolSlug]);
  if (blocked) return { allowed: false, reason: 'Access to this tool has been restricted for your account.' };

  // Count today's usage (rolling 24h).
  const used = await queryOne(
    "SELECT COALESCE(SUM(amount), 0) AS total FROM usage_log WHERE user_id = $1 AND tool_slug = $2 AND created_at > now() - interval '24 hours'",
    [userId, toolSlug]
  );
  const usedCount = Number(used.total) || 0;
  const remaining = Math.max(cfg.daily_limit - usedCount, 0);

  return {
    allowed: remaining > 0,
    reason: remaining > 0 ? '' : 'You have reached your daily limit for this tool. It resets 24 hours after your first use today.',
    remaining,
    dailyLimit: cfg.daily_limit,
    batchLimit: cfg.batch_limit || null,
    usedCount,
  };
}

// Record usage after a successful action.
export async function recordUsage(userId, ip, toolSlug, amount = 1) {
  await query(
    'INSERT INTO usage_log (user_id, ip, tool_slug, amount) VALUES ($1, $2, $3, $4)',
    [userId, ip || null, toolSlug, amount]
  );
}
