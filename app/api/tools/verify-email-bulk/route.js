import { auth } from '../../../../auth';
import { checkToolAccess, recordUsage } from '../../../../lib/limits';
import { isValidEmail } from '../../../../lib/auth-helpers';

export const dynamic = 'force-dynamic';

const TOOL = 'bulk-email-verifier';
const REACHER_URL = 'http://reacher:8080/v0/check_email';
const BATCH_MAX = 25;

function mapResult(email, data) {
  const reachable = data?.is_reachable || 'unknown';
  const mx = data?.mx || {};
  const smtp = data?.smtp || {};
  const misc = data?.misc || {};
  const syntax = data?.syntax || {};

  let status = 'unknown';
  let reason = 'Could not verify this address.';

  if (!syntax.is_valid_syntax) { status = 'invalid'; reason = 'Invalid email format.'; }
  else if (!mx.accepts_mail) { status = 'invalid'; reason = 'This domain cannot receive email.'; }
  else if (reachable === 'safe') { status = 'safe'; reason = 'Valid and deliverable.'; }
  else if (reachable === 'invalid') { status = 'invalid'; reason = smtp.is_deliverable === false ? 'Mailbox does not exist.' : 'Address is not valid.'; }
  else if (reachable === 'risky') {
    status = 'risky';
    if (smtp.is_catch_all) reason = 'Catch-all domain.';
    else if (misc.is_role_account) reason = 'Role account.';
    else if (smtp.has_full_inbox) reason = 'Mailbox is full.';
    else if (smtp.is_disabled) reason = 'Mailbox is disabled.';
    else reason = 'Risky, delivery uncertain.';
  } else { status = 'unknown'; reason = 'Mail server did not respond clearly.'; }

  const flags = [];
  if (misc.is_disposable) flags.push('disposable');
  if (misc.is_role_account) flags.push('role');
  if (smtp.is_catch_all) flags.push('catch-all');

  return { email, status, reason, flags };
}

async function verifyOne(email) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    const res = await fetch(REACHER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_email: email, hello_name: 'craftora.dev', from_email: 'support@craftora.dev' }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const data = await res.json();
    return mapResult(email, data);
  } catch (e) {
    return { email, status: 'unknown', reason: 'The verification service is busy.', flags: [] };
  }
}

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

  // Clean, dedupe, cap to batch size.
  emails = [...new Set(emails.map((e) => String(e || '').trim().toLowerCase()).filter(Boolean))].slice(0, BATCH_MAX);
  if (emails.length === 0) return Response.json({ ok: false, error: 'No valid emails in this batch.' }, { status: 400 });

  // Do not exceed the remaining daily allowance.
  const allowedCount = access.remaining >= 999999 ? emails.length : Math.min(emails.length, access.remaining);
  const toCheck = emails.slice(0, allowedCount);

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  const results = [];
  let counted = 0;

  for (const email of toCheck) {
    if (!isValidEmail(email)) {
      results.push({ email, status: 'invalid', reason: 'Invalid email format.', flags: [] });
      continue;
    }
    const r = await verifyOne(email);
    results.push(r);
    if (r.status !== 'unknown') {
      await recordUsage(userId, ip, TOOL, 1);
      counted++;
    }
  }

  const remaining = access.remaining >= 999999 ? 999999 : Math.max(access.remaining - counted, 0);
  const skipped = emails.length - toCheck.length;

  return Response.json({ ok: true, results, remaining, skipped });
}
