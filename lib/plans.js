import { query, queryOne } from './db';

// Plans are read often (every limit check), so cache them briefly.
const CACHE_MS = 60 * 1000;
const g = globalThis;

export async function getPlans(fresh = false) {
  const c = g.__craftoraPlans;
  if (!fresh && c && Date.now() - c.at < CACHE_MS) return c.map;
  let rows = [];
  try { rows = await query('SELECT * FROM plans ORDER BY rank'); } catch { rows = []; }
  const map = {};
  for (const r of rows) map[r.key] = { ...r, multiplier: Number(r.multiplier) || 1, tool_overrides: r.tool_overrides || {} };
  if (!map.free) map.free = { key: 'free', name: 'Free', multiplier: 1, tool_overrides: {}, rank: 0, storage_mb: 1024, seats: 1, white_label: false, ad_free: false, color: '#64748b' };
  g.__craftoraPlans = { at: Date.now(), map };
  return map;
}

export function clearPlanCache() { g.__craftoraPlans = null; }

// The plan a user actually has right now (expired paid plans fall back to free).
export function effectivePlanKey(user, plans) {
  const key = user?.plan || 'free';
  if (key === 'free' || !plans[key]) return 'free';
  if (user.plan_expires_at && new Date(user.plan_expires_at) <= new Date()) return 'free';
  return key;
}

// Daily limit for a tool on a plan: explicit override, else base limit times the plan multiplier.
export function planLimit(plan, toolSlug, baseDaily) {
  if (!plan || plan.key === 'free') return baseDaily;
  const o = plan.tool_overrides?.[toolSlug];
  if (o !== undefined && o !== null && o !== '') return Number(o);
  return Math.round(baseDaily * (plan.multiplier || 1));
}

function addMonths(from, months) {
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
  return d;
}

// Give a plan to an existing user. Never downgrades: a lower plan than the current one only adds supporter status.
// months = null means lifetime. Time-limited grants stack on top of remaining time.
export async function applyGrantToUser(userId, grant) {
  const plans = await getPlans();
  const u = await queryOne('SELECT id, plan, plan_expires_at, is_supporter FROM users WHERE id = $1', [userId]);
  if (!u) return { applied: false, reason: 'User not found' };
  const target = plans[grant.plan] ? grant.plan : 'free';
  const curKey = effectivePlanKey(u, plans);
  const curRank = plans[curKey]?.rank || 0;
  const newRank = plans[target]?.rank || 0;
  const curLifetime = curKey !== 'free' && !u.plan_expires_at;

  let plan = curKey;
  let expires = curKey === 'free' ? null : u.plan_expires_at;
  let changed = false;

  if (target !== 'free') {
    if (newRank > curRank) {
      plan = target;
      expires = grant.months ? addMonths(new Date(), grant.months) : null;
      changed = true;
    } else if (newRank === curRank && !curLifetime) {
      plan = target;
      if (!grant.months) expires = null;
      else {
        const base = u.plan_expires_at && new Date(u.plan_expires_at) > new Date() ? new Date(u.plan_expires_at) : new Date();
        expires = addMonths(base, grant.months);
      }
      changed = true;
    }
  }

  await query(
    `UPDATE users SET plan = $2, plan_expires_at = $3,
       plan_source = CASE WHEN $4 THEN $5 ELSE plan_source END,
       reward_tier = COALESCE($6, reward_tier),
       is_supporter = is_supporter OR $7,
       supporter_since = CASE WHEN $7 THEN COALESCE(supporter_since, now()) ELSE supporter_since END,
       supporter_name = COALESCE(NULLIF($8, ''), supporter_name),
       updated_at = now()
     WHERE id = $1`,
    [userId, plan, plan === 'free' ? null : expires, changed, grant.source || 'manual', grant.tier || null, !!grant.supporter, grant.supporter_name || '']
  );
  return { applied: true, changed, plan, expires };
}

// Apply any plan waiting for this email (for example a backer who signed up after the campaign).
export async function claimPendingGrants(userId, email) {
  if (!email) return 0;
  let rows = [];
  try {
    rows = await query('SELECT * FROM plan_grants WHERE lower(email) = lower($1) AND claimed_at IS NULL ORDER BY id', [email]);
  } catch { return 0; }
  for (const gr of rows) {
    await applyGrantToUser(userId, gr);
    await query('UPDATE plan_grants SET claimed_at = now(), claimed_user = $2 WHERE id = $1', [gr.id, userId]);
  }
  return rows.length;
}

// Plan details for one user (used by account pages and the admin portal).
export async function planForUser(userId) {
  const plans = await getPlans();
  const u = await queryOne('SELECT plan, plan_expires_at, is_supporter FROM users WHERE id = $1', [userId]);
  const key = effectivePlanKey(u, plans);
  return { ...plans[key], key, expiresAt: key === 'free' ? null : u?.plan_expires_at || null, lifetime: key !== 'free' && !u?.plan_expires_at, isSupporter: !!u?.is_supporter };
}
