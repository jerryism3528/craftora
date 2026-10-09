import { query, queryOne } from '../../../../lib/db';
import { requireAdmin, logAction, ok, bad, forbid, readJson } from '../../../../lib/admin';
import { getPlans, clearPlanCache, applyGrantToUser } from '../../../../lib/plans';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

// Minimal CSV parser (quotes, commas, CRLF).
function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  const s = String(text || '').replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"' && s[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',' || c === ';' || c === '\t') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

function findCol(header, names) {
  const h = header.map((x) => x.trim().toLowerCase());
  for (const n of names) { const i = h.indexOf(n); if (i >= 0) return i; }
  for (const n of names) { const i = h.findIndex((x) => x.includes(n)); if (i >= 0) return i; }
  return -1;
}

function matchTier(value, price, tiers) {
  const v = String(value || '').trim().toLowerCase();
  if (v) {
    let t = tiers.find((x) => x.key === v || x.name.toLowerCase() === v);
    if (t) return t;
    t = [...tiers].sort((a, b) => b.name.length - a.name.length).find((x) => v.includes(x.name.toLowerCase()) || x.name.toLowerCase().includes(v));
    if (t) return t;
  }
  const p = Number(String(price || '').replace(/[^0-9.]/g, ''));
  if (p) return tiers.find((x) => x.price_usd === Math.round(p)) || null;
  return null;
}

// Turn pasted CSV or a plain email list into rows ready to import.
async function buildRows(csv, defaultTier, tiers) {
  const data = parseCsv(csv);
  if (!data.length) return [];
  let start = 0, cEmail = -1, cName = -1, cTier = -1, cPrice = -1, cStatus = -1;
  const first = data[0];
  if (!first.some((x) => EMAIL_RE.test(x.trim()))) {
    start = 1;
    cEmail = findCol(first, ['email', 'e-mail', 'email address']);
    cName = findCol(first, ['backer name', 'name', 'full name']);
    cTier = findCol(first, ['reward title', 'reward', 'tier', 'reward tier']);
    cPrice = findCol(first, ['reward minimum', 'pledge amount', 'amount', 'price']);
    cStatus = findCol(first, ['pledged status', 'status']);
  }
  const out = [];
  const seen = new Set();
  for (const r of data.slice(start)) {
    const email = (cEmail >= 0 ? r[cEmail] : r.find((x) => EMAIL_RE.test(x.trim())) || '').trim().toLowerCase();
    const row = { email, name: cName >= 0 ? (r[cName] || '').trim() : '', tierText: cTier >= 0 ? (r[cTier] || '').trim() : '', issue: '' };
    if (!EMAIL_RE.test(email)) { row.issue = 'Invalid email'; out.push(row); continue; }
    if (seen.has(email)) { row.issue = 'Duplicate in file'; out.push(row); continue; }
    seen.add(email);
    const st = cStatus >= 0 ? String(r[cStatus] || '').trim().toLowerCase() : '';
    if (st && !['collected', 'paid', 'complete', 'completed', 'successful'].includes(st)) { row.issue = `Pledge status: ${st}`; out.push(row); continue; }
    const tier = matchTier(row.tierText, cPrice >= 0 ? r[cPrice] : '', tiers) || tiers.find((t) => t.key === defaultTier) || null;
    if (!tier) { row.issue = 'No matching tier'; out.push(row); continue; }
    row.tier = tier.key;
    row.tierName = tier.name;
    out.push(row);
  }
  const emails = out.filter((r) => r.tier).map((r) => r.email);
  if (emails.length) {
    const existing = await query('SELECT id, lower(email) AS email FROM users WHERE lower(email) = ANY($1)', [emails]);
    const map = Object.fromEntries(existing.map((e) => [e.email, e.id]));
    for (const r of out) if (r.tier) r.userId = map[r.email] || null;
  }
  return out;
}

