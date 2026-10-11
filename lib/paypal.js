// Minimal PayPal REST client (server only). Keys come from .env and are never sent to the browser.

export function paypalMode() {
  return process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox';
}

export function paypalConfigured() {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

function apiBase() {
  if (process.env.PAYPAL_API_BASE) return process.env.PAYPAL_API_BASE.replace(/\/$/, '');
  return paypalMode() === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

const g = globalThis;

async function accessToken() {
  const c = g.__craftoraPaypalToken;
  if (c && c.mode === paypalMode() && c.exp > Date.now() + 60_000) return c.token;
  const basic = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) throw new Error(`PayPal login failed (${res.status}). Check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.`);
  g.__craftoraPaypalToken = { token: data.access_token, exp: Date.now() + (Number(data.expires_in) || 300) * 1000, mode: paypalMode() };
  return data.access_token;
}

// Call the PayPal API. Throws an Error with PayPal's message on failure.
export async function paypal(method, path, body, { requestId, rawBody } = {}) {
  const token = await accessToken();
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
  if (requestId) headers['PayPal-Request-Id'] = requestId;
  const res = await fetch(`${apiBase()}${path}`, {
    method,
    headers,
    body: rawBody !== undefined ? rawBody : body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (res.status === 204) return {};
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data?.details?.[0]?.description || data?.message || data?.error_description || `HTTP ${res.status}`;
    const err = new Error(`PayPal: ${detail}`);
    err.status = res.status;
    err.paypal = data;
    throw err;
  }
  return data;
}

// Check that a webhook really came from PayPal. The raw body is passed through untouched.
export async function verifyWebhook(headers, rawBody) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;
  const h = (n) => headers.get(n) || '';
  if (!h('paypal-transmission-id') || !h('paypal-transmission-sig')) return false;
  const body = `{"auth_algo":${JSON.stringify(h('paypal-auth-algo'))},"cert_url":${JSON.stringify(h('paypal-cert-url'))},"transmission_id":${JSON.stringify(h('paypal-transmission-id'))},"transmission_sig":${JSON.stringify(h('paypal-transmission-sig'))},"transmission_time":${JSON.stringify(h('paypal-transmission-time'))},"webhook_id":${JSON.stringify(webhookId)},"webhook_event":${rawBody}}`;
  try {
    const r = await paypal('POST', '/v1/notifications/verify-webhook-signature', null, { rawBody: body });
    return r.verification_status === 'SUCCESS';
  } catch (e) {
    console.error('webhook verify failed:', e.message);
    return false;
  }
}
