import { currentUser } from '../../../../lib/current-user';
import { query, queryOne } from '../../../../lib/db';
import { checkToolAccess } from '../../../../lib/limits';
import { newId, sha256, inspectPdf, saveDocFile, logEvent, MAX_ACTIVE_DOCS, MAX_BYTES } from '../../../../lib/signer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const rows = (r) => (Array.isArray(r) ? r : r?.rows || []);

export async function GET() {
  const user = await currentUser();
  if (!user) return json({ error: 'Please sign in.', needLogin: true }, 401);
  await query("UPDATE sign_docs SET status = 'expired', updated_at = now() WHERE user_id = $1 AND status = 'sent' AND expires_at < now()", [user.id]);
  const docs = rows(await query(
    `SELECT d.id, d.title, d.file_name, d.pages, d.status, d.created_at, d.updated_at, d.sent_at, d.completed_at, d.expires_at,
       (SELECT COUNT(*) FROM sign_signers s WHERE s.doc_id = d.id)::int AS signer_count,
       (SELECT COUNT(*) FROM sign_signers s WHERE s.doc_id = d.id AND s.status = 'signed')::int AS signed_count,
       (SELECT json_agg(json_build_object('name', s.name, 'email', s.email, 'status', s.status, 'color', s.color) ORDER BY s.position, s.id) FROM sign_signers s WHERE s.doc_id = d.id) AS signers
     FROM sign_docs d WHERE d.user_id = $1 ORDER BY d.updated_at DESC LIMIT 500`,
    [user.id]
  ));
  const access = await checkToolAccess(user.id, 'document-signer');
  return json({ docs, remaining: access.remaining ?? 0, dailyLimit: access.dailyLimit ?? 0, isAdmin: !!access.isAdmin, user: { name: user.name, email: user.email } });
}

export async function POST(req) {
  const user = await currentUser();
  if (!user) return json({ error: 'Please sign in to upload a document.', needLogin: true }, 401);
  const active = await queryOne("SELECT COUNT(*)::int AS n FROM sign_docs WHERE user_id = $1 AND status IN ('draft', 'sent')", [user.id]);
  if ((active?.n || 0) >= MAX_ACTIVE_DOCS) return json({ error: `You have ${MAX_ACTIVE_DOCS} active documents. Finish or delete some drafts first.` }, 429);

  let form;
  try { form = await req.formData(); } catch { return json({ error: 'Upload failed. Please try again.' }, 400); }
  const file = form.get('file');
  if (!file || typeof file === 'string') return json({ error: 'Please choose a PDF file.' }, 400);
  if (file.size > MAX_BYTES) return json({ error: 'The PDF is larger than 20 MB.' }, 400);
  const bytes = Buffer.from(await file.arrayBuffer());
  let info;
  try { info = await inspectPdf(bytes); } catch (e) { return json({ error: e.message }, 400); }

  const id = newId(9);
  const fileName = String(file.name || 'document.pdf').replace(/[^\w.\- ()]+/g, '').slice(0, 120) || 'document.pdf';
  const title = String(form.get('title') || fileName.replace(/\.pdf$/i, '')).trim().slice(0, 150) || 'Untitled document';
  await saveDocFile(id, 'original', bytes);
  await query(
    'INSERT INTO sign_docs (id, user_id, title, file_name, pages, size_bytes, original_sha256, sender_name, sender_email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
    [id, user.id, title, fileName, info.pages, bytes.length, sha256(bytes), user.name || user.email.split('@')[0], user.email]
  );
  await logEvent(id, null, 'created', fileName, req);
  return json({ ok: true, id });
}
