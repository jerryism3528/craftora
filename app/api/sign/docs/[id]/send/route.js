import { currentUser, clientIp } from '../../../../../../lib/current-user';
import { query } from '../../../../../../lib/db';
import { checkToolAccess, recordUsage } from '../../../../../../lib/limits';
import { loadFull, logEvent, inviteNext, EXPIRY_DAYS } from '../../../../../../lib/signer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function POST(req, { params }) {
  const user = await currentUser();
  if (!user) return json({ error: 'Please sign in.', needLogin: true }, 401);
  const full = await loadFull(params.id);
  if (!full || full.doc.user_id !== user.id) return json({ error: 'Document not found.' }, 404);
  if (full.doc.status !== 'draft') return json({ error: 'This document was already sent.' }, 400);
  if (!full.signers.length) return json({ error: 'Add at least one signer.' }, 400);
  for (const s of full.signers) {
    if (!full.fields.some((f) => f.signer_id === s.id && f.type === 'signature')) {
      return json({ error: `Add a signature field for ${s.name}.` }, 400);
    }
  }
  const access = await checkToolAccess(user.id, 'document-signer');
  if (!access.allowed) return json({ error: access.reason }, 429);

  await query(`UPDATE sign_docs SET status = 'sent', sent_at = now(), updated_at = now(), expires_at = now() + interval '${EXPIRY_DAYS} days' WHERE id = $1`, [full.doc.id]);
  await logEvent(full.doc.id, null, 'sent', `Sent to ${full.signers.length} signer${full.signers.length > 1 ? 's' : ''}`, req);
  await recordUsage(user.id, clientIp(req), 'document-signer', 1);
  const invited = await inviteNext(full.doc.id, req);
  return json({ ok: true, invited });
}
