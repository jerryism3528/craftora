import { auth } from '../../../../auth';
import { checkToolAccess, recordUsage } from '../../../../lib/limits';
import { isValidEmail } from '../../../../lib/auth-helpers';

export const dynamic = 'force-dynamic';

const TOOL = 'email-verifier';
const REACHER_URL = 'http://reacher:8080/v0/check_email';

// Map Reacher's raw response to a clean status + plain-English reason.
function mapResult(email, data) {
  const reachable = data?.is_reachable || 'unknown';
  const mx = data?.mx || {};
  const smtp = data?.smtp || {};
  const misc = data?.misc || {};
  const syntax = data?.syntax || {};

  let status = 'unknown';
  let reason = 'Could not verify this address.';

  if (!syntax.is_valid_syntax) {
    status = 'invalid';
    reason = 'Invalid email format.';
  } else if (!mx.accepts_mail) {
    status = 'invalid';
    reason = 'This domain cannot receive email.';
  } else if (reachable === 'safe') {
    status = 'safe';
    reason = 'Valid and deliverable.';
  } else if (reachable === 'invalid') {
    status = 'invalid';
    reason = smtp.is_deliverable === false ? 'Mailbox does not exist.' : 'Address is not valid.';
  } else if (reachable === 'risky') {
    status = 'risky';
    if (smtp.is_catch_all) reason = 'Catch-all domain (accepts all addresses, existence not guaranteed).';
    else if (misc.is_role_account) reason = 'Role account (like info@ or support@).';
    else if (smtp.has_full_inbox) reason = 'Mailbox is full.';
    else if (smtp.is_disabled) reason = 'Mailbox is disabled.';
    else reason = 'Risky, delivery is uncertain.';
  } else {
    status = 'unknown';
    reason = 'The mail server did not respond clearly. Try again later.';
  }

  // Extra flags for the UI.
  const flags = [];
  if (misc.is_disposable) flags.push('disposable');
  if (misc.is_role_account) flags.push('role');
  if (smtp.is_catch_all) flags.push('catch-all');

  const details = {
    validSyntax: !!syntax.is_valid_syntax,
    acceptsMail: !!mx.accepts_mail,
    deliverable: typeof smtp.is_deliverable === 'boolean' ? smtp.is_deliverable : null,
    catchAll: typeof smtp.is_catch_all === 'boolean' ? smtp.is_catch_all : null,
    disposable: typeof misc.is_disposable === 'boolean' ? misc.is_disposable : null,
    roleAccount: typeof misc.is_role_account === 'boolean' ? misc.is_role_account : null,
    fullInbox: typeof smtp.has_full_inbox === 'boolean' ? smtp.has_full_inbox : null,
    mxRecords: (mx.records || []).map((r) => String(r).replace(/\.$/, '')),
  };

  return { email, status, reason, flags, details };
}

export async function POST(req) {
  const session = await auth();
  const userId = session?.user?.id || null;

  // Access + limit check.
  const access = await checkToolAccess(userId, TOOL);
  if (!access.allowed) {
    return Response.json({ ok: false, error: access.reason, needLogin: access.needLogin || false }, { status: access.needLogin ? 401 : 429 });
  }

  let email;
  try {
    const body = await req.json();
    email = String(body.email || '').trim().toLowerCase();
  } catch (e) {
    return Response.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    // Invalid syntax: return a result without spending a real check or counting usage.
    return Response.json({ ok: true, result: { email, status: 'invalid', reason: 'Invalid email format.', flags: [] }, remaining: access.remaining });
  }

  // Call Reacher.
  let data;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    const res = await fetch(REACHER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_email: email,
        hello_name: 'craftora.dev',
        from_email: 'support@craftora.dev',
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    data = await res.json();
  } catch (e) {
    // Engine unreachable or timeout: return unknown, do NOT count against limit.
    return Response.json({ ok: true, result: { email, status: 'unknown', reason: 'The verification service is busy. Please try again.', flags: [] }, remaining: access.remaining });
  }

  const result = mapResult(email, data);

  // Only count real checks (not unknowns) against the daily limit.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  if (result.status !== 'unknown') {
    await recordUsage(userId, ip, TOOL, 1);
  }

  // Remaining after this check.
  const remaining = result.status !== 'unknown' ? Math.max(access.remaining - 1, 0) : access.remaining;

  return Response.json({ ok: true, result, remaining });
}
