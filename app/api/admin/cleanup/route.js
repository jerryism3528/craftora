import crypto from 'crypto';
import { requireAdmin, logAction, ok, forbid } from '../../../../lib/admin';
import { runSignerCleanup } from '../../../../lib/signer-cleanup';

export const dynamic = 'force-dynamic';

function cronAllowed(req) {
  const secret = process.env.CRON_SECRET || '';
  const given = req.headers.get('x-cron-secret') || '';
  if (secret.length < 16 || given.length !== secret.length) return false;
  return crypto.timingSafeEqual(Buffer.from(given), Buffer.from(secret));
}

// Daily storage cleanup. Called by the VPS cron with the x-cron-secret header, or by an admin.
export async function POST(req) {
  const fromCron = cronAllowed(req);
  const admin = fromCron ? null : await requireAdmin();
  if (!fromCron && !admin) return forbid();
  const signer = await runSignerCleanup({ dryRun: false });
  await logAction(admin?.id || null, 'storage_cleanup', fromCron ? 'cron' : 'manual', { drafts: signer.drafts, closed: signer.closed, orphans: signer.orphanFiles, bytes: signer.bytes });
  return ok({ signer: { drafts: signer.drafts, closed: signer.closed, orphanFiles: signer.orphanFiles, bytes: signer.bytes } });
}
