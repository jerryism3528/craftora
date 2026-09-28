import { auth } from '../../../../auth';
import { query, queryOne } from '../../../../lib/db';
import { isValidUsername } from '../../../../lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) return unauth();

  try {
    const { username, avatarUrl } = await req.json();
    const cleanUser = String(username || '').trim();

    if (!isValidUsername(cleanUser)) {
      return bad('Username must be 3-20 characters: letters, numbers, underscores, or hyphens.');
    }

    // Username taken by someone else?
    const taken = await queryOne('SELECT id FROM users WHERE username = $1 AND id <> $2', [cleanUser, session.user.id]);
    if (taken) return bad('That username is taken. Please choose another.');

    // Avatar: accept a data URL under ~700KB (base64 of 512KB) or empty.
    let avatar = avatarUrl || null;
    if (avatar && !(avatar.startsWith('data:image/') || avatar.startsWith('https://'))) {
      return bad('Invalid avatar image.');
    }
    if (avatar && avatar.length > 720000) return bad('Avatar image is too large.');

    await query(
      'UPDATE users SET username = $1, avatar_url = $2, updated_at = now() WHERE id = $3',
      [cleanUser, avatar, session.user.id]
    );

    return Response.json({ ok: true });
  } catch (e) {
    console.error('account update error:', e);
    return Response.json({ ok: false, error: 'Something went wrong.' }, { status: 500 });
  }
}

function unauth() { return Response.json({ ok: false, error: 'Not signed in.' }, { status: 401 }); }
function bad(msg) { return Response.json({ ok: false, error: msg }, { status: 400 }); }
