// Cold email outreach. n8n calls the tick endpoint every few minutes and forwards new emails from the
// four inboxes. All the decisions (who gets which email, when, and when to stop) live here.
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import MailComposer from 'nodemailer/lib/mail-composer';
import { ImapFlow } from 'imapflow';
import { query, queryOne } from './db';
import { notify } from './billing';

export const SITE = 'https://craftora.dev';

// ---------- time zones ----------
const US = {
  America_New_York: 'CT DE DC FL GA IN KY ME MD MA MI NH NJ NY NC OH PA RI SC VT VA WV Connecticut Delaware Florida Georgia Indiana Kentucky Maine Maryland Massachusetts Michigan New_Hampshire New_Jersey New_York North_Carolina Ohio Pennsylvania Rhode_Island South_Carolina Vermont Virginia West_Virginia District_of_Columbia Washington_DC',
  America_Chicago: 'AL AR IL IA KS LA MN MS MO NE ND OK SD TN TX WI Alabama Arkansas Illinois Iowa Kansas Louisiana Minnesota Mississippi Missouri Nebraska North_Dakota Oklahoma South_Dakota Tennessee Texas Wisconsin',
  America_Denver: 'CO MT NM UT WY ID Colorado Montana New_Mexico Utah Wyoming Idaho',
  America_Phoenix: 'AZ Arizona',
  America_Los_Angeles: 'CA NV OR WA California Nevada Oregon Washington',
  America_Anchorage: 'AK Alaska',
  Pacific_Honolulu: 'HI Hawaii',
};
const CA = {
  America_Toronto: 'ON QC Ontario Quebec',
  America_Vancouver: 'BC British_Columbia',
  America_Edmonton: 'AB Alberta',
  America_Winnipeg: 'MB Manitoba',
  America_Regina: 'SK Saskatchewan',
  America_Halifax: 'NS NB PE Nova_Scotia New_Brunswick Prince_Edward_Island',
  America_St_Johns: 'NL Newfoundland Newfoundland_and_Labrador',
};
const AU = {
  Australia_Sydney: 'NSW ACT New_South_Wales Australian_Capital_Territory',
  Australia_Melbourne: 'VIC Victoria',
  Australia_Brisbane: 'QLD Queensland',
  Australia_Adelaide: 'SA South_Australia',
  Australia_Perth: 'WA Western_Australia',
  Australia_Hobart: 'TAS Tasmania',
  Australia_Darwin: 'NT Northern_Territory',
};
const COUNTRY_TZ = {
  'united states': 'America/New_York', usa: 'America/New_York', us: 'America/New_York',
  canada: 'America/Toronto', australia: 'Australia/Sydney',
  'united kingdom': 'Europe/London', uk: 'Europe/London', england: 'Europe/London', scotland: 'Europe/London', wales: 'Europe/London',
  ireland: 'Europe/Dublin', germany: 'Europe/Berlin', france: 'Europe/Paris', spain: 'Europe/Madrid', italy: 'Europe/Rome',
  netherlands: 'Europe/Amsterdam', belgium: 'Europe/Brussels', switzerland: 'Europe/Zurich', austria: 'Europe/Vienna',
  sweden: 'Europe/Stockholm', norway: 'Europe/Oslo', denmark: 'Europe/Copenhagen', finland: 'Europe/Helsinki', poland: 'Europe/Warsaw',
  portugal: 'Europe/Lisbon', 'new zealand': 'Pacific/Auckland', singapore: 'Asia/Singapore', india: 'Asia/Kolkata',
  'united arab emirates': 'Asia/Dubai', uae: 'Asia/Dubai', 'hong kong': 'Asia/Hong_Kong', japan: 'Asia/Tokyo', malaysia: 'Asia/Kuala_Lumpur',
  philippines: 'Asia/Manila', 'south africa': 'Africa/Johannesburg', pakistan: 'Asia/Karachi', 'saudi arabia': 'Asia/Riyadh',
};
function lookup(map, state) {
  const s = String(state || '').trim().replace(/\s+/g, '_').toLowerCase();
  if (!s) return null;
  for (const [tz, list] of Object.entries(map)) {
    if (list.split(' ').some((x) => x.toLowerCase() === s)) return tz.replace('_', '/');
  }
  return null;
}
export function tzFor(country, state) {
  const c = String(country || '').trim().toLowerCase();
  if (c === 'united states' || c === 'usa' || c === 'us') return lookup(US, state) || COUNTRY_TZ[c];
  if (c === 'canada') return lookup(CA, state) || COUNTRY_TZ[c];
  if (c === 'australia') return lookup(AU, state) || COUNTRY_TZ[c];
  return COUNTRY_TZ[c] || 'America/New_York';
}

