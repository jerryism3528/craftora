import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
});

const SITE_URL = 'https://craftora.dev';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Craftora: Free Online Tools That Just Work',
    template: '%s | Craftora',
  },
  description:
    'Craftora is a free online tools suite: merge PDF, compress images, convert files, verify emails, run SEO audits, and more. Privacy-first, no signup, no watermarks. Fast browser-based tools that just work.',
  keywords: [
    'free online tools',
    'pdf tools',
    'merge pdf',
    'compress pdf',
    'compress image',
    'image converter',
    'file converter',
    'email verifier',
    'seo tools',
    'invoice generator',
    'qr code generator',
    'json formatter',
    'craftora',
  ],
  applicationName: 'Craftora',
  authors: [{ name: 'Craftora' }],
  creator: 'Craftora',
  publisher: 'Craftora',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Craftora',
    title: 'Craftora: Free Online Tools That Just Work',
    description:
      'Free, privacy-first online tools. Merge PDF, compress images, convert files, verify emails, run SEO audits, and more. No signup, no watermarks.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Craftora: Free Online Tools That Just Work',
    description:
      'Free, privacy-first online tools. Merge PDF, compress images, convert files, verify emails, and more. No signup, no watermarks.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f8ff' },
    { media: '(prefers-color-scheme: dark)', color: '#11162d' },
  ],
  width: 'device-width',
  initialScale: 1,
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('craftora-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Craftora',
      url: SITE_URL,
      description:
        'Free, privacy-first online tools for PDFs, images, file conversion, email verification, SEO, and more.',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Craftora',
      description: 'Free online tools that just work.',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/all-tools?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
