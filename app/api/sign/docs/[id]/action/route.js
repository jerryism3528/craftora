import { currentUser } from '../../../../../../lib/current-user';
import { query, queryOne } from '../../../../../../lib/db';
import { loadFull, logEvent, newId, readDocFile, saveDocFile, MAX_ACTIVE_DOCS } from '../../../../../../lib/signer';
import { sendReminderEmail } from '../../../../../../lib/signer-mail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function POST(req, { params }) {
  const user = await currentUser();
  if (!user) return json({ error: 'Please sign in.', needLogin: true }, 401);
  const full = await loadFull(params.id);
  if (!full || full.doc.user_id !== user.id) return json({ error: 'Document not found.' }, 404);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  const { doc, signers, fields } = full;

  if (body.action === 'remind') {
    if (doc.status !== 'sent') return json({ error: 'Only documents waiting for signatures can be reminded.' }, 400);
    const due = signers.filter((s) => ['sent', 'viewed'].includes(s.status) && (!s.reminded_at || Date.now() - new Date(s.reminded_at).getTime() > 60 * 60 * 1000));
    if (!due.length) return json({ error: 'Reminders were sent less than an hour ago. Try again later.' }, 429);
    for (const s of due) {
      try {
        await sendReminderEmail(doc, s);
        await query('UPDATE sign_signers SET reminded_at = now() WHERE id = $1', [s.id]);
        await logEvent(doc.id, s.id, 'reminded', `Reminder emailed to ${s.email}`, req);
      } catch (e) {
        await logEvent(doc.id, s.id, 'reminded', `Reminder to ${s.email} failed: ${e.message}`, req);
      }
    }
    return json({ ok: true, reminded: due.map((s) => s.email) });
  }

  if (body.action === 'void') {
    if (doc.status !== 'sent') return json({ error: 'Only documents waiting for signatures can be voided.' }, 400);
    await query("UPDATE sign_docs SET status = 'voided', updated_at = now() WHERE id = $1", [doc.id]);
    await logEvent(doc.id, null, 'voided', String(body.reason || '').slice(0, 300), req);
    return json({ ok: true });
  }

  if (body.action === 'duplicate') {
    const active = await queryOne("SELECT COUNT(*)::int AS n FROM sign_docs WHERE user_id = $1 AND status IN ('draft', 'sent')", [user.id]);
    if ((active?.n || 0) >= MAX_ACTIVE_DOCS) return json({ error: `You have ${MAX_ACTIVE_DOCS} active documents. Finish or delete some drafts first.` }, 429);
    const id = newId(9);
    await saveDocFile(id, 'original', await readDocFile(doc.id, 'original'));
    await query(
      'INSERT INTO sign_docs (id, user_id, title, file_name, pages, size_bytes, original_sha256, message, ordered, sender_name, sender_email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [id, user.id, `${doc.title} (copy)`.slice(0, 150), doc.file_name, doc.pages, doc.size_bytes, doc.original_sha256, doc.message, doc.ordered, doc.sender_name, doc.sender_email]
    );
    const map = {};
    for (const s of signers) {
      const row = await queryOne('INSERT INTO sign_signers (doc_id, name, email, position, color) VALUES ($1, $2, $3, $4, $5) RETURNING id', [id, s.name, s.email, s.position, s.color]);
      map[s.id] = row.id;
    }
    for (const f of fields) {
      await query('INSERT INTO sign_fields (doc_id, signer_id, type, page, x, y, w, h, required, label) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [id, map[f.signer_id], f.type, f.page, f.x, f.y, f.w, f.h, f.required, f.label]);
    }
    await logEvent(id, null, 'created', `Copied from ${doc.id}`, req);
    return json({ ok: true, id });
  }

  return json({ error: 'Unknown action.' }, 400);
}
