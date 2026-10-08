import { auth } from '../auth';
import { queryOne } from './db';

// Returns { id, email, name } for the signed-in user, or null.
export async function currentUser() {
  const session = await auth();
  if (!session?.user) return null;
  let id = session.user.id;
  if (!id && session.user.email) {
    const u = await queryOne('SELECT id FROM users WHERE email = $1', [session.user.email]);
    id = u?.id;
  }
  if (!id) return null;
  return { id: String(id), email: session.user.email || '', name: session.user.username || session.user.name || '' };
}

export function clientIp(req) {
  const xff = req.headers.get('x-forwarded-for') || '';
  return xff.split(',')[0].trim() || req.headers.get('x-real-ip') || null;
}
