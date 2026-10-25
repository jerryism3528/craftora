import crypto from 'crypto';

// n8n sends the shared secret in the X-Outreach-Key header.
export function outreachAuthorized(req) {
  const want = process.env.OUTREACH_SECRET || '';
  const got = req.headers.get('x-outreach-key') || '';
  if (want.length < 24 || got.length !== want.length) return false;
  return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want));
}