function localNow(tz, d = new Date()) {
  try {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23', weekday: 'short' }).formatToParts(d).map((p) => [p.type, p.value]));
    return { hour: Number(parts.hour), weekday: parts.weekday };
  } catch { return { hour: d.getUTCHours(), weekday: 'Mon' }; }
}
export function inWindow(tz, s, d = new Date()) {
  const { hour, weekday } = localNow(tz, d);
  if (s.weekdays_only && (weekday === 'Sat' || weekday === 'Sun')) return false;
  return hour >= s.window_start && hour < s.window_end;
}

// ---------- templates ----------
export function render(text, lead, seg) {
  const first = (lead.first_name || '').trim() || 'there';
  const vals = {
    first_name: first,
    last_name: lead.last_name || '',
    company: (lead.company || '').trim() || 'your team',
    code: seg.promo_code || '',
    tools_link: `${SITE}/p/${lead.token}`,
    pricing_link: `${SITE}/p/${lead.token}/pricing`,
  };
  return String(text || '').replace(/\{(\w+)\}/g, (m, k) => (k in vals ? vals[k] : m));
}

// ---------- sending ----------
const transports = {};
export function passwordFor(segKey) {
  return process.env[`OUTREACH_PASS_${String(segKey).toUpperCase()}`] || '';
}
function transportFor(seg) {
  const pass = passwordFor(seg.key);
  if (!pass) throw new Error(`OUTREACH_PASS_${seg.key.toUpperCase()} is not set in .env`);
  const k = `${seg.inbox_email}:${pass.length}`;
  if (!transports[k]) {
    transports[k] = nodemailer.createTransport({
      host: process.env.OUTREACH_SMTP_HOST || 'smtp.hostinger.com',
      port: Number(process.env.OUTREACH_SMTP_PORT || 465),
      secure: String(process.env.OUTREACH_SMTP_PORT || 465) === '465',
      auth: { user: seg.inbox_email, pass },
    });
  }
  return transports[k];
}

// Build the message once, send it, then put the same message in the inbox's Sent folder
// so Maria sees every automated email in Hostinger Mail.
async function sendMail(seg, { to, subject, text, inReplyTo }) {
  const domain = seg.inbox_email.split('@')[1];
  const messageId = `<${crypto.randomUUID()}@${domain}>`;
  const raw = await new MailComposer({
    from: { name: seg.from_name || 'Maria V.', address: seg.inbox_email },
    to,
    subject,
    text,
    messageId,
    date: new Date(),
    inReplyTo: inReplyTo || undefined,
    references: inReplyTo || undefined,
    headers: { 'List-Unsubscribe': `<mailto:${seg.inbox_email}?subject=unsubscribe>` },
  }).compile().build();
  await transportFor(seg).sendMail({ envelope: { from: seg.inbox_email, to: [to] }, raw });
  await copyToSent(seg, raw);
  return messageId;
}

