import { auth } from '../../../../auth';
import { checkToolAccess, recordUsage } from '../../../../lib/limits';

export const dynamic = 'force-dynamic';

const GOTENBERG = 'http://gotenberg:3000/forms/libreoffice/convert';
const MAX_MB = 20;

// Which file types each tool accepts.
const TOOLS = {
  'word-to-pdf': ['doc', 'docx', 'odt', 'rtf', 'txt'],
  'excel-to-pdf': ['xls', 'xlsx', 'ods', 'csv'],
  'powerpoint-to-pdf': ['ppt', 'pptx', 'odp'],
};

function err(message, status) {
  return Response.json({ ok: false, error: message }, { status });
}

export async function POST(req) {
  const tool = req.nextUrl.searchParams.get('tool') || '';
  const allowed = TOOLS[tool];
  if (!allowed) return err('Unknown tool.', 400);

  // Check login + daily limit BEFORE reading the upload.
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
  if (!file || typeof file === 'string') return err('Choose a file to convert.', 400);

  const name = file.name || 'document';
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (!allowed.includes(ext)) return err(`This tool accepts ${allowed.map((e) => '.' + e).join(', ')} files.`, 400);
  if (file.size > MAX_MB * 1024 * 1024) return err(`File is too large. The limit is ${MAX_MB} MB.`, 413);

  const safeName = name.replace(/[^\w.\-]+/g, '_').slice(-120);
  const fd = new FormData();
  fd.append('files', file, safeName);

  let res;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 115000);
    res = await fetch(GOTENBERG, { method: 'POST', body: fd, signal: controller.signal });
    clearTimeout(timer);
  } catch (e) {
    return err('The converter is busy right now. Please try again in a moment.', 502);
  }
  if (!res.ok) return err('Could not convert this file. It may be damaged or password protected.', 422);

  const pdf = await res.arrayBuffer();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  await recordUsage(userId, ip, tool, 1);

  const remaining = access.remaining >= 999999 ? 999999 : Math.max(access.remaining - 1, 0);
  const outName = safeName.replace(/\.[^.]+$/, '') + '.pdf';

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${outName}"`,
      'X-Remaining': String(remaining),
    },
  });
}
