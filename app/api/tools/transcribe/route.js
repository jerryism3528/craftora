import { auth } from '../../../../auth';
import { checkToolAccess } from '../../../../lib/limits';
import { query } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

const TOOL = 'transcription';
const SERVICE = 'http://transcriber:8000';
const DAILY_MINUTES = 30;
const MAX_MB = 100;
const EXT = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'oga', 'flac', 'wma', 'opus', 'amr', 'aiff', 'aif',
  'mp4', 'mov', 'mkv', 'webm', 'avi', 'wmv', 'flv', 'm4v', '3gp', 'mpeg', 'mpg'];
const LANGS = ['', 'en', 'ur', 'hi', 'ar', 'es', 'fr', 'de', 'pt', 'ru', 'tr', 'id', 'bn', 'pa', 'zh', 'ja', 'ko', 'it', 'nl', 'fa'];

function err(message, status) {
  return Response.json({ ok: false, error: message }, { status });
}

function clientInfo(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  const raw = req.headers.get('x-device-id') || req.cookies.get('cdid')?.value || '';
  const device = /^[a-zA-Z0-9-]{8,64}$/.test(raw) ? raw : null;
  return { ip, device };
}

// Minutes used in the last 24h by this account, OR this IP, OR this device.
async function minutesUsed(userId, ip, device) {
  const rows = await query(
    `SELECT COALESCE(SUM(amount), 0) AS used FROM usage_log
     WHERE tool_slug = $1 AND created_at > now() - interval '24 hours'
       AND (user_id = $2 OR ($3::text IS NOT NULL AND ip = $3) OR ($4::text IS NOT NULL AND device_id = $4))`,
    [TOOL, userId, ip, device]
  );
  return Number(rows[0]?.used) || 0;
}

// Start a transcription job.
export async function POST(req) {
  const session = await auth();
  const userId = session?.user?.id || null;
  const access = await checkToolAccess(userId, TOOL);
  if (!access.allowed) return err(access.reason, access.needLogin ? 401 : 429);

  const { ip, device } = clientInfo(req);
  const isAdmin = access.remaining >= 999999;
  let remaining = 9999;
  if (!isAdmin) {
    const used = await minutesUsed(userId, ip, device);
    remaining = Math.max(0, DAILY_MINUTES - used);
    if (remaining <= 0) {
      return err(`You've used your ${DAILY_MINUTES} minutes of transcription for today. Your allowance refreshes 24 hours after your first use.`, 429);
    }
  }

  let form;
  try { form = await req.formData(); } catch (e) { return err('Invalid upload.', 400); }
  const file = form.get('file');
  if (!file || typeof file === 'string') return err('Choose an audio or video file.', 400);
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!EXT.includes(ext)) return err('This file type is not supported. Use an audio file (MP3, WAV, M4A...) or a video (MP4, MOV, MKV...).', 400);
  if (file.size > MAX_MB * 1024 * 1024) return err(`File is too large. The limit is ${MAX_MB} MB.`, 413);
  const language = LANGS.includes(form.get('language')) ? form.get('language') : '';

  const fd = new FormData();
  fd.append('file', file, `input.${ext}`);
  fd.append('language', language);
  fd.append('owner', String(userId));
  fd.append('max_seconds', String(isAdmin ? 7200 : remaining * 60));

  let res;
  try {
    res = await fetch(`${SERVICE}/jobs`, { method: 'POST', body: fd });
  } catch (e) {
    return err('The transcription service is busy. Please try again in a moment.', 502);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return err(data.detail || 'Could not start transcription.', res.status === 413 ? 413 : 422);

  const minutes = Math.max(1, Math.ceil((data.duration || 0) / 60));
  await query(
    'INSERT INTO usage_log (user_id, ip, tool_slug, amount, device_id) VALUES ($1, $2, $3, $4, $5)',
    [userId, ip, TOOL, minutes, device]
  );

  return Response.json({
    ok: true,
    id: data.id,
    duration: data.duration,
    minutes,
    remaining: isAdmin ? null : Math.max(0, remaining - minutes),
  });
}

// Check job progress.
export async function GET(req) {
  const session = await auth();
  const userId = session?.user?.id || null;
  if (!userId) return err('Please sign in.', 401);
  const id = req.nextUrl.searchParams.get('id') || '';
  if (!/^[a-f0-9]{32}$/.test(id)) return err('Invalid job.', 400);

  let res;
  try {
    res = await fetch(`${SERVICE}/jobs/${id}?owner=${encodeURIComponent(String(userId))}`, { cache: 'no-store' });
  } catch (e) {
    return err('Lost connection to the transcription service. Please refresh.', 502);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return err(data.detail || 'This job was not found or has expired.', 404);
  return Response.json({ ok: true, ...data });
}
