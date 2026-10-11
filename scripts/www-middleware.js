import { NextResponse } from 'next/server';

// Send every www.craftora.dev request to craftora.dev with a permanent (301) redirect,
// so Google only ever sees one version of each page.
export function middleware(request) {
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').toLowerCase();
  if (host.startsWith('www.')) {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://' + host.slice(4).split(':')[0]);
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
