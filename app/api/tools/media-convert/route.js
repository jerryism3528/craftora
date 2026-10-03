import { auth } from '../../../../auth';
import { checkToolAccess, recordUsage } from '../../../../lib/limits';

export const dynamic = 'force-dynamic';

const SERVICE = 'http://mediatools:8000';
const MAX_MB = 100;
const VIDEO_IN = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'flv', 'm4v', '3gp', 'mpeg', 'mpg', 'ts'];
const AUDIO_IN = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'oga', 'flac', 'wma', 'opus', 'aiff', 'aif', 'amr'];

const TOOLS = {
  'video-converter': { path: '/convert-video', input: VIDEO_IN, outputs: ['mp4', 'webm', 'mov', 'mkv', 'avi', 'gif'], option: 'res', values: ['original', '1080', '720', '480'], fallback: 'original' },
  'audio-converter': { path: '/convert-audio', input: AUDIO_IN, outputs: ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'opus'], option: 'bitrate', values: ['128', '192', '320'], fallback: '192' },
  'video-to-mp3': { path: '/convert-audio', input: VIDEO_IN, outputs: ['mp3', 'm4a', 'wav', 'aac'], option: 'bitrate', values: ['128', '192', '320'], fallback: '192' },
};

function err(message, status) {
  return Response.json({ ok: false, error: message }, { status });
}

export async function POST(req) {
  const tool = req.nextUrl.searchParams.get('tool') || '';
  const cfg = TOOLS[tool];
  if (!cfg) return err('Unknown tool.', 400);

  // Login + daily limit before reading the upload.
  const session = await auth();
  const userId = session?.user?.id || null;
  const access = await checkToolAccess(userId, tool);
  if (!access.allowed) return err(access.reason, access.needLogin ? 401 : 429);

  let form;
  try { form = await req.formData(); } catch (e) { return err('Invalid upload.', 400); }
  const file = form.get('file');
  if (!file || typeof file === 'string') return err('Choose a file to convert.', 400);

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!cfg.input.includes(ext)) return err(`This tool accepts ${cfg.input.map((e) => e.toUpperCase()).join(', ')} files.`, 400);
  if (file.size > MAX_MB * 1024 * 1024) return err(`File is too large. The limit is ${MAX_MB} MB.`, 413);

  const to = cfg.outputs.includes(form.get('to')) ? form.get('to') : cfg.outputs[0];
  const opt = cfg.values.includes(form.get('option')) ? form.get('option') : cfg.fallback;

  const fd = new FormData();
  fd.append('file', file, `input.${ext}`);
  fd.append('to', to);
  fd.append(cfg.option, opt);

  let res;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1200000);
    res = await fetch(SERVICE + cfg.path, { method: 'POST', body: fd, signal: controller.signal });
    clearTimeout(timer);
  } catch (e) {
    return err('The converter is busy or the file took too long. Please try again.', 502);
  }

  if (!res.ok) {
    let msg = 'Could not convert this file.';
    try { const data = await res.json(); if (data.detail) msg = data.detail; } catch (e) {}
    return err(msg, res.status === 413 ? 413 : 422);
  }

  const out = await res.arrayBuffer();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  await recordUsage(userId, ip, tool, 1);
  const remaining = access.remaining >= 999999 ? 999999 : Math.max(access.remaining - 1, 0);

  return new Response(out, {
    headers: {
      'Content-Type': res.headers.get('content-type') || 'application/octet-stream',
      'Content-Disposition': 'attachment',
      'X-Remaining': String(remaining),
      'X-Output-Ext': to,
    },
  });
}
