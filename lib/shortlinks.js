import crypto from 'crypto';

const D = 'craftora' + '.dev';
export const GO_BASE = 'https://go.' + D;
const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const RESERVED = new Set(['api', 'admin', 'login', 'signup', 'stats', 'links', 'my-links', 'help', 'about', 'terms', 'privacy', 'craftora', 'www', 'go', 'img', 'download', 'report']);

export function newCode(len = 6) {
  let s = '';
  for (const b of crypto.randomBytes(len)) s += ALPHABET[b % ALPHABET.length];
  return s;
}

export function normalizeUrl(input) {
  let s = String(input || '').trim();
  if (!s) return { error: 'Paste a link to shorten.' };
  if (s.length > 2048) return { error: 'That link is too long (max 2,048 characters).' };
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = 'https://' + s;
  let u;
  try { u = new URL(s); } catch (e) { return { error: 'That does not look like a valid link.' }; }
  if (!['http:', 'https:'].includes(u.protocol)) return { error: 'Only http and https links can be shortened.' };
  if (!u.hostname.includes('.')) return { error: 'That does not look like a valid website address.' };
  if (u.hostname.toLowerCase() === 'go.' + D) return { error: 'That is already a Craftora short link.' };
  return { url: u.toString() };
}

// Google Safe Browsing check. Fails open (allows) if the API is unreachable, but logs it.
export async function isUnsafe(url) {
  const key = process.env.SAFE_BROWSING_KEY;
  if (!key) return false;
  try {
    const res = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: { clientId: 'craftora', clientVersion: '1.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }],
        },
      }),
    });
    if (!res.ok) { console.error('safe browsing http', res.status); return false; }
    const data = await res.json();
    return Array.isArray(data.matches) && data.matches.length > 0;
  } catch (e) {
    console.error('safe browsing error', e.message);
    return false;
  }
}

export function parseAgent(ua = '') {
  const device = /ipad|tablet/i.test(ua) ? 'Tablet' : /mobi|android|iphone/i.test(ua) ? 'Mobile' : 'Desktop';
  const browser = /edg\//i.test(ua) ? 'Edge' : /opr\/|opera/i.test(ua) ? 'Opera' : /samsungbrowser/i.test(ua) ? 'Samsung Internet'
    : /chrome|crios/i.test(ua) ? 'Chrome' : /firefox|fxios/i.test(ua) ? 'Firefox' : /safari/i.test(ua) ? 'Safari' : 'Other';
  return { device, browser };
}

export function isBot(ua = '') {
  return /bot|crawl|spider|preview|facebookexternalhit|slack|whatsapp|telegram|discord|curl|wget|python/i.test(ua);
}
