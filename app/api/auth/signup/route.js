import { query, queryOne } from '../../../../lib/db';
import { sendOtpEmail } from '../../../../lib/mailer';
import {
  hashPassword, generateOtp, hashOtp,
  isValidEmail, isDisposableEmail, isValidUsername, isStrongEnough,
} from '../../../../lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { email, username, password } = await req.json();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanUser = String(username || '').trim();

    // Validate.
    if (!isValidEmail(cleanEmail)) return bad('Please enter a valid email address.');
    if (isDisposableEmail(cleanEmail)) return bad('Temporary or disposable email addresses are not allowed. Please use a real email.');
    if (!isValidUsername(cleanUser)) return bad('Username must be 3-20 characters: letters, numbers, underscores, or hyphens.');
    if (!isStrongEnough(password)) return bad('Password must be at least 8 characters.');

    // Check duplicates.
    const existingEmail = await queryOne('SELECT id, email_verified FROM users WHERE email = $1', [cleanEmail]);
    if (existingEmail && existingEmail.email_verified) {
      return bad('An account with this email already exists. Try signing in instead.');
    }
    const existingUser = await queryOne('SELECT id FROM users WHERE username = $1', [cleanUser]);
    if (existingUser && (!existingEmail || existingUser.id !== existingEmail.id)) {
      return bad('That username is taken. Please choose another.');
    }

    const passwordHash = await hashPassword(password);

    // Create or update the unverified user.
    let userId;
    if (existingEmail && !existingEmail.email_verified) {
      // Re-signup on an unverified account: update details.
      await query(
        'UPDATE users SET username = $1, password_hash = $2, updated_at = now() WHERE id = $3',
        [cleanUser, passwordHash, existingEmail.id]
      );
      userId = existingEmail.id;
    } else {
      const created = await queryOne(
        'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id',
        [cleanEmail, cleanUser, passwordHash]
      );
      userId = created.id;
    }

    // Generate and store OTP (hashed), expire in 15 min.
    const code = generateOtp();
    await query('DELETE FROM verification_tokens WHERE identifier = $1 AND purpose = $2', [cleanEmail, 'signup']);
    await query(
      "INSERT INTO verification_tokens (identifier, token, purpose, expires) VALUES ($1, $2, 'signup', now() + interval '15 minutes')",
      [cleanEmail, hashOtp(code)]
    );

    await sendOtpEmail(cleanEmail, code, 'signup');

    return Response.json({ ok: true, message: 'Account created. Check your email for a confirmation code.' });
  } catch (e) {
    console.error('signup error:', e);
    return Response.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

function bad(msg) {
  return Response.json({ ok: false, error: msg }, { status: 400 });
}
