import { auth } from '../../../../auth';
import { query } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) {
    return Response.json({ ok: false, error: 'Forbidden.' }, { status: 403 });
  }

  const logs = await query(`
    SELECT ul.tool_slug, ul.amount, ul.ip, ul.created_at, u.email
    FROM usage_log ul
    LEFT JOIN users u ON u.id = ul.user_id
    ORDER BY ul.created_at DESC
    LIMIT 200
  `);

  return Response.json({ ok: true, logs });
}
