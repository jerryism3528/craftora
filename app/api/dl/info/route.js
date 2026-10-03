import { hit, ipOf } from '../../../../lib/iplimit';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const lim = hit('dlinfo:' + ipOf(req), 60, 3600000);
  if (!lim.ok) return Response.json({ ok: false, error: `Too many requests. Please try again in ${lim.retryMin} minutes.` }, { status: 429 });

  let body;
  try { body = await req.json(); } catch (e) { return Response.json({ ok: false, error: 'Invalid request.' }, { status: 400 }); }
  const url = String(body.url || '').trim().slice(0, 2000);
  if (!url) return Response.json({ ok: false, error: 'Paste a link first.' }, { status: 400 });

  try {
    const res = await fetch('http://downloader:8000/info', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return Response.json({ ok: false, error: data.detail || 'Could not fetch this link.' }, { status: res.status === 400 ? 400 : 422 });
    return Response.json({ ok: true, ...data });
  } catch (e) {
    return Response.json({ ok: false, error: 'The downloader is busy right now. Please try again in a moment.' }, { status: 502 });
  }
}
