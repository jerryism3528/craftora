import { query, queryOne } from '../../../../lib/db';
import { currentUser, clientIp } from '../../../../lib/current-user';
import { getPlans, effectivePlanKey } from '../../../../lib/plans';
import { hit } from '../../../../lib/iplimit';
import { isLimitedBrowserTool, FILE_RULES, DEFAULT_DAILY, PAID_PLANS } from '../../../../lib/browser-limits';

export const dynamic = 'force-dynamic';
const j = (data, status = 200) => Response.json(data, { status });
const MB = 1024 * 1024;

// Count one use of a browser tool before it runs. The file itself never reaches this endpoint:
// the page only sends the tool name, how many files, and their sizes.
export async function POST(req) {
  let b = {};
  try { b = await req.json(); } catch {}
  const tool = String(b.tool || '');
  if (!isLimitedBrowserTool(tool)) return j({ ok: true });
  const files = Math.max(1, Math.min(10000, parseInt(b.files, 10) || 1));
  const maxBytes = Math.max(0, Number(b.maxBytes) || 0);

  const ip = clientIp(req);
  const raw = req.headers.get('x-device-id') || req.cookies.get('cdid')?.value || '';
  const device = /^[a-zA-Z0-9-]{8,64}$/.test(raw) ? raw : null;
  if (!hit(`gate:${ip || device || 'x'}`, 120, 60_000).ok) return j({ ok: false, reason: 'busy', message: 'Too many requests. Please wait a minute and try again.' }, 429);

  const cfg = await queryOne('SELECT daily_limit, anon_limit, enabled FROM tool_limits WHERE tool_slug = $1', [tool]).catch(() => null);
  if (cfg && !cfg.enabled) return j({ ok: false, reason: 'disabled', message: 'This tool is temporarily turned off. Please try again later.' });

  const user = await currentUser().catch(() => null);
  let plan = 'guest';
  if (user) {
    const u = await queryOne('SELECT is_admin, plan, plan_expires_at FROM users WHERE id = $1', [user.id]);
    if (u?.is_admin) {
      await record(user.id, ip, tool, device);
      return j({ ok: true, plan: 'admin', remaining: null });
    }
    const plans = await getPlans();
    plan = effectivePlanKey(u, plans);
    if (!FILE_RULES[plan]) plan = PAID_PLANS.includes(plan) ? plan : 'free';
  }
  const rules = FILE_RULES[plan] || FILE_RULES.free;

  if (maxBytes > rules.maxMb * MB) {
    return j({ ok: false, reason: 'size', plan, limitMb: rules.maxMb, fileMb: Math.ceil(maxBytes / MB) });
  }
  if (files > rules.maxFiles) {
    return j({ ok: false, reason: 'files', plan, maxFiles: rules.maxFiles });
  }

  if (PAID_PLANS.includes(plan)) {
    await record(user.id, ip, tool, device);
    return j({ ok: true, plan, remaining: null });
  }

  const limit = plan === 'guest' ? (cfg ? cfg.anon_limit : DEFAULT_DAILY.guest) : (cfg ? cfg.daily_limit : DEFAULT_DAILY.free);
  // Visitors are counted by IP or device. Accounts are counted by account or device, so extra
  // accounts on the same computer share one count, while colleagues in the same office do not.
  const used = await queryOne(
    `SELECT COALESCE(SUM(amount), 0)::int AS n FROM usage_log
      WHERE tool_slug = $1 AND created_at > now() - interval '24 hours'
        AND (${user ? 'user_id = $2' : '($2::text IS NOT NULL AND ip = $2)'} OR ($3::text IS NOT NULL AND device_id = $3))`,
    [tool, user ? user.id : ip, device]
  );
  const n = used?.n || 0;
  if (n >= limit) {
    const first = await queryOne(
      `SELECT min(created_at) AS t FROM usage_log
        WHERE tool_slug = $1 AND created_at > now() - interval '24 hours'
          AND (${user ? 'user_id = $2' : '($2::text IS NOT NULL AND ip = $2)'} OR ($3::text IS NOT NULL AND device_id = $3))`,
      [tool, user ? user.id : ip, device]
    );
    const resetAt = first?.t ? new Date(new Date(first.t).getTime() + 86400000).toISOString() : null;
    return j({ ok: false, reason: 'limit', plan, limit, resetAt, freeLimit: cfg ? cfg.daily_limit : DEFAULT_DAILY.free });
  }
  await record(user?.id || null, ip, tool, device);
  return j({ ok: true, plan, remaining: Math.max(0, limit - n - 1), limit });
}

async function record(userId, ip, tool, device) {
  await query('INSERT INTO usage_log (user_id, ip, tool_slug, amount, device_id) VALUES ($1, $2, $3, 1, $4)', [userId, ip, tool, device]).catch(() => {});
}
