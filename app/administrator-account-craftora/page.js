'use client';

import { useCallback, useEffect, useState } from 'react';
import { LayoutDashboard, Users, Heart, Crown, SlidersHorizontal, Flag, Gauge, FileSignature, Bell, Activity, Newspaper, ShieldCheck, ExternalLink } from 'lucide-react';
import Header from '../../components/Header';
import { tools as CATALOG } from '../../lib/tools';
import Overview from '../../components/admin/Overview';
import UsersSection from '../../components/admin/Users';
import PlansSection from '../../components/admin/Plans';
import WallSection from '../../components/admin/Wall';
import ToolsSection from '../../components/admin/Tools';
import ModerationSection from '../../components/admin/Moderation';
import SeoSection from '../../components/admin/SeoAudits';
import DocsSection from '../../components/admin/Documents';
import NotificationsSection from '../../components/admin/Notifications';
import ActivitySection from '../../components/admin/Activity';
import ArticlesTab from '../../components/admin/Articles';

const NAV = [
  ['overview', 'Overview', LayoutDashboard, 'Site health at a glance'],
  ['users', 'Users', Users, 'Search, manage plans, suspend, and block tools'],
  ['plans', 'Plans and backers', Crown, 'Plan limits, Kickstarter tiers, and backer import'],
  ['wall', 'Supporters wall', Heart, 'Names and photos on the public Founding Supporters page'],
  ['tools', 'Tools and limits', SlidersHorizontal, 'Daily limits and on/off switches for server tools'],
  ['moderation', 'Moderation', Flag, 'Abuse reports, hosted images, and short links'],
  ['seo', 'SEO audits', Gauge, 'Full-site audits across all users'],
  ['docs', 'Documents', FileSignature, 'Craftora Sign documents and storage cleanup'],
  ['notifications', 'Notifications', Bell, 'System alerts'],
  ['activity', 'Activity', Activity, 'Tool usage and admin audit trail'],
  ['articles', 'Articles', Newspaper, 'Insights blog posts'],
];
const TOOLS = CATALOG.map((t) => ({ slug: t.slug, name: t.name, engine: t.engine }));

export default function AdminPage() {
  const [tab, setTab] = useState('overview');
  const [badges, setBadges] = useState({});

  useEffect(() => {
    const h = window.location.hash.replace('#', '');
    if (NAV.some(([k]) => k === h)) setTab(h);
    const onHash = () => { const x = window.location.hash.replace('#', ''); if (NAV.some(([k]) => k === x)) setTab(x); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = useCallback((k) => { setTab(k); if (typeof window !== 'undefined') history.replaceState(null, '', `#${k}`); window.scrollTo({ top: 0 }); }, []);

  const loadBadges = useCallback(async () => {
    try {
      const [n, m] = await Promise.all([
        fetch('/api/admin/notifications?unread=1', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/admin/moderation?type=reports', { cache: 'no-store' }).then((r) => r.json()),
      ]);
      const open = (m.counts || []).find((c) => c.status === 'open')?.n || 0;
      let wall = 0;
      try { const w = await fetch('/api/admin/wall?show=photos', { cache: 'no-store' }).then((r) => r.json()); wall = w.pendingPhotos || 0; } catch {}
      setBadges({ notifications: n.unread || 0, moderation: open, wall });
    } catch {}
  }, []);
  useEffect(() => { loadBadges(); const t = setInterval(loadBadges, 60000); return () => clearInterval(t); }, [loadBadges]);

  const current = NAV.find(([k]) => k === tab) || NAV[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 lg:py-8 lg:grid lg:grid-cols-[230px_1fr] lg:gap-8">
        <aside className="lg:sticky lg:top-20 lg:self-start mb-6 lg:mb-0">
          <div className="flex items-center gap-2 mb-4 px-1">
            <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span className="font-extrabold text-lg text-slate-900 dark:text-white">Craftora Admin</span>
          </div>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0" aria-label="Admin sections">
            {NAV.map(([k, label, Icon]) => (
              <button key={k} onClick={() => go(k)} aria-current={tab === k ? 'page' : undefined}
                className={`flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition ${tab === k ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'}`}>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {badges[k] > 0 && <span className={`text-[11px] font-bold rounded-full px-1.5 min-w-[20px] text-center ${tab === k ? 'bg-white/25 text-white' : 'bg-red-500 text-white'}`}>{badges[k]}</span>}
              </button>
            ))}
          </nav>
          <a href="/" className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 mt-6 px-3"><ExternalLink className="w-3.5 h-3.5" />View site</a>
        </aside>

        <main className="min-w-0">
          <div className="mb-5">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{current[1]}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{current[3]}</p>
          </div>
          {tab === 'overview' && <Overview go={go} />}
          {tab === 'users' && <UsersSection tools={TOOLS} />}
          {tab === 'plans' && <PlansSection />}
          {tab === 'wall' && <WallSection />}
          {tab === 'tools' && <ToolsSection />}
          {tab === 'moderation' && <ModerationSection />}
          {tab === 'seo' && <SeoSection />}
          {tab === 'docs' && <DocsSection />}
          {tab === 'notifications' && <NotificationsSection onChange={loadBadges} go={go} />}
          {tab === 'activity' && <ActivitySection tools={TOOLS} />}
          {tab === 'articles' && <ArticlesTab />}
        </main>
      </div>
    </div>
  );
}
