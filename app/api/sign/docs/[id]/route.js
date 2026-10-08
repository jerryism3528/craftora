import { currentUser } from '../../../../../lib/current-user';
import { query, queryOne } from '../../../../../lib/db';
import { loadFull, ownerView, removeDocFiles, isValidEmail, FIELD_TYPES, COLORS, MAX_SIGNERS, MAX_FIELDS } from '../../../../../lib/signer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const clamp = (n, a, b) => Math.min(b, Math.max(a, Number(n) || 0));

async function ownDoc(id) {
  const user = await currentUser();
  if (!user) return { error: json({ error: 'Please sign in.', needLogin: true }, 401) };
  if (!/^[A-Za-z0-9_-]{6,24}$/.test(id || '')) return { error: json({ error: 'Document not found.' }, 404) };
  const full = await loadFull(id);
  if (!full || full.doc.user_id !== user.id) return { error: json({ error: 'Document not found.' }, 404) };
  return { user, full };
}

export async function GET(_req, { params }) {
  const { error, user, full } = await ownDoc(params.id);
  if (error) return error;
  return json({ ...ownerView(full, user.email), owner: { name: user.name, email: user.email } });
}

// Save a draft: title, message, signing order, signers, and fields.
export async function PUT(req, { params }) {
  const { error, full } = await ownDoc(params.id);
  if (error) return error;
  if (full.doc.status !== 'draft') return json({ error: 'This document was already sent and can no longer be edited.' }, 400);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request.' }, 400); }

  const title = String(body.title || '').trim().slice(0, 150) || full.doc.title;
  const message = String(body.message || '').slice(0, 2000);
  const ordered = !!body.ordered;
  const signers = Array.isArray(body.signers) ? body.signers.slice(0, MAX_SIGNERS + 1) : [];
  if (signers.length > MAX_SIGNERS) return json({ error: `You can add up to ${MAX_SIGNERS} signers.` }, 400);
  const seen = new Set();
  for (const s of signers) {
    s.name = String(s.name || '').trim().slice(0, 100);
    s.email = String(s.email || '').trim().toLowerCase().slice(0, 254);
    if (!s.name || !isValidEmail(s.email)) return json({ error: 'Every signer needs a name and a valid email address.' }, 400);
    if (seen.has(s.email)) return json({ error: `${s.email} is added twice.` }, 400);
    seen.add(s.email);
  }
  const fields = Array.isArray(body.fields) ? body.fields : [];
  if (fields.length > MAX_FIELDS) return json({ error: `You can add up to ${MAX_FIELDS} fields.` }, 400);

  await query('DELETE FROM sign_fields WHERE doc_id = $1', [full.doc.id]);
  await query('DELETE FROM sign_signers WHERE doc_id = $1', [full.doc.id]);
  const keyToId = {};
  for (let i = 0; i < signers.length; i++) {
    const s = signers[i];
    const row = await queryOne(
      'INSERT INTO sign_signers (doc_id, name, email, position, color) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [full.doc.id, s.name, s.email, ordered ? clamp(s.position || i + 1, 1, MAX_SIGNERS) : 1, COLORS[i % COLORS.length]]
    );
    keyToId[String(s.key)] = row.id;
  }
  for (const f of fields) {
    const signerId = keyToId[String(f.signerKey)];
    if (!signerId || !FIELD_TYPES.includes(f.type)) continue;
    const page = Math.round(clamp(f.page, 1, full.doc.pages));
    const w = clamp(f.w, 0.01, 1);
    const h = clamp(f.h, 0.01, 1);
    await query(
      'INSERT INTO sign_fields (doc_id, signer_id, type, page, x, y, w, h, required, label) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [full.doc.id, signerId, f.type, page, clamp(f.x, 0, 1 - w), clamp(f.y, 0, 1 - h), w, h, f.type === 'checkbox' ? !!f.required : f.required !== false, String(f.label || '').slice(0, 60)]
    );
  }
  await query('UPDATE sign_docs SET title = $2, message = $3, ordered = $4, updated_at = now() WHERE id = $1', [full.doc.id, title, message, ordered]);
  return json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const { error, full } = await ownDoc(params.id);
  if (error) return error;
  await query('DELETE FROM sign_docs WHERE id = $1', [full.doc.id]);
  await removeDocFiles(full.doc.id);
  return json({ ok: true });
}
