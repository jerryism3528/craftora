// Runs full-site audits in the background and stores results in Postgres.
import crypto from 'crypto';
import { query, queryOne } from './db';
import { runSiteAudit, jobs } from './seo-site-audit';
import { validateStartUrl } from './sitemap-crawler';

const MAX_RUNNING = 2;
const KEEP_REPORTS_PER_SITE = 10;

export function newAuditId() {
  return crypto.randomBytes(9).toString('base64url');
}

export function runningCount() {
  return [...jobs.values()].filter((j) => j.status === 'running').length;
}

export async function startSiteAudit(userId, url) {
  const startUrl = await validateStartUrl(url);
  const site = new URL(startUrl).hostname.replace(/^www\./, '');
  const uid = String(userId);
  const running = [...jobs.values()].filter((j) => j.status === 'running');
  if (running.some((j) => j.userId === uid)) throw new Error('You already have an audit running. Wait for it to finish first.');
  if (running.length >= MAX_RUNNING) throw new Error('The auditor is busy with other sites right now. Please try again in a few minutes.');

  const id = newAuditId();
  await query("INSERT INTO seo_audits (id, user_id, site, start_url, status) VALUES ($1, $2, $3, $4, 'running')", [id, uid, site, startUrl]);
  const job = { id, userId: uid, status: 'running', progress: { phase: 'starting', crawled: 0, analyzed: 0, queued: 0 }, startedAt: Date.now() };
  jobs.set(id, job);

  (async () => {
    try {
      const report = await runSiteAudit(startUrl, { onProgress: (p) => { job.progress = p; } });
      await query(
        "UPDATE seo_audits SET status = 'done', score = $2, pages = $3, summary = $4, report = $5, finished_at = now() WHERE id = $1",
        [id, report.score, report.stats.analyzed, JSON.stringify(report.summary), JSON.stringify(report)]
      );
      // Keep full reports for the latest audits of each site; older rows keep their score for the trend chart.
      await query(
        `UPDATE seo_audits SET report = NULL WHERE user_id = $1 AND site = $2 AND report IS NOT NULL AND id NOT IN (
           SELECT id FROM seo_audits WHERE user_id = $1 AND site = $2 ORDER BY created_at DESC LIMIT ${KEEP_REPORTS_PER_SITE})`,
        [uid, site]
      );
    } catch (e) {
      await query("UPDATE seo_audits SET status = 'failed', error = $2, finished_at = now() WHERE id = $1", [id, String(e.message || 'The audit failed.').slice(0, 300)]).catch(() => {});
    } finally {
      jobs.delete(id);
    }
  })();

  return { id, site, startUrl };
}

// Mark audits that were running when the app restarted as failed.
export async function cleanupStale(row) {
  if (row && row.status === 'running' && !jobs.has(row.id) && Date.now() - new Date(row.created_at).getTime() > 2 * 60 * 1000) {
    await query("UPDATE seo_audits SET status = 'failed', error = 'The audit was interrupted. Please run it again.', finished_at = now() WHERE id = $1 AND status = 'running'", [row.id]);
    row.status = 'failed';
    row.error = 'The audit was interrupted. Please run it again.';
  }
  return row;
}

export function progressFor(id) {
  return jobs.get(id)?.progress || null;
}

export async function getAuditRow(id) {
  if (!/^[A-Za-z0-9_-]{6,20}$/.test(id || '')) return null;
  const row = await queryOne('SELECT * FROM seo_audits WHERE id = $1', [id]);
  return cleanupStale(row);
}

// Compare this audit with the previous finished audit of the same site.
export async function compareWithPrevious(row) {
  if (!row?.report) return null;
  const prev = await queryOne(
    "SELECT id, score, created_at, report FROM seo_audits WHERE user_id = $1 AND site = $2 AND status = 'done' AND created_at < $3 AND report IS NOT NULL ORDER BY created_at DESC LIMIT 1",
    [row.user_id, row.site, row.created_at]
  );
  if (!prev?.report) return null;
  const before = new Map(prev.report.checks.map((c) => [c.id, c]));
  const fixed = [];
  const added = [];
  const better = [];
  const worse = [];
  for (const c of row.report.checks) {
    if (c.status === 'info') continue;
    const p = before.get(c.id);
    if (!p || p.status === 'info') { if (c.status === 'fail') added.push(c.id); continue; }
    if (p.status === 'fail' && c.status === 'pass') fixed.push(c.id);
    else if (p.status === 'pass' && c.status === 'fail') added.push(c.id);
    else if (p.status === 'fail' && c.status === 'fail') {
      if (c.affected < p.affected) better.push(c.id);
      else if (c.affected > p.affected) worse.push(c.id);
    }
  }
  return { prevId: prev.id, prevScore: prev.score, prevDate: prev.created_at, fixed, added, better, worse };
}