export async function GET() {
  if (!(await requireAdmin())) return forbid();
  const plans = Object.values(await getPlans(true));
  const tiers = await query(`SELECT t.*,
      (SELECT count(*) FROM users u WHERE u.reward_tier = t.key)::int AS claimed,
      (SELECT count(*) FROM plan_grants g WHERE g.tier = t.key AND g.claimed_at IS NULL)::int AS pending
    FROM reward_tiers t ORDER BY sort, price_usd`);
  const counts = await query(`SELECT plan, count(*)::int AS n,
      count(*) FILTER (WHERE plan_expires_at IS NULL)::int AS lifetime
    FROM users WHERE plan <> 'free' AND (plan_expires_at IS NULL OR plan_expires_at > now()) GROUP BY plan`);
  const grants = await query('SELECT * FROM plan_grants WHERE claimed_at IS NULL ORDER BY created_at DESC LIMIT 500');
  const tools = await query('SELECT tool_slug, daily_limit FROM tool_limits ORDER BY tool_slug');
  return ok({ plans, tiers, counts, grants, tools });
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return forbid();
  const body = await readJson(req);

  try {
    if (body.action === 'save_plan') {
      const p = body.plan || {};
      const cur = await queryOne('SELECT key FROM plans WHERE key = $1', [p.key]);
      if (!cur) return bad('Unknown plan.');
      const overrides = {};
      for (const [k, v] of Object.entries(p.tool_overrides || {})) {
        if (v === '' || v === null || v === undefined) continue;
        const n = Number(v);
        if (!Number.isFinite(n) || n < 0) return bad(`Invalid limit for ${k}.`);
        overrides[k] = Math.round(n);
      }
      const mult = Number(p.multiplier);
      if (!Number.isFinite(mult) || mult <= 0 || mult > 1000) return bad('Multiplier must be between 0 and 1000.');
      await query(`UPDATE plans SET name = $2, multiplier = $3, tool_overrides = $4, storage_mb = $5, seats = $6, white_label = $7, ad_free = $8, color = $9 WHERE key = $1`,
        [p.key, String(p.name || p.key).slice(0, 40), mult, JSON.stringify(overrides), Math.max(0, parseInt(p.storage_mb, 10) || 0), Math.max(1, parseInt(p.seats, 10) || 1), !!p.white_label, !!p.ad_free, /^#[0-9a-f]{6}$/i.test(p.color || '') ? p.color : '#64748b']);
      clearPlanCache();
      await logAction(admin.id, 'save_plan', p.key, { multiplier: mult, overrides });
      return ok({ message: `${p.name || p.key} plan saved.` });
    }

    if (body.action === 'save_tier') {
      const t = body.tier || {};
      const key = String(t.key || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 40);
      if (!key || !t.name) return bad('Tier needs a key and a name.');
      const plans = await getPlans();
      if (!plans[t.plan]) return bad('Unknown plan.');
      const months = t.months === '' || t.months === null || t.months === undefined ? null : Math.max(1, parseInt(t.months, 10) || 1);
      await query(`INSERT INTO reward_tiers (key, name, price_usd, plan, months, supporter, max_backers, extras, sort)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (key) DO UPDATE SET name = $2, price_usd = $3, plan = $4, months = $5, supporter = $6, max_backers = $7, extras = $8, sort = $9`,
        [key, String(t.name).slice(0, 60), Math.max(0, parseInt(t.price_usd, 10) || 0), t.plan, months, !!t.supporter,
          t.max_backers === '' || t.max_backers == null ? null : Math.max(0, parseInt(t.max_backers, 10) || 0), String(t.extras || '').slice(0, 200), parseInt(t.sort, 10) || 0]);
      await logAction(admin.id, 'save_tier', key);
      return ok({ message: `Tier ${t.name} saved.` });
    }

    if (body.action === 'delete_tier') {
      await query('DELETE FROM reward_tiers WHERE key = $1', [body.key]);
      await logAction(admin.id, 'delete_tier', body.key);
      return ok({ message: 'Tier deleted.' });
    }

    if (body.action === 'delete_grant') {
      const g = await queryOne('DELETE FROM plan_grants WHERE id = $1 AND claimed_at IS NULL RETURNING email', [body.id]);
      if (!g) return bad('Grant not found.');
      await logAction(admin.id, 'delete_grant', g.email);
      return ok({ message: 'Pending plan removed.' });
    }

    if (body.action === 'import_preview' || body.action === 'import') {
      if (!body.csv || String(body.csv).length > 2_000_000) return bad('Paste a CSV or a list of emails (up to 2 MB).');
      const tiers = await query('SELECT * FROM reward_tiers ORDER BY sort');
      const rows = await buildRows(body.csv, body.defaultTier, tiers);
      if (!rows.length) return bad('No rows found.');
      if (rows.length > 5000) return bad('Import up to 5,000 rows at a time.');
      if (body.action === 'import_preview') {
        return ok({ rows: rows.slice(0, 1000), summary: {
          total: rows.length,
          ready: rows.filter((r) => r.tier).length,
          existing: rows.filter((r) => r.userId).length,
          pending: rows.filter((r) => r.tier && !r.userId).length,
          skipped: rows.filter((r) => !r.tier).length,
        } });
      }
      const source = String(body.source || 'kickstarter').slice(0, 30);
      const byKey = Object.fromEntries(tiers.map((t) => [t.key, t]));
      let applied = 0, pending = 0, skipped = 0;
      clearPlanCache();
      for (const r of rows) {
        if (!r.tier) { skipped++; continue; }
        const t = byKey[r.tier];
        const grant = { plan: t.plan, months: t.months, tier: t.key, supporter: t.supporter, supporter_name: r.name, source };
        if (r.userId) {
          await applyGrantToUser(r.userId, grant);
          await query('INSERT INTO plan_grants (email, plan, months, tier, supporter, supporter_name, source, claimed_at, claimed_user) VALUES ($1,$2,$3,$4,$5,$6,$7, now(), $8)',
            [r.email, t.plan, t.months, t.key, t.supporter, r.name || null, source, r.userId]);
          applied++;
        } else {
          await query(`INSERT INTO plan_grants (email, plan, months, tier, supporter, supporter_name, source) VALUES ($1,$2,$3,$4,$5,$6,$7)
            ON CONFLICT (lower(email)) WHERE claimed_at IS NULL DO UPDATE SET plan = $2, months = $3, tier = $4, supporter = $5, supporter_name = $6, source = $7, created_at = now()`,
            [r.email, t.plan, t.months, t.key, t.supporter, r.name || null, source]);
          pending++;
        }
      }
      await logAction(admin.id, 'import_backers', source, { applied, pending, skipped });
      return ok({ message: `Import done: ${applied} accounts upgraded, ${pending} waiting for signup, ${skipped} skipped.`, applied, pending, skipped });
    }

    return bad('Unknown action.');
  } catch (e) {
    console.error('admin plans error:', e);
    return bad('Something went wrong.', 500);
  }
}
