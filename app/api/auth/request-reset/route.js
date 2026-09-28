import { query, queryOne } from '../../../../lib/db';
import { sendOtpEmail } from '../../../../lib/mailer';
import { generateOtp, hashOtp, isValidEmail } from '../../../../lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { email } = await req.json();
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) return bad('Please enter a valid email address.');

    // Always return success (do not reveal whether an account exists).
    const user = await queryOne('SELECT id, password_hash FROM users WHERE email = $1 AND email_verified IS NOT NULL', [cleanEmail]);

    // Only actually send if the account exists and has a password (not Google-only).
    if (user && user.password_hash) {
      const code = generateOtp();
      await query("DELETE FROM verification_tokens WHERE identifier = $1 AND purpose = 'reset'", [cleanEmail]);
      await query(
        "INSERT INTO verification_tokens (identifier, token, purpose, expires) VALUES ($1, $2, 'reset', now() + interval '15 minutes')",
        [cleanEmail, hashOtp(code)]
      );
      await sendOtpEmail(cleanEmail, code, 'reset');
    }

    return Response.json({ ok: true, message: 'If an account exists for that email, a reset code has been sent.' });
  } catch (e) {
    console.error('request-reset error:', e);
    return Response.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

function bad(msg) { return Response.json({ ok: false, error: msg }, { status: 400 }); }
