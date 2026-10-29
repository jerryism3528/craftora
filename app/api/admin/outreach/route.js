import { query, queryOne } from '../../../../lib/db';
import { requireAdmin, logAction, ok, bad, forbid, readJson } from '../../../../lib/admin';
import { stats, settings, importLeads, sendTest, leadHistory, preview } from '../../../../lib/outreach';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const STATUSES = ['new', 'active', 'done', 'replied', 'opted_out', 'bounced', 'skipped', 'stopped'];

export async function GET(req) {
  if (!(await requireAdmin())) return forbid();
  const url = new URL(req.url);
  const leadId = parseInt(url.searchParams.get('lead') || '', 10);
  if (leadId) {
    const h = await leadHistory(leadId);
    return h ? ok(h) : bad('Lead not found.', 404);
  }
  const seg = url.searchParams.get('segment') || '';
  const status = url.searchParams.get('status') || '';
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const where = [], args = [];
  if (seg) { args.push(seg); where.push(`segment = $${args.length}`); }
  if (STATUSES.includes(status)) { args.push(status); where.push(`status = $${args.length}`); }
  if (q) { args.push(`%${q}%`); where.push(`(email ILIKE $${args.length} OR company ILIKE $${args.length} OR first_name ILIKE $${args.length} OR last_name ILIKE $${args.length})`); }
  const leads = await query(`SELECT id, segment, email, first_name, last_name, company, country, state, status, step, verify, first_sent_at, last_sent_at, replied_at, clicked_at, stop_reason FROM outreach_leads ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY COALESCE(replied_at, last_sent_at, created_at) DESC LIMIT 100`, args);
  const replies = await query(`SELECT e.created_at, e.type, e.detail, l.email, l.first_name, l.company, l.segment FROM outreach_events e JOIN outreach_leads l ON l.id = e.lead_id WHERE e.type IN ('reply', 'optout') ORDER BY e.created_at DESC LIMIT 20`);
  const errors = await query(`SELECT created_at, segment, detail FROM outreach_events WHERE type IN ('error', 'warn') ORDER BY created_at DESC LIMIT 10`);
  const templates = await query('SELECT segment, step, delay_days, subject, body FROM outreach_templates ORDER BY segment, step');
  return ok({ segments: await stats(), settings: await settings(), leads, replies, errors, templates, secretSet: (process.env.OUTREACH_SECRET || '').length >= 24 });
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return forbid();
  const b = await readJson(req);
  try {
    switch (b.action) {
      case 'settings': {
        const ws = parseInt(b.window_start, 10), we = parseInt(b.window_end, 10), gmin = parseInt(b.gap_min, 10), gmax = parseInt(b.gap_max, 10);
        if (!(ws >= 0 && ws < 24 && we > ws && we <= 24)) return bad('Send window must be between 0 and 24, start before end.');
        if (!(gmin >= 1 && gmax >= gmin && gmax <= 240)) return bad('Gap minutes must be 1 or more, and max at least min.');
        await query('UPDATE outreach_settings SET paused = $1, window_start = $2, window_end = $3, weekdays_only = $4, gap_min = $5, gap_max = $6 WHERE id = 1', [!!b.paused, ws, we, !!b.weekdays_only, gmin, gmax]);
        await logAction(admin.id, 'outreach_settings', null, b);
        return ok({ message: b.paused ? 'Outreach paused.' : 'Settings saved.' });
      }
      case 'segment': {
        const cap = parseInt(b.daily_cap, 10);
        if (!(cap >= 0 && cap <= 200)) return bad('Daily cap must be between 0 and 200.');
        const email = String(b.inbox_email || '').trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad('Enter a valid inbox email.');
        await query('UPDATE outreach_segments SET daily_cap = $2, active = $3, inbox_email = $4, from_name = $5, promo_code = $6 WHERE key = $1', [b.key, cap, !!b.active, email, String(b.from_name || 'Maria V.').slice(0, 60), String(b.promo_code || '').toUpperCase().slice(0, 32) || null]);
        await logAction(admin.id, 'outreach_segment', b.key, { cap, active: !!b.active });
        return ok({ message: `${b.key}: ${b.active ? `sending up to ${cap} a day` : 'stopped'}.` });
      }
      case 'template': {
        const step = parseInt(b.step, 10), delay = parseInt(b.delay_days, 10) || 0;
        if (!(step >= 1 && step <= 5)) return bad('Step must be 1 to 5.');
        if (!String(b.body || '').trim()) return bad('The email body is empty.');
        if (step === 1 && !String(b.subject || '').trim()) return bad('Email 1 needs a subject.');
        await query(`INSERT INTO outreach_templates (segment, step, delay_days, subject, body, updated_at) VALUES ($1, $2, $3, $4, $5, now())
          ON CONFLICT (segment, step) DO UPDATE SET delay_days = EXCLUDED.delay_days, subject = EXCLUDED.subject, body = EXCLUDED.body, updated_at = now()`, [b.segment, step, delay, String(b.subject || '').slice(0, 200), String(b.body).slice(0, 5000)]);
        await logAction(admin.id, 'outreach_template', `${b.segment}-${step}`);
        return ok({ message: `Saved email ${step}.` });
      }
      case 'import': {
        const r = await importLeads(String(b.segment || ''), String(b.csv || ''), String(b.batch || '').slice(0, 60));
        await logAction(admin.id, 'outreach_import', b.segment, r);
        return ok({ message: `Added ${r.added}. Already in the list: ${r.duplicate}. Invalid email: ${r.invalid}. Do-not-contact or existing users: ${r.suppressed}.`, result: r });
      }
      case 'test': {
        const to = String(b.to || '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return bad('Enter an email to send the test to.');
        const r = await sendTest(String(b.segment || ''), parseInt(b.step, 10) || 1, to);
        return ok({ message: `Test sent to ${to}: "${r.subject}".` });
      }
      case 'dry_run': {
        const r = await preview(5);
        return ok({ message: 'Preview ready. Nothing was sent.', result: r });
      }
      case 'lead': {
        const id = parseInt(b.id, 10);
        const lead = await queryOne('SELECT * FROM outreach_leads WHERE id = $1', [id]);
        if (!lead) return bad('Lead not found.', 404);
        if (b.do === 'stop') await query("UPDATE outreach_leads SET status = 'stopped', stop_reason = 'stopped by admin' WHERE id = $1", [id]);
        else if (b.do === 'suppress') {
          await query("UPDATE outreach_leads SET status = 'stopped', stop_reason = 'do not contact' WHERE id = $1", [id]);
          await query('INSERT INTO outreach_suppress (value, reason) VALUES ($1, $2) ON CONFLICT DO NOTHING', [lead.email, 'added by admin']);
        } else if (b.do === 'resume' && ['stopped', 'skipped'].includes(lead.status)) {
          await query("UPDATE outreach_leads SET status = CASE WHEN step = 0 THEN 'new' ELSE 'active' END, stop_reason = NULL WHERE id = $1", [id]);
        } else return bad('Unknown lead action.');
        await logAction(admin.id, `outreach_lead_${b.do}`, lead.email);
        return ok({ message: `${lead.email}: done.` });
      }
      default:
        return bad('Unknown action.');
    }
  } catch (e) {
    return bad(e.message || 'Something went wrong.');
  }
}
