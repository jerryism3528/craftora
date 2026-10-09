import fs from 'fs/promises';
import path from 'path';
import { auth } from '../auth';
import { query } from './db';

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) return null;
  return session.user;
}

export async function logAction(adminId, action, target, detail) {
  try {
    await query('INSERT INTO admin_log (admin_id, action, target, detail) VALUES ($1, $2, $3, $4)', [adminId || null, action, target || null, detail ? JSON.stringify(detail) : null]);
  } catch (e) { console.error('admin log failed:', e.message); }
}

export const ok = (data = {}) => Response.json({ ok: true, ...data });
export const bad = (error, status = 400) => Response.json({ ok: false, error }, { status });
export const forbid = () => Response.json({ ok: false, error: 'Forbidden.' }, { status: 403 });

export async function readJson(req) {
  try { return await req.json(); } catch { return {}; }
}

export function pageArgs(url, size = 50) {
  const p = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  return { page: p, limit: size, offset: (p - 1) * size };
}

export const IMAGES_DIR = process.env.IMAGES_DIR || '/app/storage/images';
export const UPLOADS_DIR = process.env.UPLOADS_DIR || '/app/storage/uploads';

// Total size and file count of a folder (one level deep plus subfolders), never throws.
export async function dirStats(dir, depth = 2) {
  let bytes = 0, files = 0;
  async function walk(d, lvl) {
    let entries = [];
    try { entries = await fs.readdir(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (lvl < depth) await walk(p, lvl + 1); }
      else { try { const s = await fs.stat(p); bytes += s.size; files++; } catch {} }
    }
  }
  await walk(dir, 0);
  return { bytes, files };
}
