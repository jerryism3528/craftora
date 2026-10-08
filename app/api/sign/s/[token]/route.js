import { query, queryOne } from '../../../../../lib/db';
import { loadFull, logEvent, afterSigned, afterDeclined, reqMeta } from '../../../../../lib/signer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex' } });
const MAX_IMG = 400 * 1024;

async function bySigner(token) {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token || '')) return null;
  const signer = await queryOne('SELECT * FROM sign_signers WHERE token = $1', [token]);
  if (!signer) return null;
  const full = await loadFull(signer.doc_id);
  if (!full) return null;
  return { signer: full.signers.find((s) => s.id === signer.id), full };
}

function view(signer, full) {
  const { doc, signers, fields } = full;
  const canSign = doc.status === 'sent' && ['sent', 'viewed'].includes(signer.status);
  return {
    doc: { id: doc.id, title: doc.title, pages: doc.pages, status: doc.status, senderName: doc.sender_name, senderEmail: doc.sender_email, message: doc.message, ordered: doc.ordered, expiresAt: doc.expires_at, completedAt: doc.completed_at },
    signer: { id: signer.id, name: signer.name, email: signer.email, status: signer.status, color: signer.color, signedAt: signer.signed_at, declinedReason: signer.declined_reason },
    others: signers.filter((s) => s.id !== signer.id).map((s) => ({ name: s.name, status: s.status, color: s.color })),
    fields: fields.filter((f) => f.signer_id === signer.id).map((f) => ({ id: f.id, type: f.type, page: f.page, x: f.x, y: f.y, w: f.w, h: f.h, required: f.required, label: f.label, value: f.type === 'signature' || f.type === 'initials' ? (f.value ? 'filled' : null) : f.value })),
    canSign,
  };
}

export async function GET(req, { params }) {
  const found = await bySigner(params.token);
  if (!found) return json({ error: 'This signing link is not valid. Check the link in your email.' }, 404);
  const { signer, full } = found;
  if (full.doc.status === 'sent' && signer.status === 'sent') {
    await query("UPDATE sign_signers SET status = 'viewed', viewed_at = now() WHERE id = $1 AND status = 'sent'", [signer.id]);
    await logEvent(full.doc.id, signer.id, 'viewed', '', req);
    signer.status = 'viewed';
    signer.viewed_at = new Date();
  }
  return json(view(signer, full));
}

export async function POST(req, { params }) {
  const found = await bySigner(params.token);
  if (!found) return json({ error: 'This signing link is not valid.' }, 404);
  const { signer, full } = found;
  if (full.doc.status !== 'sent' || !['sent', 'viewed'].includes(signer.status)) return json({ error: 'This document can no longer be signed.' }, 400);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  const { ip, ua } = reqMeta(req);

  if (body.action === 'decline') {
    const reason = String(body.reason || '').trim().slice(0, 500);
    await query("UPDATE sign_signers SET status = 'declined', declined_reason = $2, ip = $3, user_agent = $4 WHERE id = $1", [signer.id, reason, ip, ua]);
    await logEvent(full.doc.id, signer.id, 'declined', reason, req);
    await afterDeclined(full.doc.id, signer, reason);
    return json({ ok: true, declined: true });
  }

  if (body.action !== 'sign') return json({ error: 'Unknown action.' }, 400);
  if (!body.consent) return json({ error: 'Please agree to sign electronically.' }, 400);
  const values = body.values && typeof body.values === 'object' ? body.values : {};
  const mine = full.fields.filter((f) => f.signer_id === signer.id);
  const date = new Date().toISOString().slice(0, 10);
  const updates = [];
  for (const f of mine) {
    let v = values[f.id];
    if (f.type === 'date') v = date;
    else if (f.type === 'email') v = signer.email;
    else if (f.type === 'signature' || f.type === 'initials') {
      if (v && (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(v) || v.length > MAX_IMG)) return json({ error: 'The signature image is invalid or too large. Please draw it again.' }, 400);
    } else if (f.type === 'checkbox') v = v === true || v === 'true' ? 'true' : 'false';
    else v = v == null ? '' : String(v).trim().slice(0, 500);
    const empty = v == null || v === '' || (f.type === 'checkbox' && v !== 'true');
    if (f.required && empty) return json({ error: `Please complete all required fields (${f.type === 'text' && f.label ? f.label : f.type}).` }, 400);
    updates.push([f.id, f.type === 'checkbox' ? v : (v || null)]);
  }
  for (const [id, v] of updates) await query('UPDATE sign_fields SET value = $2 WHERE id = $1', [id, v]);
  const done = await queryOne("UPDATE sign_signers SET status = 'signed', signed_at = now(), ip = $2, user_agent = $3 WHERE id = $1 AND status IN ('sent', 'viewed') RETURNING id", [signer.id, ip, ua]);
  if (!done) return json({ error: 'This document was already signed.' }, 400);
  await logEvent(full.doc.id, signer.id, 'signed', '', req);
  const finalHash = await afterSigned(full.doc.id, { ...signer, status: 'signed' }, req);
  return json({ ok: true, completed: !!finalHash });
}
