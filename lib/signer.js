// Document Signer: storage, PDF stamping, certificate, workflow helpers.
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { query, queryOne } from './db';
import { sendInviteEmail, sendSignedNotice, sendDeclinedNotice, sendCompletedEmail } from './signer-mail';

export const DOCS_DIR = process.env.SIGN_DOCS_DIR || '/app/storage/docs';
export const MAX_BYTES = 20 * 1024 * 1024;
export const MAX_PAGES = 50;
export const MAX_SIGNERS = 10;
export const MAX_FIELDS = 200;
export const MAX_ACTIVE_DOCS = 50;
export const EXPIRY_DAYS = 30;
export const FIELD_TYPES = ['signature', 'initials', 'date', 'name', 'email', 'text', 'checkbox'];
export const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#0ea5e9', '#d946ef', '#84cc16', '#f97316', '#14b8a6', '#8b5cf6'];
export const SITE = process.env.AUTH_URL || 'https://craftora.dev';

const rows = (r) => (Array.isArray(r) ? r : r?.rows || []);

export function newId(bytes = 9) {
  return crypto.randomBytes(bytes).toString('base64url');
}
export function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}
export function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim()) && String(e).length <= 254;
}
function filePath(docId, kind) {
  if (!/^[A-Za-z0-9_-]{6,24}$/.test(docId) || !['original', 'final'].includes(kind)) throw new Error('Bad file reference');
  return path.join(DOCS_DIR, `${docId}-${kind}.pdf`);
}
export async function saveDocFile(docId, kind, bytes) {
  await fs.mkdir(DOCS_DIR, { recursive: true });
  await fs.writeFile(filePath(docId, kind), bytes);
}
export async function readDocFile(docId, kind) {
  return fs.readFile(filePath(docId, kind));
}
export async function removeDocFiles(docId) {
  for (const k of ['original', 'final']) { try { await fs.unlink(filePath(docId, k)); } catch {} }
}

export function reqMeta(req) {
  if (!req) return { ip: null, ua: null };
  const xff = req.headers.get('x-forwarded-for') || '';
  return { ip: xff.split(',')[0].trim() || req.headers.get('x-real-ip') || null, ua: (req.headers.get('user-agent') || '').slice(0, 300) || null };
}

export async function logEvent(docId, signerId, event, detail = '', req = null) {
  const { ip, ua } = reqMeta(req);
  await query('INSERT INTO sign_events (doc_id, signer_id, event, detail, ip, user_agent) VALUES ($1, $2, $3, $4, $5, $6)', [docId, signerId || null, event, String(detail).slice(0, 500), ip, ua]);
}

