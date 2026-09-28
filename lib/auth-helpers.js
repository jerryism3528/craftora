import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// ---- Password hashing ----
export async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}
export async function verifyPassword(plain, hash) {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

// ---- OTP codes ----
export function generateOtp() {
  // 6-digit numeric code.
  return String(crypto.randomInt(100000, 1000000));
}
export function hashOtp(code) {
  // Store a hash of the OTP, never the raw code.
  return crypto.createHash('sha256').update(code).digest('hex');
}

// ---- Email validation ----
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// A compact but strong list of disposable/temp email domains.
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
  'sharklasers.com', 'grr.la', 'spam4.me', 'temp-mail.org', 'tempmail.com',
  'tempmailo.com', 'temp-mail.io', 'tmpmail.org', 'tmpmail.net', 'throwawaymail.com',
  '10minutemail.com', '10minutemail.net', '20minutemail.com', 'trashmail.com',
  'trashmail.net', 'yopmail.com', 'yopmail.net', 'getnada.com', 'nada.email',
  'maildrop.cc', 'dispostable.com', 'fakeinbox.com', 'mailnesia.com', 'mytemp.email',
  'mohmal.com', 'emailondeck.com', 'moakt.com', 'tempr.email', 'discard.email',
  'mailcatch.com', 'inboxkitten.com', 'burnermail.io', 'mailtemp.net', 'tempmailaddress.com',
  'fakemail.net', 'spambog.com', 'mailexpire.com', 'jetable.org', 'spamgourmet.com',
  'incognitomail.com', 'meltmail.com', 'mailnull.com', 'e4ward.com', 'trbvm.com',
  'onemail.host', 'tempinbox.com', 'wegwerfmail.de', 'einrot.com', 'harakirimail.com',
]);

export function isDisposableEmail(email) {
  const domain = String(email).toLowerCase().split('@')[1] || '';
  return DISPOSABLE.has(domain);
}

// ---- Username validation ----
export function isValidUsername(name) {
  // 3-20 chars, letters, numbers, underscores, hyphens.
  return /^[a-zA-Z0-9_-]{3,20}$/.test(name);
}

// ---- Password strength (server-side minimum) ----
export function isStrongEnough(pw) {
  return typeof pw === 'string' && pw.length >= 8;
}
