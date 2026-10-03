import Link from 'next/link';
import { notFound } from 'next/navigation';
import DlHeader from '../../../components/dl/DlHeader';
import DlFooter from '../../../components/dl/DlFooter';
import DownloaderTool from '../../../components/dl/DownloaderTool';
import PlatformIcon from '../../../components/dl/PlatformIcon';
import { downloaders, liveDownloaders, getDownloader, DL_BASE } from '../../../lib/downloaders';

export function generateStaticParams() {
  return downloaders.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }) {
  const d = getDownloader(params.slug);
  if (!d) return {};
  const url = `${DL_BASE}/${d.slug}`;
  return {
    title: { absolute: d.title },
    description: d.description,
    keywords: d.keywords,
    alternates: { canonical: url },
    openGraph: { title: d.title, description: d.description, url, type: 'website', siteName: 'Craftora Downloader' },
    twitter: { card: 'summary', title: d.title, description: d.description },
  };
}

const COMMON = [
  ['Is it free?', 'Yes, completely free with no sign-up. Each visitor can download up to 20 files per hour to keep the service fast for everyone.'],
  ['Do you keep a copy of the video?', 'No. The file is fetched, sent straight to your device, and deleted from our server immediately.'],
  ['Where is the file saved?', 'On Android and PC it goes to your Downloads folder. On iPhone it goes to the Files app, where you can save it to Photos.'],
];

export default function DownloaderPage({ params }) {
  const d = getDownloader(params.slug);
  if (!d) notFound();
  const url = `${DL_BASE}/${d.slug}`;
  const faqs = [...d.faqs, ...COMMON];
  const audio = d.mode === 'audio';
  const steps = [
    [`Copy the ${d.brand} link`, `Open the post in ${d.brand}, tap Share, then Copy link.`],
    ['Paste and get the video', 'Paste the link into the box above and click Get video.'],
    [audio ? 'Download the MP3' : 'Pick quality and download', audio ? 'Choose Audio (MP3) and click Download.' : 'Choose the quality you want and click Download MP4.'],
  ];
  const features = [
    audio ? `Extract the audio from any public ${d.brand} video as MP3.` : `Download public ${d.brand} videos in HD MP4.`,
    'No app, no extension, no login needed.',
    'Works on iPhone, Android, Windows, and Mac.',
    'Choose video (MP4) or audio only (MP3).',
    'Files are never stored on our server.',
    'Free, with up to 20 downloads per hour.',
  ];
  const related = downloaders.filter((x) => x.slug !== d.slug).sort((a, b) => (b.platform === d.platform) - (a.platform === d.platform) || b.live - a.live).slice(0, 6);

  const schema = [
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: d.name, url, description: d.description, applicationCategory: 'MultimediaApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@context': 'https://schema.org', '@type': 'HowTo', name: `How to use the ${d.name}`, step: steps.map(([n, t], i) => ({ '@type': 'HowToStep', position: i + 1, name: n, text: t })) },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Video Downloader', item: DL_BASE },
      { '@type': 'ListItem', position: 2, name: d.name, item: url },
    ] },
  ];

  return (
    <div>
      <DlHeader />
      <main className="max-w-6xl mx-auto px-5">
        <nav className="pt-6 text-sm muted"><Link href="/" className="muted">Video Downloader</Link> / <span>{d.name}</span></nav>

        <section className="pt-6 pb-8 max-w-3xl">
          <div className="flex items-center gap-4">
            <PlatformIcon item={d} size={56} />
            <div>
              <h1 className="font-extrabold text-3xl sm:text-4xl leading-tight" style={{ color: 'var(--ink)' }}>{d.name}</h1>
              {!d.live && <span className="inline-block mt-2 text-xs font-bold uppercase px-2 py-0.5 rounded-md" style={{ background: 'var(--surface-soft)', color: 'var(--muted)' }}>Coming soon</span>}
            </div>
          </div>
          <p className="muted text-lg mt-4">{d.description}</p>
        </section>

        <DownloaderTool item={d} liveList={liveDownloaders} />

        <section className="mt-14">
          <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>How to use the {d.name}</h2>
          <ol className="grid sm:grid-cols-3 gap-4 mt-5">
            {steps.map(([t, s], i) => (
              <li key={t} className="border surface rounded-2xl p-5" style={{ background: 'var(--surface)' }}>
                <span className="brand-text font-extrabold">Step {i + 1}</span>
                <p className="font-bold mt-1" style={{ color: 'var(--ink)' }}>{t}</p>
                <p className="muted text-sm mt-1">{s}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14">
          <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>Features</h2>
          <ul className="grid sm:grid-cols-2 gap-3 mt-5">
            {features.map((f) => (
              <li key={f} className="border surface rounded-xl p-4 text-sm" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>{f}</li>
            ))}
          </ul>
        </section>

        <section className="mt-14 max-w-3xl">
          <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>{d.name}: FAQ</h2>
          <div className="mt-5 space-y-3">
            {faqs.map(([q, a]) => (
              <details key={q} className="border surface rounded-xl p-4" style={{ background: 'var(--surface)' }}>
                <summary className="font-semibold cursor-pointer" style={{ color: 'var(--ink)' }}>{q}</summary>
                <p className="muted text-sm mt-2 leading-6">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>More downloaders</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
            {related.map((r) => (
              <Link key={r.slug} href={`/${r.slug}`} className="border surface rounded-2xl p-4 flex items-start gap-3" style={{ background: 'var(--surface)' }}>
                <PlatformIcon item={r} size={38} />
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <strong className="text-sm" style={{ color: 'var(--ink)' }}>{r.name}</strong>
                    {!r.live && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md" style={{ background: 'var(--surface-soft)', color: 'var(--muted)' }}>Soon</span>}
                  </span>
                  <span className="block muted text-xs mt-1">{r.short}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <DlFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </div>
  );
}
