import { query } from '../../../../lib/db';
import { requireAdmin, logAction, ok, bad, forbid, readJson } from '../../../../lib/admin';
import { tools as CATALOG } from '../../../../lib/tools';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdmin())) return forbid();
  const limits = await query('SELECT * FROM tool_limits ORDER BY tool_slug');
  const usage = await query(`SELECT tool_slug,
      COALESCE(sum(amount) FILTER (WHERE created_at > now() - interval '24 hours'), 0)::int AS uses24h,
      COALESCE(sum(amount), 0)::int AS uses7d,
      count(DISTINCT user_id)::int AS users7d
    FROM usage_log WHERE created_at > now() - interval '7 days' GROUP BY tool_slug`);
  const blocks = await query('SELECT tool_slug, count(*)::int AS n FROM user_tool_blocks GROUP BY tool_slug');
  const u = Object.fromEntries(usage.map((r) => [r.tool_slug, r]));
  const b = Object.fromEntries(blocks.map((r) => [r.tool_slug, r.n]));
  const cat = Object.fromEntries(CATALOG.map((t) => [t.slug, t]));
  const rows = limits.map((l) => ({ ...l, name: cat[l.tool_slug]?.name || l.tool_slug, status: cat[l.tool_slug]?.status || '', ...(u[l.tool_slug] || { uses24h: 0, uses7d: 0, users7d: 0 }), blocked: b[l.tool_slug] || 0 }));
  const missing = CATALOG.filter((t) => t.engine === 'server' && !limits.some((l) => l.tool_slug === t.slug)).map((t) => ({ slug: t.slug, name: t.name, status: t.status }));
  const catalog = CATALOG.map((t) => ({ slug: t.slug, name: t.name, engine: t.engine, status: t.status, category: t.category }));
  return ok({ rows, missing, catalog });
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return forbid();
  const b = await readJson(req);
  const slug = String(b.tool_slug || '').trim();
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) return bad('Invalid tool slug.');
  if (b.action === 'delete') {
    await query('DELETE FROM tool_limits WHERE tool_slug = $1', [slug]);
    await logAction(admin.id, 'delete_tool_limit', slug);
    return ok({ message: `Removed limits for ${slug}. The tool is now unavailable until limits are added again.` });
  }
  const daily = parseInt(b.daily_limit, 10);
  const anon = parseInt(b.anon_limit, 10) || 0;
  const batch = b.batch_limit === '' || b.batch_limit == null ? null : parseInt(b.batch_limit, 10);
  if (!Number.isFinite(daily) || daily < 0 || daily > 1000000) return bad('Daily limit must be 0 or more.');
  if (batch !== null && (!Number.isFinite(batch) || batch < 1)) return bad('Batch limit must be empty or at least 1.');
  await query(`INSERT INTO tool_limits (tool_slug, daily_limit, batch_limit, anon_limit, enabled) VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (tool_slug) DO UPDATE SET daily_limit = $2, batch_limit = $3, anon_limit = $4, enabled = $5`, [slug, daily, batch, anon, b.enabled !== false]);
  await logAction(admin.id, 'save_tool_limit', slug, { daily, batch, anon, enabled: b.enabled !== false });
  return ok({ message: `${slug} saved.` });
}
