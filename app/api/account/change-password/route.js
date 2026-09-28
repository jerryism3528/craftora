import { auth } from '../../../../auth';
import { query, queryOne } from '../../../../lib/db';
import { verifyPassword, hashPassword, isStrongEnough } from '../../../../lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) return unauth();

  try {
    const { current, next } = await req.json();
    if (!isStrongEnough(next)) return bad('New password must be at least 8 characters.');

    const user = await queryOne('SELECT password_hash FROM users WHERE id = $1', [session.user.id]);
    if (!user) return bad('Account not found.');
    if (!user.password_hash) return bad('This account uses Google sign-in and has no password to change.');

    const ok = await verifyPassword(current, user.password_hash);
    if (!ok) return bad('Your current password is incorrect.');

    const newHash = await hashPassword(next);
    await query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [newHash, session.user.id]);

    return Response.json({ ok: true });
  } catch (e) {
    console.error('change password error:', e);
    return Response.json({ ok: false, error: 'Something went wrong.' }, { status: 500 });
  }
}

function unauth() { return Response.json({ ok: false, error: 'Not signed in.' }, { status: 401 }); }
function bad(msg) { return Response.json({ ok: false, error: msg }, { status: 400 }); }
