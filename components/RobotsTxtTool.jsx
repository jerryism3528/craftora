'use client';

import { useState, useMemo } from 'react';
import * as Lucide from 'lucide-react';

const PRESETS = {
  allowAll: { label: 'Allow all crawlers', rules: [{ agent: '*', allow: [''], disallow: [] }] },
  blockAll: { label: 'Block all crawlers', rules: [{ agent: '*', allow: [], disallow: ['/'] }] },
  wordpress: { label: 'WordPress defaults', rules: [{ agent: '*', allow: ['/wp-admin/admin-ajax.php'], disallow: ['/wp-admin/'] }] },
};

export default function RobotsTxtTool() {
  const [agent, setAgent] = useState('*');
  const [disallow, setDisallow] = useState('');
  const [allow, setAllow] = useState('');
  const [crawlDelay, setCrawlDelay] = useState('');
  const [sitemap, setSitemap] = useState('');
  const [copied, setCopied] = useState(false);

  function applyPreset(key) {
    const p = PRESETS[key];
    const r = p.rules[0];
    setAgent(r.agent);
    setDisallow(r.disallow.join('\n'));
    setAllow(r.allow.join('\n'));
  }

  const output = useMemo(() => {
    const lines = [];
    lines.push(`User-agent: ${agent || '*'}`);
    allow.split('\n').map((l) => l.trim()).filter(Boolean).forEach((p) => lines.push(`Allow: ${p}`));
    disallow.split('\n').map((l) => l.trim()).filter(Boolean).forEach((p) => lines.push(`Disallow: ${p}`));
    if (crawlDelay) lines.push(`Crawl-delay: ${crawlDelay}`);
    if (sitemap) { lines.push(''); lines.push(`Sitemap: ${sitemap}`); }
    return lines.join('\n');
  }, [agent, disallow, allow, crawlDelay, sitemap]);

  function copyOutput() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function download() {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Quick presets</label>
        <div className="flex flex-wrap gap-2 mb-5">
          {Object.entries(PRESETS).map(([k, p]) => (
            <button key={k} onClick={() => applyPreset(k)} className="rounded-lg px-3 py-2 text-sm font-semibold border surface" style={{ color: 'var(--ink)' }}>{p.label}</button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>User-agent</label>
            <input value={agent} onChange={(e) => setAgent(e.target.value)} placeholder="* (all crawlers)" className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent font-mono" style={{ color: 'var(--ink)' }} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Disallow paths (one per line)</label>
            <textarea value={disallow} onChange={(e) => setDisallow(e.target.value)} rows={4} placeholder={"/admin/\n/private/"} className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent font-mono" style={{ color: 'var(--ink)' }} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Allow paths (one per line)</label>
            <textarea value={allow} onChange={(e) => setAllow(e.target.value)} rows={2} placeholder="/public/" className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent font-mono" style={{ color: 'var(--ink)' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Crawl-delay (optional)</label>
              <input value={crawlDelay} onChange={(e) => setCrawlDelay(e.target.value)} placeholder="e.g. 10" className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent" style={{ color: 'var(--ink)' }} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>Sitemap URL (optional)</label>
            <input value={sitemap} onChange={(e) => setSitemap(e.target.value)} placeholder="https://example.com/sitemap.xml" className="w-full rounded-xl border surface px-4 py-2.5 text-sm bg-transparent font-mono" style={{ color: 'var(--ink)' }} />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>robots.txt output</label>
          <div className="flex gap-3">
            <button onClick={copyOutput} className="text-sm font-semibold brand-text inline-flex items-center gap-1">
              {copied ? <><Lucide.Check className="w-4 h-4" /> Copied</> : <><Lucide.Copy className="w-4 h-4" /> Copy</>}
            </button>
            <button onClick={download} className="text-sm font-semibold brand-text inline-flex items-center gap-1"><Lucide.Download className="w-4 h-4" /> Download</button>
          </div>
        </div>
        <pre className="border surface rounded-xl p-4 text-sm leading-6 overflow-x-auto whitespace-pre-wrap" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>{output}</pre>
        <p className="muted text-xs mt-3">Save this as robots.txt in the root of your website (example.com/robots.txt). Generated in your browser.</p>
      </div>
    </div>
  );
}