// Validate an uploaded PDF and return basic info.
export async function inspectPdf(bytes) {
  if (bytes.length > MAX_BYTES) throw new Error('The PDF is larger than 20 MB.');
  if (!Buffer.from(bytes.slice(0, 1024)).toString('latin1').includes('%PDF')) throw new Error('This file is not a valid PDF.');
  let doc;
  try {
    doc = await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (e) {
    if (/encrypt/i.test(e.message)) throw new Error('This PDF is password protected. Remove the password with the Unlock PDF tool first.');
    throw new Error('Could not read this PDF. It may be damaged.');
  }
  const pages = doc.getPageCount();
  if (!pages) throw new Error('This PDF has no pages.');
  if (pages > MAX_PAGES) throw new Error(`This PDF has ${pages} pages. The limit is ${MAX_PAGES}.`);
  return { pages };
}

export async function loadFull(docId) {
  const doc = await queryOne('SELECT * FROM sign_docs WHERE id = $1', [docId]);
  if (!doc) return null;
  await refreshExpiry(doc);
  const signers = rows(await query('SELECT * FROM sign_signers WHERE doc_id = $1 ORDER BY position, id', [docId]));
  const fields = rows(await query('SELECT * FROM sign_fields WHERE doc_id = $1 ORDER BY page, y, x', [docId]));
  const events = rows(await query('SELECT * FROM sign_events WHERE doc_id = $1 ORDER BY created_at, id', [docId]));
  return { doc, signers, fields, events };
}

export async function refreshExpiry(doc) {
  if (doc && doc.status === 'sent' && doc.expires_at && new Date(doc.expires_at) < new Date()) {
    await query("UPDATE sign_docs SET status = 'expired', updated_at = now() WHERE id = $1 AND status = 'sent'", [doc.id]);
    await logEvent(doc.id, null, 'expired', 'The signing deadline passed.');
    doc.status = 'expired';
  }
  return doc;
}

// Strip characters the standard PDF fonts cannot draw.
const REPL = { '‘': "'", '’': "'", '“': '"', '”': '"', '–': '-', '—': '-', '…': '...', ' ': ' ' };
export function pdfSafe(font, s) {
  let out = '';
  for (const ch of String(s || '').replace(/[\r\n\t]+/g, ' ')) {
    const c = REPL[ch] || ch;
    try { font.widthOfTextAtSize(c, 10); out += c; } catch { out += '?'; }
  }
  return out;
}

// Map a field rectangle (fractions of the page as the viewer sees it) to PDF space, honoring page rotation.
function viewToPdf(page, fx, fy, fw, fh) {
  const crop = page.getCropBox();
  const rot = (((page.getRotation().angle || 0) % 360) + 360) % 360;
  const W = crop.width;
  const H = crop.height;
  const VW = rot === 90 || rot === 270 ? H : W;
  const VH = rot === 90 || rot === 270 ? W : H;
  const u = fx * VW;
  const v = (fy + fh) * VH; // bottom-left corner of the field in view space
  let X; let Y;
  if (rot === 90) { X = crop.x + v; Y = crop.y + u; }
  else if (rot === 180) { X = crop.x + W - u; Y = crop.y + v; }
  else if (rot === 270) { X = crop.x + W - v; Y = crop.y + H - u; }
  else { X = crop.x + u; Y = crop.y + H - v; }
  return { x: X, y: Y, w: fw * VW, h: fh * VH, rot };
}

// Rotate a local (dx, dy) offset into page space.
function off(rot, dx, dy) {
  if (rot === 90) return [-dy, dx];
  if (rot === 180) return [-dx, -dy];
  if (rot === 270) return [dy, -dx];
  return [dx, dy];
}

function drawFieldText(page, font, text, r, maxSize = 14) {
  const t = pdfSafe(font, text);
  if (!t) return;
  let size = Math.min(maxSize, r.h * 0.62);
  while (size > 5 && font.widthOfTextAtSize(t, size) > r.w - 4) size -= 0.5;
  const dy = (r.h - size) / 2 + size * 0.22;
  const [ox, oy] = off(r.rot, 2, dy);
  page.drawText(t, { x: r.x + ox, y: r.y + oy, size, font, color: rgb(0.07, 0.09, 0.2), rotate: degrees(r.rot) });
}

async function drawFieldImage(pdf, page, dataUrl, r) {
  const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || '');
  if (!m) return;
  const img = await pdf.embedPng(Buffer.from(m[1], 'base64'));
  const scale = Math.min(r.w / img.width, r.h / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const [ox, oy] = off(r.rot, (r.w - w) / 2, (r.h - h) / 2);
  page.drawImage(img, { x: r.x + ox, y: r.y + oy, width: w, height: h, rotate: degrees(r.rot) });
}

function drawCheck(page, r) {
  const s = Math.min(r.w, r.h);
  const pts = [[0.2, 0.5], [0.42, 0.25], [0.82, 0.78]].map(([a, b]) => off(r.rot, (r.w - s) / 2 + a * s, (r.h - s) / 2 + b * s));
  for (let i = 0; i < 2; i++) {
    page.drawLine({ start: { x: r.x + pts[i][0], y: r.y + pts[i][1] }, end: { x: r.x + pts[i + 1][0], y: r.y + pts[i + 1][1] }, thickness: Math.max(1.2, s * 0.12), color: rgb(0.07, 0.09, 0.2) });
  }
}

function fmtUtc(d) {
  if (!d) return '';
  return new Date(d).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

function wrapText(font, text, size, maxW) {
  const words = pdfSafe(font, text).split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (font.widthOfTextAtSize(t, size) > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

const EVENT_LABEL = {
  created: 'Document uploaded', sent: 'Sent for signature', invited: 'Invitation emailed', viewed: 'Document opened',
  signed: 'Signed', declined: 'Declined', reminded: 'Reminder sent', voided: 'Voided', completed: 'Completed', expired: 'Expired',
};

async function addCertificate(pdf, full, finalPages) {
  const { doc, signers, events } = full;
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.13, 0.17, 0.35);
  const muted = rgb(0.4, 0.44, 0.54);
  const accent = rgb(0.2, 0.19, 0.66);
  let page = pdf.addPage([595.28, 841.89]);
  let y = 790;
  const left = 50;
  const width = 495;
  const ensure = (need) => { if (y - need < 60) { page = pdf.addPage([595.28, 841.89]); y = 790; } };
  const text = (t, x, size = 10, f = font, color = ink) => page.drawText(pdfSafe(f, t), { x, y, size, font: f, color });

  page.drawRectangle({ x: 0, y: 812, width: 595.28, height: 30, color: accent });
  page.drawText('Craftora Sign', { x: left, y: 822, size: 12, font: bold, color: rgb(1, 1, 1) });
  text('Certificate of Completion', left, 20, bold); y -= 26;
  text('This certificate records how and when each party signed the document below.', left, 10, font, muted); y -= 28;

  const kv = [
    ['Document', doc.title], ['Document ID', doc.id], ['Original file', `${doc.file_name} (${finalPages} pages)`],
    ['Original SHA-256', doc.original_sha256], ['Sender', `${doc.sender_name} <${doc.sender_email}>`],
    ['Created', fmtUtc(doc.created_at)], ['Sent', fmtUtc(doc.sent_at)], ['Completed', fmtUtc(new Date())],
    ['Signing order', doc.ordered ? 'In order' : 'Any order'],
  ];
  for (const [k, v] of kv) {
    ensure(16);
    text(k, left, 9, bold, muted);
    const lines = wrapText(font, v, 9.5, width - 120);
    lines.forEach((l, i) => { if (i) { y -= 13; ensure(13); } page.drawText(l, { x: left + 120, y, size: 9.5, font, color: ink }); });
    y -= 16;
  }

  y -= 10; ensure(40);
  text('Signers', left, 13, bold); y -= 20;
  for (const s of signers) {
    ensure(70);
    page.drawRectangle({ x: left, y: y - 52, width, height: 64, borderColor: rgb(0.86, 0.88, 0.94), borderWidth: 1, color: rgb(0.98, 0.98, 1) });
    page.drawText(pdfSafe(bold, s.name), { x: left + 12, y: y - 2, size: 11, font: bold, color: ink });
    page.drawText(pdfSafe(font, s.email), { x: left + 12, y: y - 16, size: 9, font, color: muted });
    page.drawText(`Signed: ${fmtUtc(s.signed_at)}`, { x: left + 12, y: y - 32, size: 9, font, color: ink });
    page.drawText(`Viewed: ${fmtUtc(s.viewed_at)}`, { x: left + 12, y: y - 45, size: 9, font, color: ink });
    page.drawText(pdfSafe(font, `IP address: ${s.ip || 'unknown'}`), { x: left + 260, y: y - 32, size: 9, font, color: ink });
    const ua = pdfSafe(font, (s.user_agent || '').slice(0, 70));
    page.drawText(ua, { x: left + 260, y: y - 45, size: 7.5, font, color: muted });
    y -= 76;
  }

  y -= 6; ensure(40);
  text('Activity log', left, 13, bold); y -= 20;
  const byId = Object.fromEntries(signers.map((s) => [s.id, s]));
  for (const ev of events) {
    ensure(16);
    const who = ev.signer_id && byId[ev.signer_id] ? byId[ev.signer_id].email : doc.sender_email;
    page.drawText(fmtUtc(ev.created_at), { x: left, y, size: 8.5, font, color: muted });
    page.drawText(pdfSafe(bold, EVENT_LABEL[ev.event] || ev.event), { x: left + 125, y, size: 8.5, font: bold, color: ink });
    page.drawText(pdfSafe(font, `${who}${ev.ip ? '  ' + ev.ip : ''}`).slice(0, 80), { x: left + 245, y, size: 8.5, font, color: ink });
    y -= 14;
  }
  ensure(60); y -= 14;
  for (const l of wrapText(font, `Each signer agreed to sign electronically and was identified by a private link sent to their email address. To check that a copy of this document is authentic and unchanged, upload it at ${SITE.replace(/^https?:\/\//, '')}/verify-document.`, 8.5, width)) {
    page.drawText(l, { x: left, y, size: 8.5, font, color: muted }); y -= 12;
  }
}

// Stamp all field values into the PDF, add footer IDs and the certificate. Returns final bytes.
export async function buildFinalPdf(full) {
  const original = await readDocFile(full.doc.id, 'original');
  const pdf = await PDFDocument.load(original, { updateMetadata: false });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  for (const f of full.fields) {
    const page = pages[f.page - 1];
    if (!page || f.value == null || f.value === '') continue;
    const r = viewToPdf(page, f.x, f.y, f.w, f.h);
    if (f.type === 'signature' || f.type === 'initials') await drawFieldImage(pdf, page, f.value, r);
    else if (f.type === 'checkbox') { if (f.value === 'true') drawCheck(page, r); }
    else drawFieldText(page, font, f.value, r);
  }
  const footer = `Craftora Sign  |  Document ID ${full.doc.id}`;
  for (const page of pages) {
    const r = viewToPdf(page, 0.02, 0.975, 0.6, 0.02);
    const size = Math.max(5, Math.min(7, r.h * 0.8));
    const [ox, oy] = off(r.rot, 0, 1);
    page.drawText(footer, { x: r.x + ox, y: r.y + oy, size, font, color: rgb(0.45, 0.48, 0.58), rotate: degrees(r.rot) });
  }
  await addCertificate(pdf, full, pages.length);
  pdf.setTitle(full.doc.title);
  pdf.setProducer('Craftora Sign (craftora.dev)');
  pdf.setModificationDate(new Date());
  return Buffer.from(await pdf.save());
}

export async function finalizeDoc(docId) {
  const full = await loadFull(docId);
  await logEvent(docId, null, 'completed', 'All parties signed.');
  full.events = (await loadFull(docId)).events;
  const bytes = await buildFinalPdf(full);
  const hash = sha256(bytes);
  await saveDocFile(docId, 'final', bytes);
  await query("UPDATE sign_docs SET status = 'completed', completed_at = now(), updated_at = now(), final_sha256 = $2 WHERE id = $1", [docId, hash]);
  try { await sendCompletedEmail(full.doc, full.signers, bytes); } catch (e) { console.error('completed email failed', e.message); }
  return hash;
}

// Send invitations to whoever should sign next.
export async function inviteNext(docId, req = null) {
  const full = await loadFull(docId);
  const { doc, signers } = full;
  if (doc.status !== 'sent') return [];
  const waiting = signers.filter((s) => s.status === 'pending');
  if (!waiting.length) return [];
  let batch = waiting;
  if (doc.ordered) {
    if (signers.some((s) => ['sent', 'viewed'].includes(s.status))) return [];
    const minPos = Math.min(...waiting.map((s) => s.position));
    batch = waiting.filter((s) => s.position === minPos);
  }
  for (const s of batch) {
    const token = s.token || newId(24);
    await query("UPDATE sign_signers SET token = $2, status = 'sent', sent_at = now() WHERE id = $1", [s.id, token]);
    try {
      await sendInviteEmail(doc, { ...s, token });
      await logEvent(docId, s.id, 'invited', `Invitation emailed to ${s.email}`, req);
    } catch (e) {
      await logEvent(docId, s.id, 'invited', `Email to ${s.email} failed: ${e.message}`, req);
    }
  }
  return batch.map((s) => s.email);
}

export async function afterSigned(docId, signer, req) {
  const full = await loadFull(docId);
  if (signer.email.toLowerCase() !== full.doc.sender_email.toLowerCase()) {
    try { await sendSignedNotice(full.doc, signer, full.signers); } catch {}
  }
  if (full.signers.every((s) => s.status === 'signed')) {
    // Lock so two simultaneous last signatures cannot finalize twice.
    const lock = await queryOne("UPDATE sign_docs SET status = 'finalizing', updated_at = now() WHERE id = $1 AND status = 'sent' RETURNING id", [docId]);
    if (!lock) return null;
    try { return await finalizeDoc(docId); } catch (e) {
      await query("UPDATE sign_docs SET status = 'sent' WHERE id = $1 AND status = 'finalizing'", [docId]);
      throw e;
    }
  }
  await inviteNext(docId, req);
  return null;
}

export async function afterDeclined(docId, signer, reason) {
  const full = await loadFull(docId);
  await query("UPDATE sign_docs SET status = 'declined', updated_at = now() WHERE id = $1", [docId]);
  try { await sendDeclinedNotice(full.doc, signer, reason); } catch {}
}

// Public shape of a doc for the owner UI.
export function ownerView(full, ownerEmail = '') {
  const { doc, signers, fields, events } = full;
  return {
    id: doc.id, title: doc.title, fileName: doc.file_name, pages: doc.pages, sizeBytes: doc.size_bytes,
    status: doc.status, message: doc.message, ordered: doc.ordered, createdAt: doc.created_at, sentAt: doc.sent_at,
    completedAt: doc.completed_at, expiresAt: doc.expires_at, originalSha256: doc.original_sha256, finalSha256: doc.final_sha256,
    signers: signers.map((s) => ({ id: s.id, name: s.name, email: s.email, position: s.position, color: s.color, status: s.status, sentAt: s.sent_at, viewedAt: s.viewed_at, signedAt: s.signed_at, declinedReason: s.declined_reason, token: ownerEmail && s.email.toLowerCase() === ownerEmail.toLowerCase() ? s.token : null })),
    fields: fields.map((f) => ({ id: f.id, signerId: f.signer_id, type: f.type, page: f.page, x: f.x, y: f.y, w: f.w, h: f.h, required: f.required, label: f.label, filled: f.value != null && f.value !== '' })),
    events: events.map((e) => ({ id: e.id, signerId: e.signer_id, event: e.event, detail: e.detail, ip: e.ip, createdAt: e.created_at })),
  };
}
