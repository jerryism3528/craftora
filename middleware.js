import { NextResponse } from 'next/server';

const DL_HOST = 'download.' + 'craftora.dev';

export function middleware(req) {
  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase();
  const { pathname, search } = req.nextUrl;

  if (host === DL_HOST) {
    // API calls and uploads work as normal.
    if (pathname.startsWith('/api/') || pathname.startsWith('/uploads/')) return NextResponse.next();
    // The subdomain gets its own robots.txt and sitemap.
    if (pathname === '/robots.txt' || pathname === '/sitemap.xml') {
      const url = req.nextUrl.clone();
      url.pathname = '/dl' + pathname;
      return NextResponse.rewrite(url);
    }
    // Other files (favicons, images) come from the shared public folder.
    if (/\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next();
    // Never expose the internal /dl prefix.
    if (pathname === '/dl' || pathname.startsWith('/dl/')) {
      return NextResponse.redirect(`https://${DL_HOST}${pathname.replace(/^\/dl/, '') || '/'}${search}`, 308);
    }
    const url = req.nextUrl.clone();
    url.pathname = '/dl' + (pathname === '/' ? '' : pathname);
    return NextResponse.rewrite(url);
  }

  // Main domain: downloader pages only live on the subdomain.
  if (pathname === '/dl' || pathname.startsWith('/dl/')) {
    return NextResponse.redirect(`https://${DL_HOST}${pathname.replace(/^\/dl/, '') || '/'}${search}`, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
