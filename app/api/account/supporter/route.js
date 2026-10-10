import { auth } from '../../../../auth';
import { query, queryOne } from '../../../../lib/db';
import { cleanName } from '../../../../lib/supporters';

export const dynamic = 'force-dynamic';

async function me() {
  const s = await auth();
  if (!s?.user?.id) return null;
  return queryOne('SELECT id, username, is_supporter, supporter_name, show_on_wall FROM users WHERE id = $1', [s.user.id]);
}

// GET: the signed-in user's wall listing.
export async function GET() {
  const u = await me();
  if (!u) return Response.json({ signedIn: false });
  return Response.json({ signedIn: true, isSupporter: u.is_supporter, name: u.supporter_name || u.username || '', show: u.show_on_wall });
}

// POST { name, show }: supporters can rename or hide their own listing.
export async function POST(req) {
  const u = await me();
  if (!u) return Response.json({ error: 'Please sign in.' }, { status: 401 });
  if (!u.is_supporter) return Response.json({ error: 'Only supporters are listed on the wall.' }, { status: 403 });
  let b = {};
  try { b = await req.json(); } catch {}
  const name = cleanName(b.name);
  if (name.length < 2) return Response.json({ error: 'Use at least 2 characters.' }, { status: 400 });
  await query('UPDATE users SET supporter_name = $2, show_on_wall = $3, updated_at = now() WHERE id = $1', [u.id, name, b.show !== false]);
  return Response.json({ ok: true, name, show: b.show !== false });
}
