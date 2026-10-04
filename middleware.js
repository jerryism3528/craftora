import { NextResponse } from 'next/server';

const D = 'craftora' + '.dev';
const MAIN = 'https://' + D;
const DL_HOST = 'download.' + D;
const GO_HOST = 'go.' + D;
const IMG_HOST = 'img.' + D;

function rewrite(req, path) {
  const url = req.nextUrl.clone();
  url.pathname = path;
  return NextResponse.rewrite(url);
}

export function middleware(req) {
  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase();
  const { pathname, search } = req.nextUrl;

  // ---------- download.craftora.dev ----------
  if (host === DL_HOST) {
    if (pathname.startsWith('/api/') || pathname.startsWith('/uploads/')) return NextResponse.next();
    if (pathname === '/robots.txt' || pathname === '/sitemap.xml') return rewrite(req, '/dl' + pathname);
    if (/\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next();
    if (pathname === '/dl' || pathname.startsWith('/dl/')) {
      return NextResponse.redirect(`https://${DL_HOST}${pathname.replace(/^\/dl/, '') || '/'}${search}`, 308);
    }
    return rewrite(req, '/dl' + (pathname === '/' ? '' : pathname));
  }

  // ---------- go.craftora.dev (short links) ----------
  if (host === GO_HOST) {
    if (pathname === '/robots.txt') return rewrite(req, '/go/robots.txt');
    const m = pathname.match(/^\/([A-Za-z0-9_-]{3,40})\/?$/);
    if (m) return rewrite(req, '/go/r/' + m[1]);
    return NextResponse.redirect(MAIN + '/url-shortener', 308);
  }

  // ---------- img.craftora.dev (image host) ----------
  if (host === IMG_HOST) {
    if (pathname.startsWith('/api/')) return NextResponse.next();
    if (pathname === '/robots.txt' || pathname === '/sitemap.xml') return rewrite(req, '/img' + pathname);
    if (pathname === '/explore') return rewrite(req, '/img/explore');
    let m = pathname.match(/^\/i\/([A-Za-z0-9]{4,40}\.(?:jpg|png|webp|gif))$/);
    if (m) return rewrite(req, '/img/file/' + m[1]);
    m = pathname.match(/^\/([A-Za-z0-9]{4,40})\/?$/);
    if (m) return rewrite(req, '/img/v/' + m[1]);
    if (/\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next();
    return NextResponse.redirect(MAIN + '/image-to-url', 308);
  }

  // ---------- main domain ----------
  if (pathname === '/dl' || pathname.startsWith('/dl/')) {
    return NextResponse.redirect(`https://${DL_HOST}${pathname.replace(/^\/dl/, '') || '/'}${search}`, 308);
  }
  if (/^\/(go|img)(\/|$)/.test(pathname)) return new NextResponse('Not found', { status: 404 });
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
