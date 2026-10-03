// Simple in-memory per-IP rate limiting for no-login tools.
const buckets = new Map();

export function hit(key, limit, windowMs) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now > b.reset) {
    b = { count: 0, reset: now + windowMs };
    buckets.set(key, b);
  }
  b.count++;
  if (buckets.size > 20000) {
    for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k);
  }
  return { ok: b.count <= limit, retryMin: Math.max(1, Math.ceil((b.reset - now) / 60000)) };
}

export function ipOf(req) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