const sentFolders = {};
async function copyToSent(seg, raw) {
  if (process.env.OUTREACH_SENT_COPY === 'off') return;
  const pass = passwordFor(seg.key);
  const client = new ImapFlow({
    host: process.env.OUTREACH_IMAP_HOST || 'imap.hostinger.com',
    port: Number(process.env.OUTREACH_IMAP_PORT || 993),
    secure: String(process.env.OUTREACH_IMAP_PORT || 993) === '993',
    auth: { user: seg.inbox_email, pass },
    logger: false,
    socketTimeout: 30000,
  });
  try {
    await client.connect();
    let path = sentFolders[seg.inbox_email];
    if (!path) {
      const boxes = await client.list();
      const box = boxes.find((b) => b.specialUse === '\\Sent')
        || boxes.find((b) => /^(inbox[./])?sent( items| messages| mail)?$/i.test(b.path));
      path = box?.path || 'Sent';
      sentFolders[seg.inbox_email] = path;
    }
    await client.append(path, raw, ['\\Seen']);
  } catch (e) {
    // The email itself was sent; only the copy failed. Note it and carry on.
    await event(null, 'warn', null, `Could not save a copy to Sent for ${seg.inbox_email}: ${e.message}`).catch(() => {});
  } finally {
    await client.logout().catch(() => {});
  }
}

export async function settings() {
  return (await queryOne('SELECT * FROM outreach_settings WHERE id = 1')) || { paused: true, window_start: 9, window_end: 11, weekdays_only: true, gap_min: 6, gap_max: 14 };
}

const REACHER_URL = process.env.REACHER_URL || 'http://reacher:8080/v0/check_email';
export async function verifyEmail(email) {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 45000);
    const res = await fetch(REACHER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_email: email, hello_name: 'craftora.dev', from_email: 'support@craftora.dev' }),
      signal: controller.signal,
    });
    clearTimeout(t);
    const d = await res.json();
    return d?.is_reachable || 'unknown';
  } catch { return 'error'; }
}

async function event(lead, type, step, detail, body) {
  await query('INSERT INTO outreach_events (lead_id, segment, type, step, detail, body) VALUES ($1, $2, $3, $4, $5, $6)', [lead?.id || null, lead?.segment || null, type, step ?? null, detail ? String(detail).slice(0, 2000) : null, body ? String(body).slice(0, 10000) : null]);
}

async function suppressed(email) {
  const domain = email.split('@')[1] || '';
  const s = await queryOne('SELECT value FROM outreach_suppress WHERE value = $1 OR value = $2 LIMIT 1', [email, domain]);
  if (s) return 'on the do-not-contact list';
  const u = await queryOne('SELECT 1 FROM users WHERE lower(email) = $1', [email]);
  if (u) return 'already a Craftora user';
  return null;
}

async function stop(lead, status, reason) {
  await query('UPDATE outreach_leads SET status = $2, stop_reason = $3 WHERE id = $1', [lead.id, status, reason || null]);
}

// Leads that are due for their next email, best first. Follow-ups go before new people.
async function candidates(seg, templates) {
  const steps = templates.map((t) => t.step).sort((a, b) => a - b);
  const follow = [];
  for (const t of templates.filter((x) => x.step > 1)) {
    const rows = await query(
      `SELECT * FROM outreach_leads
        WHERE segment = $1 AND status = 'active' AND step = $2
          AND first_sent_at <= now() - make_interval(days => $3) AND last_sent_at <= now() - interval '20 hours'
        ORDER BY first_sent_at LIMIT 40`,
      [seg.key, t.step - 1, t.delay_days]
    );
    follow.push(...rows);
  }
  const fresh = steps.includes(1)
    ? await query("SELECT * FROM outreach_leads WHERE segment = $1 AND status = 'new' ORDER BY id LIMIT 60", [seg.key])
    : [];
  return { follow, fresh };
}

