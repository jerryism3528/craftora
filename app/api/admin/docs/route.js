import { query, queryOne } from '../../../../lib/db';
import { requireAdmin, logAction, ok, bad, forbid, readJson, pageArgs, dirStats } from '../../../../lib/admin';
import { DOCS_DIR, removeDocFiles, logEvent } from '../../../../lib/signer';
import { runSignerCleanup, RULES } from '../../../../lib/signer-cleanup';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  if (!(await requireAdmin())) return forbid();
  const url = new URL(req.url);
  const { page, limit, offset } = pageArgs(url, 40);
  const status = url.searchParams.get('status') || '';
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const args = [];
  const where = ['TRUE'];
  if (status) { args.push(status); where.push(`d.status = $${args.length}`); }
  if (q) { args.push(`%${q}%`); where.push(`(lower(d.title) LIKE $${args.length} OR lower(d.sender_email) LIKE $${args.length} OR lower(COALESCE(u.email, '')) LIKE $${args.length} OR d.id = $${args.length + 1})`); args.push(q); }
  const w = where.join(' AND ');
  const total = await queryOne(`SELECT count(*)::int AS n FROM sign_docs d LEFT JOIN users u ON u.id::text = d.user_id WHERE ${w}`, args);
  args.push(limit, offset);
  const rows = await query(`SELECT d.id, d.title, d.file_name, d.pages, d.size_bytes, d.status, d.created_at, d.updated_at, d.sent_at, d.completed_at, d.expires_at,
      COALESCE(u.email, d.sender_email) AS owner,
      (SELECT count(*) FROM sign_signers s WHERE s.doc_id = d.id)::int AS signers,
      (SELECT count(*) FROM sign_signers s WHERE s.doc_id = d.id AND s.status = 'signed')::int AS signed
    FROM sign_docs d LEFT JOIN users u ON u.id::text = d.user_id WHERE ${w}
    ORDER BY d.updated_at DESC LIMIT $${args.length - 1} OFFSET $${args.length}`, args);
  const counts = await query('SELECT status, count(*)::int AS n, COALESCE(sum(size_bytes), 0)::bigint AS bytes FROM sign_docs GROUP BY status');
  const disk = await dirStats(DOCS_DIR, 0);
  const preview = await runSignerCleanup({ dryRun: true });
  return ok({ rows, total: total.n, page, pages: Math.max(1, Math.ceil(total.n / limit)), counts, disk, cleanup: { rules: RULES, ...preview, items: preview.items.slice(0, 20) } });
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return forbid();
  const b = await readJson(req);

  if (b.action === 'cleanup') {
    const r = await runSignerCleanup({ dryRun: false });
    await logAction(admin.id, 'signer_cleanup', 'manual', { drafts: r.drafts, closed: r.closed, orphans: r.orphanFiles, bytes: r.bytes });
    return ok({ message: `Cleanup done: ${r.drafts + r.closed} documents and ${r.orphanFiles} leftover files removed.`, result: r });
  }

  const id = String(b.id || '');
  if (!/^[A-Za-z0-9_-]{6,24}$/.test(id)) return bad('Missing document id.');
  const doc = await queryOne('SELECT id, title, status FROM sign_docs WHERE id = $1', [id]);
  if (!doc) return bad('Document not found.');

  if (b.action === 'void') {
    if (doc.status !== 'sent') return bad('Only documents waiting for signatures can be voided.');
    await query("UPDATE sign_docs SET status = 'voided', updated_at = now() WHERE id = $1", [id]);
    await logEvent(id, null, 'voided', 'Voided by Craftora support.');
    await logAction(admin.id, 'void_doc', doc.title, { id });
    return ok({ message: 'Document voided. Signing links no longer work.' });
  }
  if (b.action === 'delete') {
    await removeDocFiles(id);
    await query('DELETE FROM sign_docs WHERE id = $1', [id]);
    await logAction(admin.id, 'delete_doc', doc.title, { id, status: doc.status });
    return ok({ message: 'Document and files deleted.' });
  }
  return bad('Unknown action.');
}
