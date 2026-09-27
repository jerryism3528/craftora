'use client';

import { useState, useMemo } from 'react';
import * as Lucide from 'lucide-react';

const TYPES = ['Organization', 'LocalBusiness', 'Article', 'Product', 'FAQPage', 'BreadcrumbList'];

const FIELDS = {
  Organization: [['name', 'Organization name'], ['url', 'Website URL'], ['logo', 'Logo URL'], ['description', 'Short description'], ['sameAs', 'Social profile URLs (comma separated)']],
  LocalBusiness: [['name', 'Business name'], ['url', 'Website URL'], ['telephone', 'Phone number'], ['address', 'Street address'], ['city', 'City'], ['region', 'State/Region'], ['postalCode', 'Postal code'], ['country', 'Country code (e.g. US)']],
  Article: [['headline', 'Article headline'], ['author', 'Author name'], ['image', 'Image URL'], ['datePublished', 'Date published (YYYY-MM-DD)'], ['description', 'Short description'], ['url', 'Article URL']],
  Product: [['name', 'Product name'], ['image', 'Image URL'], ['description', 'Description'], ['brand', 'Brand'], ['price', 'Price (e.g. 19.99)'], ['currency', 'Currency (e.g. USD)'], ['url', 'Product URL']],
  FAQPage: [],
  BreadcrumbList: [],
};

function buildSchema(type, f, faqs, crumbs) {
  const base = { '@context': 'https://schema.org', '@type': type };
  if (type === 'Organization') {
    if (f.name) base.name = f.name;
    if (f.url) base.url = f.url;
    if (f.logo) base.logo = f.logo;
    if (f.description) base.description = f.description;
    if (f.sameAs) base.sameAs = f.sameAs.split(',').map((s) => s.trim()).filter(Boolean);
  } else if (type === 'LocalBusiness') {
    if (f.name) base.name = f.name;
    if (f.url) base.url = f.url;
    if (f.telephone) base.telephone = f.telephone;
    const addr = {};
    if (f.address) addr.streetAddress = f.address;
    if (f.city) addr.addressLocality = f.city;
    if (f.region) addr.addressRegion = f.region;
    if (f.postalCode) addr.postalCode = f.postalCode;
    if (f.country) addr.addressCountry = f.country;
    if (Object.keys(addr).length) { addr['@type'] = 'PostalAddress'; base.address = addr; }
  } else if (type === 'Article') {
    if (f.headline) base.headline = f.headline;
    if (f.author) base.author = { '@type': 'Person', name: f.author };
    if (f.image) base.image = f.image;
    if (f.datePublished) base.datePublished = f.datePublished;
    if (f.description) base.description = f.description;
    if (f.url) base.mainEntityOfPage = f.url;
  } else if (type === 'Product') {
    if (f.name) base.name = f.name;
    if (f.image) base.image = f.image;
    if (f.description) base.description = f.description;
    if (f.brand) base.brand = { '@type': 'Brand', name: f.brand };
    if (f.price) {
      base.offers = { '@type': 'Offer', price: f.price, priceCurrency: f.currency || 'USD' };
      if (f.url) base.offers.url = f.url;
    }
  } else if (type === 'FAQPage') {
    base.mainEntity = faqs.filter((q) => q.q && q.a).map((q) => ({
      '@type': 'Question',
      name: q.q,
      acceptedAnswer: { '@type': 'Answer', text: q.a },
    }));
  } else if (type === 'BreadcrumbList') {
    base.itemListElement = crumbs.filter((c) => c.name).map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url || undefined,
    }));
  }
  return base;
}

export default function SchemaGeneratorTool() {
  const [type, setType] = useState('Organization');
  const [f, setF] = useState({});
  const [faqs, setFaqs] = useState([{ q: '', a: '' }]);
  const [crumbs, setCrumbs] = useState([{ name: '', url: '' }]);
  const [copied, setCopied] = useState(false);

  function set(key, val) { setF((x) => ({ ...x, [key]: val })); }

  const output = useMemo(() => {
    const schema = buildSchema(type, f, faqs, crumbs);
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
  }, [type, f, faqs, crumbs]);

  function copyOutput() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Schema type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent mb-5" style={{ color: 'var(--ink)' }}>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        {FIELDS[type].length > 0 && (
          <div className="space-y-3">
            {FIELDS[type].map(([k, label]) => (
              <div key={k}>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>{label}</label>
                <input value={f[k] || ''} onChange={(e) => set(k, e.target.value)} className="w-full rounded-xl border surface px-4 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
              </div>
            ))}
          </div>
        )}

        {type === 'FAQPage' && (
          <div className="space-y-4">
            {faqs.map((item, i) => (
              <div key={i} className="border surface rounded-xl p-3">
                <input value={item.q} onChange={(e) => setFaqs(faqs.map((x, j) => j === i ? { ...x, q: e.target.value } : x))} placeholder="Question" className="w-full rounded-lg border surface px-3 py-2 text-sm bg-transparent mb-2" style={{ color: 'var(--ink)' }} />
                <textarea value={item.a} onChange={(e) => setFaqs(faqs.map((x, j) => j === i ? { ...x, a: e.target.value } : x))} placeholder="Answer" rows={2} className="w-full rounded-lg border surface px-3 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
              </div>
            ))}
            <button onClick={() => setFaqs([...faqs, { q: '', a: '' }])} className="text-sm font-semibold brand-text inline-flex items-center gap-1"><Lucide.Plus className="w-4 h-4" /> Add question</button>
          </div>
        )}

        {type === 'BreadcrumbList' && (
          <div className="space-y-3">
            {crumbs.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input value={item.name} onChange={(e) => setCrumbs(crumbs.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder={`Level ${i + 1} name`} className="flex-1 rounded-lg border surface px-3 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
                <input value={item.url} onChange={(e) => setCrumbs(crumbs.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} placeholder="URL" className="flex-1 rounded-lg border surface px-3 py-2 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
              </div>
            ))}
            <button onClick={() => setCrumbs([...crumbs, { name: '', url: '' }])} className="text-sm font-semibold brand-text inline-flex items-center gap-1"><Lucide.Plus className="w-4 h-4" /> Add level</button>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>JSON-LD output</label>
          <button onClick={copyOutput} className="text-sm font-semibold brand-text inline-flex items-center gap-1">
            {copied ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>
        <pre className="border surface rounded-xl p-4 text-xs leading-5 overflow-x-auto whitespace-pre-wrap break-all" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>{output}</pre>
        <p className="muted text-xs mt-3">Paste this into the &lt;head&gt; of your page. Generated in your browser, nothing is uploaded.</p>
      </div>
    </div>
  );
}
