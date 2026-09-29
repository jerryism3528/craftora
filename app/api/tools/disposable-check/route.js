import { auth } from '../../../../auth';
import { checkToolAccess, recordUsage } from '../../../../lib/limits';
import { query } from '../../../../lib/db';
import { isValidEmail } from '../../../../lib/auth-helpers';

export const dynamic = 'force-dynamic';

const TOOL = 'disposable-email-detector';
const BATCH_MAX = 100;

// Common role-account local parts (extra intel, not disposable).
const ROLE = new Set(['info', 'support', 'admin', 'sales', 'contact', 'help', 'billing', 'office', 'team', 'hello', 'noreply', 'no-reply', 'postmaster', 'webmaster', 'abuse']);

export async function POST(req) {
  const session = await auth();
  const userId = session?.user?.id || null;

  const access = await checkToolAccess(userId, TOOL);
  if (!access.allowed) {
    return Response.json({ ok: false, error: access.reason, needLogin: access.needLogin || false }, { status: access.needLogin ? 401 : 429 });
  }

  let emails;
  try {
    const body = await req.json();
    emails = Array.isArray(body.emails) ? body.emails : [];
  } catch (e) {
    return Response.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  emails = [...new Set(emails.map((e) => String(e || '').trim().toLowerCase()).filter(Boolean))].slice(0, BATCH_MAX);
  if (emails.length === 0) return Response.json({ ok: false, error: 'No emails provided.' }, { status: 400 });

  // Cap to remaining daily allowance.
  const allowedCount = access.remaining >= 999999 ? emails.length : Math.min(emails.length, access.remaining);
  const toCheck = emails.slice(0, allowedCount);

  // Unique domains to look up in one query.
  const domains = [...new Set(toCheck.map((e) => e.split('@')[1]).filter(Boolean))];
  let disposableSet = new Set();
  if (domains.length > 0) {
    const rows = await query('SELECT domain FROM disposable_domains WHERE domain = ANY($1)', [domains]);
    disposableSet = new Set(rows.map((r) => r.domain));
  }

  const results = toCheck.map((email) => {
    const valid = isValidEmail(email);
    const domain = email.split('@')[1] || '';
    const local = email.split('@')[0] || '';
    if (!valid) return { email, status: 'invalid', domain, disposable: false, role: false };
    const disposable = disposableSet.has(domain);
    const role = ROLE.has(local);
    return {
      email,
      status: disposable ? 'disposable' : 'safe',
      domain,
      disposable,
      role,
    };
  });

  // Count usage (each checked email).
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  await recordUsage(userId, ip, TOOL, toCheck.length);

  const remaining = access.remaining >= 999999 ? 999999 : Math.max(access.remaining - toCheck.length, 0);
  const skipped = emails.length - toCheck.length;

  return Response.json({ ok: true, results, remaining, skipped });
}
