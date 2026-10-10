import { query } from './db';

// Group order on the wall. A tier lands in a group by its plan and duration.
export const GROUPS = [
  { key: 'sponsors', title: 'Sponsors', blurb: 'Companies that made Craftora possible.' },
  { key: 'business', title: 'Founding Business Backers', blurb: 'Lifetime Business backers.' },
  { key: 'pro', title: 'Founding Pro Backers', blurb: 'Lifetime Pro backers.' },
  { key: 'supporters', title: 'Supporters', blurb: 'Everyone who chipped in to keep Craftora free.' },
];

function groupFor(tier) {
  if (!tier) return 'supporters';
  if (tier.key === 'sponsor') return 'sponsors';
  if (tier.plan === 'business' && !tier.months) return 'business';
  if (tier.plan === 'pro' && !tier.months) return 'pro';
  return 'supporters';
}

export function cleanName(s) {
  return String(s || '').replace(/<[^>]*>/g, '').replace(/[<>{}\[\]\\]/g, '').replace(/https?:\/\/\S+/gi, '').replace(/\s+/g, ' ').trim().slice(0, 40);
}

export function safeUrl(s) {
  try {
    const u = new URL(String(s || '').trim());
    return ['http:', 'https:'].includes(u.protocol) ? u.toString() : '';
  } catch { return ''; }
}

// Everyone shown on the public wall: supporters with accounts, plus imported backers who have not signed up yet.
export async function getWall() {
  let tiers = [], users = [], grants = [];
  try {
    [tiers, users, grants] = await Promise.all([
      query('SELECT key, name, plan, months FROM reward_tiers'),
      query(`SELECT COALESCE(NULLIF(supporter_name, ''), username) AS name, reward_tier, sponsor_url, sponsor_logo, COALESCE(supporter_since, created_at) AS since
        FROM users WHERE is_supporter AND show_on_wall ORDER BY COALESCE(supporter_since, created_at), id`),
      query(`SELECT supporter_name AS name, tier AS reward_tier, created_at AS since FROM plan_grants
        WHERE claimed_at IS NULL AND supporter AND COALESCE(supporter_name, '') <> '' ORDER BY created_at, id`),
    ]);
  } catch (e) {
    console.error('supporters wall:', e.message);
  }
  const byKey = Object.fromEntries(tiers.map((t) => [t.key, t]));
  const groups = Object.fromEntries(GROUPS.map((g) => [g.key, []]));
  for (const r of [...users, ...grants]) {
    const name = cleanName(r.name);
    if (!name) continue;
    const tier = byKey[r.reward_tier];
    groups[groupFor(tier)].push({
      name,
      tier: tier?.name || 'Supporter',
      since: r.since,
      url: safeUrl(r.sponsor_url),
      logo: safeUrl(r.sponsor_logo) || (String(r.sponsor_logo || '').startsWith('/') ? r.sponsor_logo : ''),
    });
  }
  const total = Object.values(groups).reduce((s, g) => s + g.length, 0);
  return { groups, total };
}
