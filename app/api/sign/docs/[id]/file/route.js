import { currentUser } from '../../../../../../lib/current-user';
import { queryOne } from '../../../../../../lib/db';
import { readDocFile } from '../../../../../../lib/signer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const user = await currentUser();
  if (!user) return new Response('Please sign in.', { status: 401 });
  const doc = await queryOne('SELECT id, user_id, title, status FROM sign_docs WHERE id = $1', [params.id]);
  if (!doc || doc.user_id !== user.id) return new Response('Not found', { status: 404 });
  const url = new URL(req.url);
  const type = url.searchParams.get('type') === 'final' ? 'final' : 'original';
  if (type === 'final' && doc.status !== 'completed') return new Response('Not completed yet', { status: 404 });
  let bytes;
  try { bytes = await readDocFile(doc.id, type); } catch { return new Response('File missing', { status: 404 }); }
  const name = `${doc.title.replace(/[^\w\- ]+/g, '').trim() || 'document'}${type === 'final' ? ' (signed)' : ''}.pdf`;
  return new Response(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${url.searchParams.get('download') ? 'attachment' : 'inline'}; filename="${name}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
