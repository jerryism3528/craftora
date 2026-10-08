import { query, queryOne } from '../../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const rows = (r) => (Array.isArray(r) ? r : r?.rows || []);
const hits = new Map();

function mask(email) {
  const [u, d] = String(email).split('@');
  return `${u.slice(0, 2)}${'*'.repeat(Math.max(1, u.length - 2))}@${d}`;
}

export async function POST(req) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'x';
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60000);
  if (list.length >= 30) return json({ error: 'Too many checks. Please wait a minute.' }, 429);
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) hits.clear();

  let body;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  const hash = String(body.hash || '').toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(hash)) return json({ error: 'Invalid file fingerprint.' }, 400);

  const doc = await queryOne("SELECT id, title, pages, completed_at, sender_name FROM sign_docs WHERE final_sha256 = $1 AND status = 'completed'", [hash]);
  if (doc) {
    const signers = rows(await query('SELECT name, email, signed_at FROM sign_signers WHERE doc_id = $1 ORDER BY position, id', [doc.id]));
    return json({ match: 'signed', doc: { id: doc.id, title: doc.title, pages: doc.pages, completedAt: doc.completed_at, senderName: doc.sender_name }, signers: signers.map((s) => ({ name: s.name, email: mask(s.email), signedAt: s.signed_at })) });
  }
  return json({ match: 'none' });
}
