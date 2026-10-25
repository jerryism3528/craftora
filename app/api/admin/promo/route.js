import { query, queryOne } from '../../../../lib/db';
import { requireAdmin, logAction, ok, bad, forbid, readJson } from '../../../../lib/admin';
import { normCode } from '../../../../lib/promo';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdmin())) return forbid();
  const codes = await query(
    `SELECT p.*,
        count(r.id) FILTER (WHERE r.status = 'paid')::int AS paid,
        count(r.id) FILTER (WHERE r.status <> 'paid')::int AS started,
        COALESCE(sum(r.base_cents - r.discount_cents) FILTER (WHERE r.status = 'paid'), 0)::int AS revenue_cents
       FROM promo_codes p LEFT JOIN promo_redemptions r ON r.code = p.code
      GROUP BY p.code ORDER BY p.created_at`
  );
  const recent = await query(
    `SELECT r.code, r.kind, r.status, r.base_cents, r.discount_cents, r.created_at, r.paid_at, u.email
       FROM promo_redemptions r LEFT JOIN users u ON u.id = r.user_id
      ORDER BY r.created_at DESC LIMIT 30`
  );
  return ok({ codes, recent });
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return forbid();
  const b = await readJson(req);
  const code = normCode(b.code);
  if (!code || code.length < 3) return bad('Codes need at least 3 letters or numbers.');
  if (b.action === 'toggle') {
    const r = await queryOne('UPDATE promo_codes SET active = NOT active WHERE code = $1 RETURNING active', [code]);
    if (!r) return bad('Code not found.', 404);
    await logAction(admin.id, 'toggle_promo', code, { active: r.active });
    return ok({ message: `${code} is now ${r.active ? 'on' : 'off'}.` });
  }
  const percent = parseInt(b.percent, 10);
  const months = parseInt(b.months, 10);
  const maxUses = b.max_uses === '' || b.max_uses == null ? null : parseInt(b.max_uses, 10);
  if (!(percent >= 1 && percent <= 100)) return bad('Percent must be between 1 and 100.');
  if (!(months >= 1 && months <= 24)) return bad('Months must be between 1 and 24.');
  if (maxUses !== null && !(maxUses >= 1)) return bad('Max uses must be empty or at least 1.');
  const exists = await queryOne('SELECT 1 FROM promo_codes WHERE code = $1', [code]);
  if (exists) return bad('That code already exists. Turn it off and create a new one to change the discount.');
  await query('INSERT INTO promo_codes (code, percent, months, max_uses, note) VALUES ($1, $2, $3, $4, $5)', [code, percent, months, maxUses, String(b.note || '').slice(0, 200) || null]);
  await logAction(admin.id, 'create_promo', code, { percent, months, maxUses });
  return ok({ message: `Created ${code}: ${percent}% off the first ${months} month(s).` });
}
