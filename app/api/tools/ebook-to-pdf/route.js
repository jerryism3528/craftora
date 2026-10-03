import { auth } from '../../../../auth';
import { checkToolAccess, recordUsage } from '../../../../lib/limits';

export const dynamic = 'force-dynamic';

const TOOL = 'ebook-to-pdf';
const SERVICE = 'http://pdftools:8000/ebook-to-pdf';
const MAX_MB = 50;
const EXT = ['epub', 'mobi', 'azw', 'azw3', 'fb2', 'lit', 'pdb', 'cbz', 'txt'];
const PAPERS = ['a4', 'letter', 'a5', '6x9'];
const FONTS = ['small', 'medium', 'large'];

function err(message, status) {
  return Response.json({ ok: false, error: message }, { status });
}

export async function POST(req) {
  const session = await auth();
  const userId = session?.user?.id || null;
  const access = await checkToolAccess(userId, TOOL);
  if (!access.allowed) return err(access.reason, access.needLogin ? 401 : 429);

  let form;
  try { form = await req.formData(); } catch (e) { return err('Invalid upload.', 400); }
  const file = form.get('file');
  if (!file || typeof file === 'string') return err('Choose an ebook to convert.', 400);

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!EXT.includes(ext)) return err('Unsupported format. Use EPUB, MOBI, AZW, AZW3, FB2, LIT, PDB, CBZ, or TXT.', 400);
  if (file.size > MAX_MB * 1024 * 1024) return err(`File is too large. The limit is ${MAX_MB} MB.`, 413);

  const paper = PAPERS.includes(form.get('paper')) ? form.get('paper') : 'a4';
  const font = FONTS.includes(form.get('font')) ? form.get('font') : 'medium';
  const toc = form.get('toc') === '0' ? '0' : '1';
  const numbers = form.get('numbers') === '0' ? '0' : '1';

  const fd = new FormData();
  fd.append('file', file, `book.${ext}`);
  fd.append('paper', paper);
  fd.append('font', font);
  fd.append('toc', toc);
  fd.append('numbers', numbers);

  let res;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 900000);
    res = await fetch(SERVICE, { method: 'POST', body: fd, signal: controller.signal });
    clearTimeout(timer);
  } catch (e) {
    return err('The converter is busy or the book took too long. Please try again.', 502);
  }

  if (!res.ok) {
    let msg = 'Could not convert this ebook.';
    try { const data = await res.json(); if (data.detail) msg = data.detail; } catch (e) {}
    return err(msg, res.status === 413 ? 413 : 422);
  }

  const pdf = await res.arrayBuffer();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  await recordUsage(userId, ip, TOOL, 1);
  const remaining = access.remaining >= 999999 ? 999999 : Math.max(access.remaining - 1, 0);

  return new Response(pdf, {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment', 'X-Remaining': String(remaining) },
  });
}
