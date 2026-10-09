import fs from 'fs/promises';
import path from 'path';
import { query } from './db';
import { DOCS_DIR, removeDocFiles } from './signer';

// Retention rules for Craftora Sign storage. Completed documents are kept until the owner deletes them.
export const RULES = {
  draftDays: 30,       // drafts not touched for 30 days
  closedDays: 90,      // voided, declined, and expired documents after 90 days
  orphanHours: 24,     // files on disk with no matching document
};

const CLOSED = ['voided', 'declined', 'expired'];

async function candidates() {
  const drafts = await query(
    `SELECT id, title, status, updated_at FROM sign_docs
     WHERE status = 'draft' AND COALESCE(updated_at, created_at) < now() - ($1 || ' days')::interval`,
    [String(RULES.draftDays)]
  );
  const closed = await query(
    `SELECT id, title, status, updated_at FROM sign_docs
     WHERE status = ANY($2) AND COALESCE(updated_at, created_at) < now() - ($1 || ' days')::interval`,
    [String(RULES.closedDays), CLOSED]
  );
  return { drafts, closed };
}

async function orphanFiles() {
  let names = [];
  try { names = await fs.readdir(DOCS_DIR); } catch { return []; }
  const ids = [...new Set(names.map((n) => n.replace(/-(original|final)\.pdf$/, '')).filter((x) => x && !x.includes('.')))];
  if (!ids.length) return [];
  const known = new Set((await query('SELECT id FROM sign_docs WHERE id = ANY($1)', [ids])).map((r) => r.id));
  const out = [];
  const cutoff = Date.now() - RULES.orphanHours * 3600 * 1000;
  for (const n of names) {
    const id = n.replace(/-(original|final)\.pdf$/, '');
    if (id === n || known.has(id)) continue;
    try {
      const s = await fs.stat(path.join(DOCS_DIR, n));
      if (s.mtimeMs < cutoff) out.push({ name: n, bytes: s.size });
    } catch {}
  }
  return out;
}

async function sizeOf(id) {
  let b = 0;
  for (const k of ['original', 'final']) { try { b += (await fs.stat(path.join(DOCS_DIR, `${id}-${k}.pdf`))).size; } catch {} }
  return b;
}

// dryRun = true only reports what would be removed.
export async function runSignerCleanup({ dryRun = false } = {}) {
  // Mark sent documents past their expiry date as expired first, so they age out normally.
  if (!dryRun) {
    await query(`UPDATE sign_docs SET status = 'expired', updated_at = now() WHERE status = 'sent' AND expires_at IS NOT NULL AND expires_at < now()`);
  }
  const { drafts, closed } = await candidates();
  const orphans = await orphanFiles();
  let bytes = orphans.reduce((s, o) => s + o.bytes, 0);
  for (const d of [...drafts, ...closed]) bytes += await sizeOf(d.id);

  if (!dryRun) {
    for (const d of [...drafts, ...closed]) {
      await removeDocFiles(d.id);
      await query('DELETE FROM sign_docs WHERE id = $1', [d.id]);
    }
    for (const o of orphans) { try { await fs.unlink(path.join(DOCS_DIR, o.name)); } catch {} }
  }
  return {
    dryRun,
    drafts: drafts.length,
    closed: closed.length,
    orphanFiles: orphans.length,
    bytes,
    items: [...drafts, ...closed].slice(0, 100).map((d) => ({ id: d.id, title: d.title, status: d.status, updatedAt: d.updated_at })),
  };
}
