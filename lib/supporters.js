import { query } from './db';

// Group order on the wall. A tier lands in a group by its plan and duration.
export const GROUPS = [
  { key: 'sponsors', title: 'Sponsors', blurb: 'Companies that made Craftora possible.' },
  { key: 'business', title: 'Founding Business Backers', blurb: 'Lifetime Business backers.' },
  { key: 'pro', title: 'Founding Pro Backers', blurb: 'Lifetime Pro backers.' },
  { key: 'supporters', title: 'Supporters', blurb: 'Everyone who chipped in to keep Craftora free.' },
];


export function cleanName(s) {
  return String(s || '').replace(/<[^>]*>/g, '').replace(/[<>{}\[\]\\]/g, '').replace(/https?:\/\/\S+/gi, '').replace(/\s+/g, ' ').trim().slice(0, 40);
}

export function safeUrl(s) {
  try {
    const u = new URL(String(s || '').trim());
    return ['http:', 'https:'].includes(u.protocol) ? u.toString() : '';
  } catch { return ''; }
}

// Everyone shown on the public wall, from the wall_entries table managed in the admin portal.
export async function getWall() {
  const { photoUrl } = await import('./wall');
  let rows = [];
  try {
    rows = await query(`SELECT name, level, photo, url, created_at AS since FROM wall_entries
      WHERE visible ORDER BY pinned DESC, created_at, id`);
  } catch (e) {
    console.error('supporters wall:', e.message);
  }
  const map = { sponsor: 'sponsors', business: 'business', pro: 'pro', supporter: 'supporters' };
  const groups = Object.fromEntries(GROUPS.map((g) => [g.key, []]));
  for (const r of rows) {
    const name = cleanName(r.name);
    if (!name) continue;
    groups[map[r.level] || 'supporters'].push({ name, since: r.since, url: safeUrl(r.url), photo: photoUrl(r.photo), logo: photoUrl(r.photo) });
  }
  const total = Object.values(groups).reduce((n, g) => n + g.length, 0);
  return { groups, total };
}
