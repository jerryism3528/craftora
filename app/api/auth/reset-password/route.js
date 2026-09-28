import { query, queryOne } from '../../../../lib/db';
import { hashOtp, hashPassword, isValidEmail, isStrongEnough } from '../../../../lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { email, code, password } = await req.json();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanCode = String(code || '').trim();

    if (!isValidEmail(cleanEmail)) return bad('Invalid email.');
    if (!/^\d{6}$/.test(cleanCode)) return bad('Enter the 6-digit code from your email.');
    if (!isStrongEnough(password)) return bad('Password must be at least 8 characters.');

    const token = await queryOne(
      "SELECT id, token, expires FROM verification_tokens WHERE identifier = $1 AND purpose = 'reset' ORDER BY created_at DESC LIMIT 1",
      [cleanEmail]
    );
    if (!token) return bad('No reset code found. Please request a new one.');
    if (new Date(token.expires) < new Date()) {
      await query('DELETE FROM verification_tokens WHERE id = $1', [token.id]);
      return bad('This code has expired. Please request a new one.');
    }
    if (token.token !== hashOtp(cleanCode)) {
      return bad('That code is incorrect. Please check and try again.');
    }

    const newHash = await hashPassword(password);
    await query('UPDATE users SET password_hash = $1, updated_at = now() WHERE email = $2', [newHash, cleanEmail]);
    await query("DELETE FROM verification_tokens WHERE identifier = $1 AND purpose = 'reset'", [cleanEmail]);

    return Response.json({ ok: true, message: 'Password reset. You can now sign in with your new password.' });
  } catch (e) {
    console.error('reset-password error:', e);
    return Response.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

function bad(msg) { return Response.json({ ok: false, error: msg }, { status: 400 }); }
