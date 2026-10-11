import { currentUser } from '../../../../lib/current-user';
import { userBilling } from '../../../../lib/billing';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ ok: false, error: 'Please sign in first.', needLogin: true }, { status: 401 });
  return Response.json({ ok: true, email: user.email, ...(await userBilling(user.id)) });
}
