import { auth } from '../../../../auth';
import { checkToolAccess, recordUsage } from '../../../../lib/limits';

export const dynamic = 'force-dynamic';

const SERVICE = 'http://pdftools:8000';
const MAX_MB = 20;

const TOOLS = {
  'pdf-to-word': { path: '/pdf-to-word', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', timeout: 180000 },
  'pdf-to-excel': { path: '/pdf-to-excel', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', timeout: 180000 },
  'pdf-to-powerpoint': { path: '/pdf-to-powerpoint', type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', timeout: 180000 },
  'pdf-ocr': { path: '/pdf-ocr', type: 'application/pdf', timeout: 600000 },
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

  let file;
  try {
    const form = await req.formData();
    file = form.get('file');
  } catch (e) {
    return err('Invalid upload.', 400);
  }
  if (!file || typeof file === 'string') return err('Choose a PDF to convert.', 400);
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (ext !== 'pdf') return err('Please upload a PDF file.', 400);
  if (file.size > MAX_MB * 1024 * 1024) return err(`File is too large. The limit is ${MAX_MB} MB.`, 413);

  const fd = new FormData();
  fd.append('file', file, 'input.pdf');

  let res;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeout);
    res = await fetch(SERVICE + cfg.path, { method: 'POST', body: fd, signal: controller.signal });
    clearTimeout(timer);
  } catch (e) {
    return err('The converter is busy or the file took too long. Please try again.', 502);
  }

  if (!res.ok) {
    let msg = 'Could not convert this PDF.';
    try { const data = await res.json(); if (data.detail) msg = data.detail; } catch (e) {}
    return err(msg, res.status === 413 ? 413 : 422);
  }

  const out = await res.arrayBuffer();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  await recordUsage(userId, ip, tool, 1);
  const remaining = access.remaining >= 999999 ? 999999 : Math.max(access.remaining - 1, 0);

  return new Response(out, {
    headers: {
      'Content-Type': cfg.type,
      'Content-Disposition': 'attachment',
      'X-Remaining': String(remaining),
    },
  });
}
