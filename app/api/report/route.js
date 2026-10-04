import { auth } from '../../../auth';
import { query, queryOne } from '../../../lib/db';
import { hit, ipOf } from '../../../lib/iplimit';

export const dynamic = 'force-dynamic';

const REASONS = {
  nudity: 'Nudity or sexual content',
  violence: 'Violence or gore',
  hate: 'Hate or harassment',
  illegal: 'Illegal content',
  copyright: 'Copyright violation',
  spam: 'Spam or scam',
  phishing: 'Phishing or malware',
  other: 'Other',
};

export async function POST(req) {
  const ip = ipOf(req);
  const lim = hit('report:' + ip, 10, 3600000);
  if (!lim.ok) return Response.json({ ok: false, error: 'Too many reports. Please try again later.' }, { status: 429 });

  let body;
  try { body = await req.json(); } catch (e) { return Response.json({ ok: false, error: 'Invalid request.' }, { status: 400 }); }
  const type = body.type === 'link' ? 'link' : body.type === 'image' ? 'image' : null;
  const reason = REASONS[body.reason] ? body.reason : null;
  const code = String(body.code || '').slice(0, 60);
  const details = String(body.details || '').trim().slice(0, 1000) || null;
  if (!type || !reason || !code) return Response.json({ ok: false, error: 'Please choose a reason.' }, { status: 400 });

  const target = type === 'image'
    ? await queryOne('SELECT id FROM images WHERE code = $1', [code])
    : await queryOne('SELECT id FROM short_links WHERE code = $1', [code]);
  if (!target) return Response.json({ ok: false, error: 'Not found.' }, { status: 404 });

  const session = await auth();
  const reporter = session?.user?.id ? String(session.user.id) : null;

  await query(
    'INSERT INTO reports (target_type, target_id, reason, details, reporter_ip, reporter_user) VALUES ($1, $2, $3, $4, $5, $6)',
    [type, target.id, reason, details, ip, reporter]
  );
  await query(
    'INSERT INTO admin_notifications (type, title, body, target_type, target_id) VALUES ($1, $2, $3, $4, $5)',
    ['report', `${type === 'image' ? 'Image' : 'Short link'} reported: ${REASONS[reason]}`, details || `Code: ${code}`, type, target.id]
  );
  return Response.json({ ok: true });
}
