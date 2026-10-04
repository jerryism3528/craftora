import { notFound } from 'next/navigation';
import { query, queryOne } from '../../../../lib/db';
import { imageUrls } from '../../../../lib/images';
import ImgHeader from '../../../../components/img/ImgHeader';
import EmbedCodes from '../../../../components/img/EmbedCodes';
import ReportButton from '../../../../components/img/ReportButton';

export const dynamic = 'force-dynamic';
const MAIN = 'https://' + 'craftora.dev';

async function getImage(code) {
  if (!/^[A-Za-z0-9]{4,40}$/.test(code)) return null;
  return queryOne('SELECT id, code, file, original_name, width, height, size_bytes, views, created_at FROM images WHERE code = $1 AND NOT removed AND expires_at > now()', [code]);
}

export async function generateMetadata({ params }) {
  const row = await getImage(params.code);
  if (!row) return { title: { absolute: 'Image not found | Craftora' }, robots: { index: false } };
  const u = imageUrls(row);
  const title = `${row.original_name || 'Image'} | Craftora Image Hosting`;
  return {
    title: { absolute: title },
    description: 'Image hosted free on Craftora. Upload your own image and get a shareable link in seconds.',
    robots: { index: false, follow: true },
    openGraph: { title, url: u.page, images: [{ url: u.direct, width: row.width, height: row.height }] },
    twitter: { card: 'summary_large_image', title, images: [u.direct] },
  };
}

export default async function ImageSharePage({ params }) {
  const row = await getImage(params.code);
  if (!row) notFound();
  await query('UPDATE images SET views = views + 1 WHERE id = $1', [row.id]);
  const u = imageUrls(row);
  const kb = row.size_bytes > 1048576 ? `${(row.size_bytes / 1048576).toFixed(1)} MB` : `${Math.round(row.size_bytes / 1024)} KB`;

  return (
    <div>
      <ImgHeader />
      <main className="max-w-5xl mx-auto px-5 py-8">
        <div className="rounded-2xl overflow-hidden border surface flex items-center justify-center" style={{ background: 'var(--surface-soft)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={u.direct} alt={row.original_name || 'Hosted image'} className="max-w-full max-h-[75vh] object-contain" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{row.original_name || 'Image'}</p>
            <p className="muted text-xs">{row.width} x {row.height} · {kb} · {row.views + 1} views · {new Date(row.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-4">
            <a href={u.direct} download className="text-xs font-bold brand-text">Download</a>
            <ReportButton type="image" code={row.code} />
          </div>
        </div>

        <div className="mt-6 border surface rounded-2xl p-5" style={{ background: 'var(--surface)' }}>
          <p className="text-xs font-bold uppercase tracking-wide muted mb-3">Share or embed this image</p>
          <EmbedCodes urls={u} />
        </div>

        <div className="mt-6 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4" style={{ background: 'var(--surface-soft)' }}>
          <div>
            <p className="font-bold" style={{ color: 'var(--ink)' }}>Hosted free on Craftora</p>
            <p className="muted text-sm">Upload your own image and get a link, HTML, Markdown, and BBCode in seconds.</p>
          </div>
          <a href={`${MAIN}/image-to-url`} className="rounded-xl px-5 py-2.5 font-bold text-sm" style={{ background: 'var(--brand)', color: '#fff' }}>Upload an image</a>
        </div>

        <p className="muted text-xs mt-6 leading-5">
          Images on Craftora are uploaded by users. If this image breaks our rules or your rights, use the Report button.
          More free tools: <a href={`${MAIN}/compress-image`} className="brand-text">Compress Image</a>, <a href={`${MAIN}/resize-image`} className="brand-text">Resize Image</a>, <a href={`${MAIN}/convert-image`} className="brand-text">Convert Image</a>, <a href={`${MAIN}/all-tools`} className="brand-text">all tools</a>.
        </p>
      </main>
    </div>
  );
}
