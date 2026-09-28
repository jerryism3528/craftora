import { query, queryOne } from '../../../../lib/db';
import { hashOtp, isValidEmail } from '../../../../lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { email, code } = await req.json();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanCode = String(code || '').trim();

    if (!isValidEmail(cleanEmail)) return bad('Invalid email.');
    if (!/^\d{6}$/.test(cleanCode)) return bad('Enter the 6-digit code from your email.');

    // Find a valid, unexpired signup token.
    const token = await queryOne(
      "SELECT id, token, expires FROM verification_tokens WHERE identifier = $1 AND purpose = 'signup' ORDER BY created_at DESC LIMIT 1",
      [cleanEmail]
    );

    if (!token) return bad('No confirmation code found. Please sign up again.');
    if (new Date(token.expires) < new Date()) {
      await query('DELETE FROM verification_tokens WHERE id = $1', [token.id]);
      return bad('This code has expired. Please request a new one.');
    }
    if (token.token !== hashOtp(cleanCode)) {
      return bad('That code is incorrect. Please check and try again.');
    }

    // Mark the user verified and clean up the token.
    await query('UPDATE users SET email_verified = now(), updated_at = now() WHERE email = $1', [cleanEmail]);
    await query("DELETE FROM verification_tokens WHERE identifier = $1 AND purpose = 'signup'", [cleanEmail]);

    return Response.json({ ok: true, message: 'Email confirmed. You can now sign in.' });
  } catch (e) {
    console.error('verify-otp error:', e);
    return Response.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

function bad(msg) {
  return Response.json({ ok: false, error: msg }, { status: 400 });
}