// One step of the sender: at most one email per active inbox, spaced out with a random gap.
export async function tick({ dryRun = false } = {}) {
  const got = await queryOne("UPDATE outreach_settings SET lock_until = now() + interval '3 minutes' WHERE id = 1 AND (lock_until IS NULL OR lock_until < now()) RETURNING id");
  if (!got) return { ok: true, skipped: 'another run is in progress' };
  const out = [];
  try {
    const s = await settings();
    if (s.paused) return { ok: true, paused: true };
    const segs = await query('SELECT * FROM outreach_segments WHERE active ORDER BY sort');
    for (const seg of segs) {
      if (seg.next_send_at && new Date(seg.next_send_at) > new Date()) { out.push({ segment: seg.key, wait: seg.next_send_at }); continue; }
      const sent = await queryOne("SELECT count(*)::int AS n FROM outreach_events WHERE segment = $1 AND type = 'sent' AND created_at > now() - interval '24 hours'", [seg.key]);
      if ((sent?.n || 0) >= seg.daily_cap) { out.push({ segment: seg.key, capped: seg.daily_cap }); continue; }
      const templates = await query('SELECT * FROM outreach_templates WHERE segment = $1 ORDER BY step', [seg.key]);
      if (!templates.length) { out.push({ segment: seg.key, error: 'no templates' }); continue; }
      const { follow, fresh } = await candidates(seg, templates);
      let lead = follow.find((l) => inWindow(l.tz, s));
      let verifications = 0;
      if (!lead) {
        for (const l of fresh) {
          if (!inWindow(l.tz, s)) continue;
          const why = await suppressed(l.email);
          if (why) { await stop(l, 'skipped', why); await event(l, 'skip', 0, why); continue; }
          if (l.verify !== 'safe') {
            if (verifications >= 3) break;
            verifications++;
            const v = await verifyEmail(l.email);
            await query('UPDATE outreach_leads SET verify = $2 WHERE id = $1', [l.id, v]);
            if (v === 'error' || v === 'unknown') { await event(l, 'verify', 0, `could not verify (${v}), will retry`); continue; }
            if (v !== 'safe') { await stop(l, 'skipped', `email check: ${v}`); await event(l, 'skip', 0, `email check: ${v}`); continue; }
          }
          lead = l;
          break;
        }
      }
      if (!lead) { out.push({ segment: seg.key, nothing_due: true }); continue; }
      const step = lead.step + 1;
      const tpl = templates.find((t) => t.step === step);
      const subject = step === 1 || !lead.subject ? render(tpl.subject, lead, seg) : `Re: ${lead.subject}`;
      const text = render(tpl.body, lead, seg);
      if (dryRun) { out.push({ segment: seg.key, would_send: lead.email, step, subject }); continue; }
      try {
        const messageId = await sendMail(seg, { to: lead.email, subject, text, inReplyTo: step > 1 ? lead.message_id : null });
        const last = !templates.some((t) => t.step > step);
        await query(
          `UPDATE outreach_leads SET step = $2, status = $3, last_sent_at = now(), first_sent_at = COALESCE(first_sent_at, now()),
             message_id = COALESCE(message_id, $4), subject = COALESCE(subject, $5) WHERE id = $1`,
          [lead.id, step, last ? 'done' : 'active', messageId, subject]
        );
        await event(lead, 'sent', step, subject, text);
        const gap = s.gap_min + Math.random() * Math.max(0, s.gap_max - s.gap_min);
        await query("UPDATE outreach_segments SET last_sent_at = now(), next_send_at = now() + make_interval(secs => $2) WHERE key = $1", [seg.key, Math.round(gap * 60)]);
        out.push({ segment: seg.key, sent: lead.email, step });
      } catch (e) {
        const msg = e?.message || String(e);
        const permanent = Number(e?.responseCode) >= 550 && Number(e?.responseCode) < 560;
        if (permanent && /recipient|mailbox|user|address/i.test(msg)) {
          // The address does not exist: stop this person, keep the inbox going.
          await stop(lead, 'bounced', msg.slice(0, 200));
          await query('INSERT INTO outreach_suppress (value, reason) VALUES ($1, $2) ON CONFLICT DO NOTHING', [lead.email, 'bounced']);
          await event(lead, 'bounce', step, msg);
          out.push({ segment: seg.key, bounced: lead.email });
          continue;
        }
        await event(lead, 'error', step, msg);
        await query("UPDATE outreach_segments SET next_send_at = now() + interval '30 minutes' WHERE key = $1", [seg.key]);
        const recent = await queryOne("SELECT count(*)::int AS n FROM outreach_events WHERE segment = $1 AND type = 'error' AND created_at > now() - interval '6 hours'", [seg.key]);
        if ((recent?.n || 0) === 1) await notify('outreach', `Outreach email failed (${seg.name})`, `${seg.inbox_email}: ${msg.slice(0, 300)}`);
        out.push({ segment: seg.key, error: msg.slice(0, 200) });
      }
    }
    return { ok: true, results: out };
  } finally {
    await query('UPDATE outreach_settings SET lock_until = NULL WHERE id = 1').catch(() => {});
  }
}

