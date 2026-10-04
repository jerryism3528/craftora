import Link from 'next/link';
import { query } from '../../../lib/db';
import { imageUrls } from '../../../lib/images';
import ImgHeader from '../../../components/img/ImgHeader';

export const dynamic = 'force-dynamic';
const PER_PAGE = 48;
const MAIN = 'https://' + 'craftora.dev';

export const metadata = {
  title: { absolute: 'Explore Images | Craftora Image Hosting' },
  description: 'Browse the latest images uploaded to Craftora free image hosting.',
  robots: { index: false, follow: true },
};

export default async function ExplorePage({ searchParams }) {
  const page = Math.max(1, parseInt(searchParams?.page, 10) || 1);
  const rows = await query(
    `SELECT id, code, file, original_name, width, height FROM images
     WHERE NOT removed AND expires_at > now() ORDER BY created_at DESC LIMIT ${PER_PAGE + 1} OFFSET ${(page - 1) * PER_PAGE}`
  );
  const hasMore = rows.length > PER_PAGE;
  const items = rows.slice(0, PER_PAGE);

  return (
    <div>
      <ImgHeader />
      <main className="max-w-6xl mx-auto px-5 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="font-extrabold text-3xl" style={{ color: 'var(--ink)' }}>Explore images</h1>
            <p className="muted text-sm mt-1">The latest public uploads. See something that breaks the rules? Open it and click Report.</p>
          </div>
          <a href={`${MAIN}/image-to-url`} className="rounded-xl px-5 py-2.5 font-bold text-sm" style={{ background: 'var(--brand)', color: '#fff' }}>Upload an image</a>
        </div>

        {items.length === 0 ? (
          <p className="muted">No images yet. Be the first to upload one.</p>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {items.map((r) => {
              const u = imageUrls(r);
              return (
                <Link key={r.id} href={`/${r.code}`} className="block mb-3 rounded-xl overflow-hidden border surface" style={{ breakInside: 'avoid', background: 'var(--surface-soft)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u.direct} alt={r.original_name || 'Uploaded image'} loading="lazy" className="w-full h-auto block" />
                </Link>
              );
            })}
          </div>
        )}

        {(page > 1 || hasMore) && (
          <div className="flex justify-center gap-3 mt-8">
            {page > 1 && <Link href={`/explore?page=${page - 1}`} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={{ color: 'var(--ink)' }}>Newer</Link>}
            {hasMore && <Link href={`/explore?page=${page + 1}`} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={{ color: 'var(--ink)' }}>Older</Link>}
          </div>
        )}
      </main>
    </div>
  );
}
