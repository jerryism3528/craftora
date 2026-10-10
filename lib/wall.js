import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { query, queryOne } from './db';
import { cleanName, safeUrl } from './supporters';

export const WALL_DIR = process.env.WALL_DIR || path.join(process.env.IMAGES_DIR || '/app/storage/images', 'wall');
export const LEVELS = ['sponsor', 'business', 'pro', 'supporter'];
const RANK = { supporter: 0, pro: 1, business: 2, sponsor: 3 };
export const MAX_PHOTO_BYTES = 400 * 1024;

export function levelForTier(tier) {
  if (!tier) return 'supporter';
  if (tier.key === 'sponsor') return 'sponsor';
  if (tier.plan === 'business' && !tier.months) return 'business';
  if (tier.plan === 'pro' && !tier.months) return 'pro';
  return 'supporter';
}

// Public URL for a stored photo value.
export function photoUrl(v) {
  if (!v) return '';
  if (v.startsWith('/')) return v;
  if (/^[a-f0-9]{24}\.(jpg|png|webp)$/.test(v)) return `/api/wall-photo/${v}`;
  return safeUrl(v);
}

// Accept only real JPEG, PNG, or WebP files, checked by their first bytes.
function sniff(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length > 8 && buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.length > 12 && buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP') return 'webp';
  return null;
}

export async function savePhoto(buf) {
  if (!buf || !buf.length) throw new Error('Empty file.');
  if (buf.length > MAX_PHOTO_BYTES) throw new Error('Photo must be under 400 KB.');
  const ext = sniff(buf);
  if (!ext) throw new Error('Use a JPG, PNG, or WebP image.');
  await fs.mkdir(WALL_DIR, { recursive: true });
  const name = `${crypto.randomBytes(12).toString('hex')}.${ext}`;
  await fs.writeFile(path.join(WALL_DIR, name), buf);
  return name;
}

export async function deletePhoto(v) {
  if (!v || !/^[a-f0-9]{24}\.(jpg|png|webp)$/.test(v)) return;
  try { await fs.unlink(path.join(WALL_DIR, v)); } catch {}
}

// Create or upgrade the wall entry for a backer. Never downgrades a level or overwrites a chosen name.
export async function ensureWallEntry({ userId = null, email = null, name = '', tierKey = null, level = null, source = '' }) {
  try {
    let lv = level;
    if (!lv) {
      const tier = tierKey ? await queryOne('SELECT key, plan, months FROM reward_tiers WHERE key = $1', [tierKey]) : null;
      lv = levelForTier(tier);
    }
    let nm = cleanName(name);
    if (!nm && userId) {
      const u = await queryOne('SELECT username, email FROM users WHERE id = $1', [userId]);
      nm = cleanName(u?.username || (u?.email || '').split('@')[0]);
    }
    if (!nm) nm = 'Supporter';
    const mail = email ? String(email).trim().toLowerCase() : null;

    let cur = null;
    if (userId) cur = await queryOne('SELECT * FROM wall_entries WHERE user_id = $1', [userId]);
    if (!cur && mail) cur = await queryOne('SELECT * FROM wall_entries WHERE lower(email) = $1 AND user_id IS NULL', [mail]);

    if (cur) {
      const newLevel = RANK[lv] > RANK[cur.level] ? lv : cur.level;
      await query(`UPDATE wall_entries SET level = $2, user_id = COALESCE(user_id, $3), source = CASE WHEN source = '' THEN $4 ELSE source END,
        name = CASE WHEN name = 'Supporter' AND $5 <> 'Supporter' THEN $5 ELSE name END, updated_at = now() WHERE id = $1`,
        [cur.id, newLevel, userId, source || '', nm]);
      return cur.id;
    }
    const row = await queryOne('INSERT INTO wall_entries (name, level, user_id, email, source) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [nm, lv, userId, userId ? null : mail, source || '']);
    if (userId) await query('UPDATE users SET is_supporter = true, supporter_since = COALESCE(supporter_since, now()) WHERE id = $1', [userId]);
    return row.id;
  } catch (e) {
    console.error('wall entry:', e.message);
    return null;
  }
}

// When a backer signs up, connect their imported entry to the new account.
export async function linkWallEntry(userId, email) {
  try {
    const mine = await queryOne('SELECT id FROM wall_entries WHERE user_id = $1', [userId]);
    const waiting = await queryOne('SELECT id, level FROM wall_entries WHERE lower(email) = lower($1) AND user_id IS NULL', [email]);
    if (!waiting) return;
    if (mine) {
      await query('DELETE FROM wall_entries WHERE id = $1', [waiting.id]);
    } else {
      await query('UPDATE wall_entries SET user_id = $1, email = NULL, updated_at = now() WHERE id = $2', [userId, waiting.id]);
    }
    await query('UPDATE users SET is_supporter = true, supporter_since = COALESCE(supporter_since, now()) WHERE id = $1', [userId]);
  } catch (e) { console.error('wall link:', e.message); }
}

export function adminRow(r) {
  return { ...r, photo_url: photoUrl(r.photo), pending_url: photoUrl(r.pending_photo) };
}
