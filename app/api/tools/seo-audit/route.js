import { auditPage, validateStartUrl } from '../../../../lib/seo-audit';
import { getTool } from '../../../../lib/tools';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const PER_HOUR = 10;
const MAX_ACTIVE = 5;
const hits = new Map();
let active = 0;

function clientIp(req) {
  const xff = req.headers.get('x-forwarded-for') || '';
  return xff.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request.' }, 400); }

  try { await validateStartUrl(body?.url); } catch (e) { return json({ error: e.message }, 400); }

  const ip = clientIp(req);
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 3600000);
  hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < 3600000)) hits.delete(k);
  if (list.length >= PER_HOUR) {
    const mins = Math.ceil((3600000 - (now - list[0])) / 60000);
    return json({ error: `You have used your ${PER_HOUR} free audits for this hour. Try again in about ${mins} minutes.` }, 429);
  }
  if (active >= MAX_ACTIVE) return json({ error: 'The auditor is busy right now. Please try again in a minute.' }, 503);

  list.push(now);
  active++;
  try {
    const report = await auditPage(body.url, { keyword: body.keyword || '' });
    for (const c of report.checks) {
      c.tools = (c.tools || []).map((slug) => getTool(slug)).filter((t) => t && t.status === 'live').map((t) => ({ slug: t.slug, name: t.name }));
    }
    report.remaining = PER_HOUR - list.length;
    return json(report);
  } catch (e) {
    return json({ error: e.message || 'The audit failed. Please try again.' }, 400);
  } finally {
    active--;
  }
}
