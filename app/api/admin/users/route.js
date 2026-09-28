import { auth } from '../../../../auth';
import { query, queryOne } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) return null;
  return session.user;
}

async function logAction(adminId, action, target, detail) {
  await query('INSERT INTO admin_log (admin_id, action, target, detail) VALUES ($1, $2, $3, $4)', [adminId, action, target, detail ? JSON.stringify(detail) : null]);
}

// GET: list all users with their blocked tools + suspension state.
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return forbid();

  const users = await query(`
    SELECT u.id, u.email, u.username, u.is_admin, u.created_at,
           (u.suspended_until IS NOT NULL AND u.suspended_until > now()) AS suspended,
           COALESCE(array_agg(b.tool_slug) FILTER (WHERE b.tool_slug IS NOT NULL), '{}') AS blocked_tools
    FROM users u
    LEFT JOIN user_tool_blocks b ON b.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `);

  return Response.json({ ok: true, users });
}

// POST: perform an admin action on a user.
export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return forbid();

  try {
    const { action, userId, tool, days } = await req.json();
    if (!userId) return bad('Missing user.');

    const target = await queryOne('SELECT id, email, is_admin FROM users WHERE id = $1', [userId]);
    if (!target) return bad('User not found.');
    if (target.is_admin) return bad('You cannot perform this action on an admin account.');

    if (action === 'reset_limits') {
      // Clear today's usage for this user (frees their daily caps).
      await query("DELETE FROM usage_log WHERE user_id = $1 AND created_at > now() - interval '24 hours'", [userId]);
      await logAction(admin.id, 'reset_limits', target.email);
      return ok('Limits reset for this user.');
    }

    if (action === 'block_tool') {
      if (!tool) return bad('Missing tool slug.');
      await query('INSERT INTO user_tool_blocks (user_id, tool_slug) VALUES ($1, $2) ON CONFLICT (user_id, tool_slug) DO NOTHING', [userId, tool.trim()]);
      await logAction(admin.id, 'block_tool', target.email, { tool });
      return ok(`Blocked ${tool} for this user.`);
    }

    if (action === 'unblock_tool') {
      if (!tool) return bad('Missing tool slug.');
      await query('DELETE FROM user_tool_blocks WHERE user_id = $1 AND tool_slug = $2', [userId, tool.trim()]);
      await logAction(admin.id, 'unblock_tool', target.email, { tool });
      return ok(`Unblocked ${tool}.`);
    }

    if (action === 'suspend') {
      const d = Math.max(1, Math.min(Number(days) || 7, 3650));
      await query("UPDATE users SET suspended_until = now() + ($1 || ' days')::interval WHERE id = $2", [String(d), userId]);
      await logAction(admin.id, 'suspend', target.email, { days: d });
      return ok(`User suspended for ${d} days.`);
    }

    if (action === 'unsuspend') {
      await query('UPDATE users SET suspended_until = NULL WHERE id = $1', [userId]);
      await logAction(admin.id, 'unsuspend', target.email);
      return ok('User unsuspended.');
    }

    if (action === 'delete') {
      await query('DELETE FROM users WHERE id = $1', [userId]);
      await logAction(admin.id, 'delete_user', target.email);
      return ok('User deleted.');
    }

    return bad('Unknown action.');
  } catch (e) {
    console.error('admin users error:', e);
    return Response.json({ ok: false, error: 'Something went wrong.' }, { status: 500 });
  }
}

function ok(message) { return Response.json({ ok: true, message }); }
function bad(msg) { return Response.json({ ok: false, error: msg }, { status: 400 }); }
function forbid() { return Response.json({ ok: false, error: 'Forbidden.' }, { status: 403 }); }
