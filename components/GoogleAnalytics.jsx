'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Google Analytics 4. Page views are sent by hand with a cleaned URL so private links
// (signing links, reports, billing returns, admin) never reach Google.
export const GA_ID = 'G-T3P06S81DB';

const PRIVATE = [
  '/administrator-account-craftora', '/sign/', '/account', '/billing', '/seo-report/',
  '/img/', '/go/', '/dl/', '/uploads/', '/login', '/signup', '/forgot-password', '/profile',
];
const KEEP_QUERY = { '/all-tools': ['q'] };
// Campaign tags (for example from outreach emails) are kept on every public page so GA can attribute visits.
const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];

const isPrivate = (p) => PRIVATE.some((x) => p === x.replace(/\/$/, '') || p.startsWith(x));

function load() {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

export default function GoogleAnalytics() {
  const pathname = usePathname() || '/';
  const search = useSearchParams();
  const last = useRef('');

  useEffect(() => {
    if (isPrivate(pathname)) return;
    const keep = [...(KEEP_QUERY[pathname] || []), ...UTM];
    const q = new URLSearchParams();
    keep.forEach((k) => { const v = search?.get(k); if (v) q.set(k, v.slice(0, 100)); });
    const path = pathname + (q.toString() ? `?${q}` : '');
    if (last.current === path) return;
    last.current = path;
    load();
    // Wait a tick so document.title reflects the new page.
    const t = setTimeout(() => {
      window.gtag('event', 'page_view', { page_location: `${window.location.origin}${path}`, page_path: path, page_title: document.title });
    }, 50);
    return () => clearTimeout(t);
  }, [pathname, search]);

  return null;
}
