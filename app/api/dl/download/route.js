import { hit, ipOf } from '../../../../lib/iplimit';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const lim = hit('dl:' + ipOf(req), 20, 3600000);
  if (!lim.ok) return Response.json({ ok: false, error: `You've reached 20 downloads this hour. Please try again in ${lim.retryMin} minutes.` }, { status: 429 });

  let body;
  try { body = await req.json(); } catch (e) { return Response.json({ ok: false, error: 'Invalid request.' }, { status: 400 }); }
  const url = String(body.url || '').trim().slice(0, 2000);
  const kind = body.kind === 'audio' ? 'audio' : 'video';
  const height = Math.max(144, Math.min(parseInt(body.height, 10) || 1080, 2160));

  let res;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 900000);
    res = await fetch('http://downloader:8000/download', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, kind, height }), signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (e) {
    return Response.json({ ok: false, error: 'The download took too long or the server is busy. Please try again.' }, { status: 502 });
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return Response.json({ ok: false, error: data.detail || 'Download failed.' }, { status: 422 });
  }

  const headers = { 'Content-Type': res.headers.get('content-type') || 'application/octet-stream', 'Content-Disposition': 'attachment', 'Cache-Control': 'no-store' };
  const len = res.headers.get('content-length');
  if (len) headers['Content-Length'] = len;
  return new Response(res.body, { headers });
}
