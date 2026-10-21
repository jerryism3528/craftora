// Create the Coinbase checkout webhook and save its signing secret to .env (never printed).
// Run on the server from ~/craftora:  node scripts/coinbase-webhook.mjs
import crypto from 'crypto';
import fs from 'fs';

const ENV = '.env';
const env = Object.fromEntries(
  fs.readFileSync(ENV, 'utf8').split('\n').filter((l) => /^[A-Z0-9_]+=/.test(l)).map((l) => {
    const i = l.indexOf('=');
    return [l.slice(0, i), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
  })
);
const keyId = env.COINBASE_API_KEY_ID;
const raw = Buffer.from(env.COINBASE_API_KEY_SECRET || '', 'base64');
if (!keyId || raw.length !== 64) {
  console.error('COINBASE_API_KEY_ID / COINBASE_API_KEY_SECRET missing or wrong in .env (secret must be the base64 Ed25519 secret).');
  process.exit(1);
}
if (env.COINBASE_WEBHOOK_SECRET) {
  console.error('COINBASE_WEBHOOK_SECRET is already set in .env. Remove that line first if you want a new webhook.');
  process.exit(1);
}

const b64url = (b) => Buffer.from(b).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
const key = crypto.createPrivateKey({ key: { kty: 'OKP', crv: 'Ed25519', d: b64url(raw.subarray(0, 32)), x: b64url(raw.subarray(32)) }, format: 'jwk' });
const HOST = 'api.cdp.coinbase.com';
const PATH = '/platform/v2/data/webhooks/subscriptions';
const now = Math.floor(Date.now() / 1000);
const header = { alg: 'EdDSA', typ: 'JWT', kid: keyId, nonce: crypto.randomBytes(8).toString('hex') };
const claims = { sub: keyId, iss: 'cdp', aud: ['cdp_service'], nbf: now, exp: now + 120, uri: `POST ${HOST}${PATH}` };
const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;
const jwt = `${unsigned}.${b64url(crypto.sign(null, Buffer.from(unsigned), key))}`;

const sandbox = (env.COINBASE_MODE || 'sandbox') !== 'live';
const body = {
  description: `Craftora checkout ${sandbox ? 'sandbox' : 'live'}`,
  eventTypes: ['checkout.payment.success', 'checkout.payment.failed', 'checkout.payment.expired', 'checkout.refund.success', 'checkout.refund.failed'],
  target: { url: 'https://craftora.dev/api/coinbase/webhook', method: 'POST' },
  isEnabled: true,
  ...(sandbox ? { labels: { sandbox: 'true' } } : {}),
};

const res = await fetch(`https://${HOST}${PATH}`, { method: 'POST', headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const text = await res.text();
let data = {};
try { data = JSON.parse(text); } catch {}
if (!res.ok) {
  console.error(`Coinbase said ${res.status}: ${data.errorMessage || data.message || text.slice(0, 300)}`);
  process.exit(1);
}
const secret = data.metadata?.secret || data.secret;
if (!secret) {
  console.error('Webhook created but no secret was returned. Subscription id:', data.subscriptionId || data.id);
  process.exit(1);
}
fs.appendFileSync(ENV, `\nCOINBASE_WEBHOOK_SECRET=${secret}\n`);
console.log(`Webhook created (id ${data.subscriptionId || data.id}, ${sandbox ? 'sandbox' : 'live'}). Signing secret saved to .env.`);
