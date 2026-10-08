import { queryOne } from '../../../../../../lib/db';
import { readDocFile } from '../../../../../../lib/signer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(params.token || '')) return new Response('Not found', { status: 404 });
  const row = await queryOne('SELECT d.id, d.title, d.status FROM sign_signers s JOIN sign_docs d ON d.id = s.doc_id WHERE s.token = $1', [params.token]);
  if (!row) return new Response('Not found', { status: 404 });
  if (['voided'].includes(row.status)) return new Response('This document was voided by the sender.', { status: 410 });
  const type = row.status === 'completed' ? 'final' : 'original';
  let bytes;
  try { bytes = await readDocFile(row.id, type); } catch { return new Response('File missing', { status: 404 }); }
  const download = new URL(req.url).searchParams.get('download');
  const name = `${row.title.replace(/[^\w\- ]+/g, '').trim() || 'document'}${type === 'final' ? ' (signed)' : ''}.pdf`;
  return new Response(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${name}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
