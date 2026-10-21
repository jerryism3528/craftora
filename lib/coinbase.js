import crypto from 'crypto';

// Coinbase Business Checkout API (USDC on Base). Docs: docs.cdp.coinbase.com/coinbase-business/checkout-apis
// env: COINBASE_API_KEY_ID, COINBASE_API_KEY_SECRET (Ed25519, base64), COINBASE_WEBHOOK_SECRET, COINBASE_MODE=sandbox|live
const HOST = 'business.coinbase.com';

export function coinbaseMode() {
  return process.env.COINBASE_MODE === 'live' ? 'live' : 'sandbox';
}

export function coinbaseConfigured() {
  return !!(process.env.COINBASE_API_KEY_ID && process.env.COINBASE_API_KEY_SECRET && process.env.COINBASE_WEBHOOK_SECRET);
}

function apiBase() {
  if (process.env.COINBASE_API_BASE) return process.env.COINBASE_API_BASE; // tests only
  return coinbaseMode() === 'live' ? `https://${HOST}/api/v1` : `https://${HOST}/sandbox/api/v1`;
}

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

// Bearer JWT signed with the Ed25519 API key secret (64 bytes: 32-byte seed + 32-byte public key).
export function coinbaseJwt(method, path) {
  const raw = Buffer.from(process.env.COINBASE_API_KEY_SECRET || '', 'base64');
  if (raw.length !== 64) throw new Error('COINBASE_API_KEY_SECRET must be the base64 Ed25519 secret (64 bytes).');
  const key = crypto.createPrivateKey({ key: { kty: 'OKP', crv: 'Ed25519', d: b64url(raw.subarray(0, 32)), x: b64url(raw.subarray(32)) }, format: 'jwk' });
  const now = Math.floor(Date.now() / 1000);
  const keyId = process.env.COINBASE_API_KEY_ID;
  const header = { alg: 'EdDSA', typ: 'JWT', kid: keyId, nonce: crypto.randomBytes(8).toString('hex') };
  const claims = { sub: keyId, iss: 'cdp', aud: ['cdp_service'], nbf: now, exp: now + 120, uri: `${method} ${HOST}${path}` };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;
  return `${unsigned}.${b64url(crypto.sign(null, Buffer.from(unsigned), key))}`;
}

export async function coinbase(method, path, body, { idempotencyKey } = {}) {
  const base = apiBase();
  const url = `${base}${path}`;
  const signedPath = new URL(url).pathname;
  const headers = { Authorization: `Bearer ${coinbaseJwt(method, signedPath)}`, 'Content-Type': 'application/json', Accept: 'application/json' };
  if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text.slice(0, 300) }; }
  if (!res.ok) {
    const e = new Error(`Coinbase ${method} ${path} ${res.status}: ${data?.errorMessage || data?.raw || 'error'}`);
    e.status = res.status;
    e.coinbase = data;
    throw e;
  }
  return data;
}

// Verify the X-Hook0-Signature header (t=..., h=..., v1=...). Rejects events older than 5 minutes.
export function verifyCoinbaseWebhook(rawBody, headers) {
  try {
    const secret = process.env.COINBASE_WEBHOOK_SECRET;
    const sig = headers.get('x-hook0-signature');
    if (!secret || !sig) return false;
    const parts = Object.fromEntries(sig.split(',').map((p) => { const i = p.indexOf('='); return [p.slice(0, i).trim(), p.slice(i + 1).trim()]; }));
    if (!parts.t || !parts.v1 || parts.h === undefined) return false;
    const names = parts.h ? parts.h.split(' ') : [];
    const values = names.map((n) => headers.get(n) || '').join('.');
    const expected = crypto.createHmac('sha256', secret).update(`${parts.t}.${parts.h}.${values}.${rawBody}`, 'utf8').digest('hex');
    const a = Buffer.from(expected, 'hex'), b = Buffer.from(parts.v1, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
    const age = Date.now() / 1000 - Number(parts.t);
    return age < 300 && age > -300;
  } catch {
    return false;
  }
}