export async function sendTest(segKey, step, to) {
  const seg = await queryOne('SELECT * FROM outreach_segments WHERE key = $1', [segKey]);
  if (!seg) throw new Error('Unknown segment');
  const tpl = await queryOne('SELECT * FROM outreach_templates WHERE segment = $1 AND step = $2', [segKey, step]);
  if (!tpl) throw new Error('No template for that step');
  const sample = { first_name: 'Alex', last_name: 'Sample', company: 'Sample & Partners', token: 'test00', segment: segKey };
  const subject = `[Test] ${step === 1 ? render(tpl.subject, sample, seg) : `Re: ${render((await queryOne('SELECT subject FROM outreach_templates WHERE segment = $1 AND step = 1', [segKey]))?.subject || '', sample, seg)}`}`;
  await sendMail(seg, { to, subject, text: render(tpl.body, sample, seg) });
  await event(null, 'test', step, `${segKey} to ${to}`);
  return { subject };
}

// ---------- inbound mail (forwarded by n8n) ----------
const addr = (v) => {
  if (!v) return '';
  if (typeof v === 'string') return (v.match(/[^\s<>"']+@[^\s<>"']+/) || [''])[0].toLowerCase();
  if (Array.isArray(v)) return addr(v[0]);
  if (v.value) return addr(v.value);
  if (v.address) return String(v.address).toLowerCase();
  if (v.text) return addr(v.text);
  return '';
};
const headerOf = (h, name) => {
  if (!h) return '';
  const n = name.toLowerCase();
  if (Array.isArray(h)) { const x = h.find((e) => String(e.key || e.name || '').toLowerCase() === n); return x ? String(x.value ?? x.line ?? '') : ''; }
  if (typeof h === 'object') { const k = Object.keys(h).find((x) => x.toLowerCase() === n); return k ? (typeof h[k] === 'string' ? h[k] : JSON.stringify(h[k])) : ''; }
  return '';
};
function newPart(text) {
  const lines = String(text || '').split(/\r?\n/);
  const out = [];
  for (const l of lines) {
    if (/^\s*>/.test(l) || /^On .{4,200}wrote:\s*$/.test(l) || /^-{2,}\s*Original Message/i.test(l) || /^From:\s.+/.test(l)) break;
    out.push(l);
  }
  return out.join('\n').trim();
}
const OPT_OUT = /^\s*(no\b|nope\b|stop\b|unsubscribe|remove\b|remove me|please remove|take me off|not interested|no thanks|no thank you|do not (contact|email))/i;
const AUTO = /(automatic reply|auto.?reply|autoreply|out of (the )?office|away from (the )?office|on vacation|on leave|ooo\b)/i;
const BOUNCE_FROM = /(mailer-daemon|postmaster|mail delivery)/i;
const BOUNCE_SUBJ = /(undeliver|delivery status notification|delivery has failed|failure notice|returned mail|could not be delivered|delivery failure|mail delivery failed|address not found)/i;

export async function inbound(payload) {
  const m = payload?.email || payload || {};
  const inbox = String(payload?.inbox || '').toLowerCase();
  const from = addr(m.from);
  const subject = String(m.subject || '');
  const text = String(m.text || m.textPlain || m.textAsHtml || m.html || '');
  const headers = m.headers || {};

  if (BOUNCE_FROM.test(from) || BOUNCE_SUBJ.test(subject)) {
    const found = [...new Set((text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || []).map((x) => x.toLowerCase()))];
    for (const e of found) {
      const lead = await queryOne("SELECT * FROM outreach_leads WHERE email = $1 AND status IN ('active', 'done', 'new')", [e]);
      if (lead) {
        await stop(lead, 'bounced', subject.slice(0, 200));
        await query('INSERT INTO outreach_suppress (value, reason) VALUES ($1, $2) ON CONFLICT DO NOTHING', [e, 'bounced']);
        await event(lead, 'bounce', lead.step, subject);
        return { ok: true, result: 'bounce', lead: e };
      }
    }
    return { ok: true, result: 'bounce-unmatched' };
  }
  if (!from) return { ok: true, result: 'ignored' };
  const lead = await queryOne('SELECT * FROM outreach_leads WHERE email = $1', [from]);
  if (!lead) return { ok: true, result: 'not-a-lead' };
  // The inbox watcher can see the same email more than once; only the first answer counts.
  if (['replied', 'opted_out', 'bounced'].includes(lead.status)) return { ok: true, result: 'already-handled' };

  const autoHeader = headerOf(headers, 'auto-submitted');
  if (AUTO.test(subject) || (autoHeader && !/^no$/i.test(autoHeader.trim()))) {
    await event(lead, 'auto', lead.step, subject);
    return { ok: true, result: 'auto-reply' };
  }
  const body = newPart(text);
  if (OPT_OUT.test(body) || /unsubscribe/i.test(subject)) {
    await stop(lead, 'opted_out', body.slice(0, 200));
    await query('INSERT INTO outreach_suppress (value, reason) VALUES ($1, $2) ON CONFLICT DO NOTHING', [lead.email, 'asked not to be contacted']);
    await event(lead, 'optout', lead.step, body.slice(0, 500));
    return { ok: true, result: 'opt-out' };
  }
  await query("UPDATE outreach_leads SET status = 'replied', replied_at = now(), stop_reason = 'replied' WHERE id = $1", [lead.id]);
  await event(lead, 'reply', lead.step, body.slice(0, 1500), body);
  await notify('outreach', `New reply from ${lead.first_name || lead.email}${lead.company ? ` (${lead.company})` : ''}`, `${body.split('\n').find((l) => l.trim()) || subject}`.slice(0, 300) + (inbox ? ` [${inbox}]` : ''));
  return { ok: true, result: 'reply' };
}

// ---------- links in emails ----------
// Company mail filters (Microsoft Safe Links, Mimecast, Proofpoint and others) open every link
// within seconds of delivery. Those are counted separately, so "clicked" means a real person.
const SCANNER_UA = /(bot|crawl|spider|scan|preview|proofpoint|mimecast|barracuda|safelinks|microsoft office|ms-office|outlook|skype|python|curl|wget|headless|go-http|java\/|okhttp|axios|node-fetch|libwww|http-client)/i;
export function looksLikeScanner(ua, lead) {
  if (!ua || SCANNER_UA.test(ua)) return true;
  const sent = lead?.last_sent_at ? new Date(lead.last_sent_at).getTime() : 0;
  return sent > 0 && Date.now() - sent < 3 * 60 * 1000;
}

export async function clickTarget(token, rest, ua = '') {
  const lead = /^[a-z0-9]{6,16}$/.test(token || '') ? await queryOne('SELECT l.*, s.promo_code FROM outreach_leads l JOIN outreach_segments s ON s.key = l.segment WHERE l.token = $1', [token]) : null;
  const utm = (seg, content) => `utm_source=outreach&utm_medium=email&utm_campaign=${seg}&utm_content=${content}`;
  if (!lead) return rest === 'pricing' ? `${SITE}/pricing` : `${SITE}/private-pdf-tools`;
  const kind = looksLikeScanner(ua, lead) ? 'scan' : 'click';
  const recent = await queryOne('SELECT 1 FROM outreach_events WHERE lead_id = $1 AND type = $2 AND created_at > now() - interval \'1 hour\'', [lead.id, kind]);
  if (!recent) {
    if (kind === 'click') await query('UPDATE outreach_leads SET clicked_at = COALESCE(clicked_at, now()) WHERE id = $1', [lead.id]);
    await event(lead, kind, lead.step, `${rest || 'tools'}${ua ? ` | ${String(ua).slice(0, 180)}` : ''}`);
  }
  if (rest === 'pricing') return `${SITE}/pricing?code=${encodeURIComponent(lead.promo_code || '')}&${utm(lead.segment, 'pricing')}`;
  return `${SITE}/private-pdf-tools?${utm(lead.segment, 'tools')}`;
}

// ---------- importing leads ----------
export function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  const s = String(text || '').replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"' && s[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',' || c === '\t') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

const COLS = {
  email: ['email', 'work email', 'business email', 'business email1'],
  first_name: ['first name', 'first', 'firstname', 'first_name'],
  last_name: ['last name', 'last', 'lastname', 'last_name'],
  title: ['title', 'job title', 'position'],
  company: ['company (short, for emails)', 'company short', 'company_short', 'company'],
  website: ['website', 'company website', 'company website1'],
  country: ['country'],
  state: ['state', 'region', 'state or region', 'province'],
  city: ['city'],
};

export async function importLeads(segment, csv, batch) {
  const seg = await queryOne('SELECT key FROM outreach_segments WHERE key = $1', [segment]);
  if (!seg) throw new Error('Unknown segment');
  const rows = parseCsv(csv);
  if (rows.length < 2) throw new Error('The file needs a header row and at least one lead.');
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const idx = {};
  for (const [k, names] of Object.entries(COLS)) {
    for (const n of names) { const i = head.indexOf(n); if (i >= 0) { idx[k] = i; break; } }
  }
  if (idx.email === undefined) throw new Error('No email column found. Use a column named "Email".');
  const res = { added: 0, duplicate: 0, invalid: 0, suppressed: 0 };
  for (const r of rows.slice(1)) {
    const get = (k) => (idx[k] === undefined ? '' : String(r[idx[k]] || '').trim());
    const email = get('email').toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { res.invalid++; continue; }
    if (await suppressed(email)) { res.suppressed++; continue; }
    const token = crypto.randomBytes(6).toString('base64url').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8).padEnd(8, '0');
    const ins = await queryOne(
      `INSERT INTO outreach_leads (segment, email, first_name, last_name, title, company, website, country, state, city, tz, token, batch)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT (email) DO NOTHING RETURNING id`,
      [segment, email, get('first_name'), get('last_name'), get('title'), get('company'), get('website'), get('country'), get('state'), get('city'), tzFor(get('country'), get('state')), token, batch || null]
    ).catch(() => null);
    if (ins) res.added++; else res.duplicate++;
  }
  return res;
}

// ---------- numbers for the admin page ----------
export async function stats() {
  const bySeg = await query(
    `SELECT s.key, s.name, s.inbox_email, s.promo_code, s.daily_cap, s.active, s.last_sent_at, s.next_send_at,
        count(l.id)::int AS leads,
        count(l.id) FILTER (WHERE l.status = 'new')::int AS waiting,
        count(l.id) FILTER (WHERE l.status IN ('active', 'done'))::int AS in_sequence,
        count(l.id) FILTER (WHERE l.status = 'replied')::int AS replied,
        count(l.id) FILTER (WHERE l.status = 'opted_out')::int AS opted_out,
        count(l.id) FILTER (WHERE l.status = 'bounced')::int AS bounced,
        count(l.id) FILTER (WHERE l.status = 'skipped')::int AS skipped,
        count(l.id) FILTER (WHERE l.first_sent_at IS NOT NULL)::int AS contacted,
        count(l.id) FILTER (WHERE l.clicked_at IS NOT NULL)::int AS clicked,
        count(u.id)::int AS signed_up,
        count(u.id) FILTER (WHERE u.plan <> 'free')::int AS on_paid_plan
       FROM outreach_segments s
       LEFT JOIN outreach_leads l ON l.segment = s.key
       LEFT JOIN users u ON lower(u.email) = l.email AND l.first_sent_at IS NOT NULL AND u.created_at > l.first_sent_at
      GROUP BY s.key ORDER BY s.sort`
  );
  const sent = await query(
    `SELECT segment, count(*) FILTER (WHERE created_at > now() - interval '24 hours')::int AS sent24h, count(*)::int AS sent_total
       FROM outreach_events WHERE type = 'sent' GROUP BY segment`
  );
  const codes = await query(
    `SELECT code, count(*) FILTER (WHERE status = 'paid')::int AS paid, COALESCE(sum(base_cents - discount_cents) FILTER (WHERE status = 'paid'), 0)::int AS revenue_cents
       FROM promo_redemptions GROUP BY code`
  ).catch(() => []);
  const sm = Object.fromEntries(sent.map((r) => [r.segment, r]));
  const cm = Object.fromEntries(codes.map((r) => [r.code, r]));
  return bySeg.map((r) => ({ ...r, ...(sm[r.key] || { sent24h: 0, sent_total: 0 }), paid: cm[r.promo_code]?.paid || 0, revenue_cents: cm[r.promo_code]?.revenue_cents || 0, password_set: !!passwordFor(r.key) }));
}

// Everything that happened with one person, oldest first, for the admin page.
export async function leadHistory(id) {
  const lead = await queryOne('SELECT l.*, s.name AS segment_name, s.inbox_email FROM outreach_leads l JOIN outreach_segments s ON s.key = l.segment WHERE l.id = $1', [id]);
  if (!lead) return null;
  const events = await query('SELECT type, step, detail, body, created_at FROM outreach_events WHERE lead_id = $1 ORDER BY created_at, id', [id]);
  return { lead, events };
}

// Who would get the next emails, for every inbox (on or off). Sends nothing and checks nothing.
function nextWindow(tz, s, from = new Date()) {
  if (inWindow(tz, s, from)) return from;
  const start = new Date(from); start.setUTCMinutes(0, 0, 0);
  for (let h = 1; h <= 24 * 8; h++) {
    const t = new Date(start.getTime() + h * 3600000);
    if (inWindow(tz, s, t)) return t;
  }
  return null;
}
function localLabel(tz, d) {
  try { return new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(d); } catch { return ''; }
}

export async function preview(limit = 5) {
  const s = await settings();
  const segs = await query('SELECT * FROM outreach_segments ORDER BY sort');
  const now = new Date();
  const out = [];
  for (const seg of segs) {
    const sent = await queryOne("SELECT count(*)::int AS n FROM outreach_events WHERE segment = $1 AND type = 'sent' AND created_at > now() - interval '24 hours'", [seg.key]);
    const waiting = await queryOne("SELECT count(*)::int AS n FROM outreach_leads WHERE segment = $1 AND status = 'new'", [seg.key]);
    const templates = await query('SELECT * FROM outreach_templates WHERE segment = $1 ORDER BY step', [seg.key]);
    const { follow, fresh } = templates.length ? await candidates(seg, templates) : { follow: [], fresh: [] };
    const next = [];
    for (const l of [...follow, ...fresh]) {
      if (next.length >= limit * 4) break;
      if (l.status === 'new' && (await suppressed(l.email))) continue;
      const step = l.step + 1;
      const tpl = templates.find((t) => t.step === step);
      if (!tpl) continue;
      const open = nextWindow(l.tz, s, now);
      next.push({
        name: [l.first_name, l.last_name].filter(Boolean).join(' ') || l.email,
        email: l.email,
        company: l.company,
        step,
        subject: step === 1 || !l.subject ? render(tpl.subject, l, seg) : `Re: ${l.subject}`,
        local_now: localLabel(l.tz, now),
        in_window: inWindow(l.tz, s, now),
        opens: open ? localLabel(l.tz, open) : null,
        opens_in_hours: open ? Math.max(0, Math.round((open - now) / 3600000)) : null,
        needs_check: l.status === 'new' && l.verify !== 'safe',
      });
    }
    // Follow-ups go first; otherwise whoever's send window opens soonest.
    next.sort((a, b) => (b.step > 1) - (a.step > 1) || (a.opens_in_hours ?? 999) - (b.opens_in_hours ?? 999));
    out.push({ key: seg.key, name: seg.name, active: seg.active, cap: seg.daily_cap, sent24h: sent?.n || 0, waiting: waiting?.n || 0, next: next.slice(0, limit) });
  }
  return { paused: s.paused, window: `${s.window_start}:00 to ${s.window_end}:00${s.weekdays_only ? ', weekdays' : ''}`, segments: out };
}
