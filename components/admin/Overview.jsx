'use client';

import { Users, UserPlus, Activity, Crown, Gauge, FileSignature, Flag, Bell, HardDrive, Heart, Image as ImageIcon, Link2 } from 'lucide-react';
import { useApi, Card, Stat, BarChart, Loading, ErrorBox, fmtNum, fmtBytes, Badge, STATUS_TONE } from './ui';

export default function Overview({ go }) {
  const { data, error, loading } = useApi('/api/admin/overview');
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox>{error}</ErrorBox>;
  const { users = {}, plans = [], usage = {}, series = [], topTools = [], seo = {}, docs = [], mod = {}, storage = {} } = data;
  const paid = plans.reduce((s, p) => s + p.n, 0);
  const docCount = (st) => docs.find((d) => d.status === st)?.n || 0;
  const maxTool = Math.max(1, ...topTools.map((t) => t.uses));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={Users} label="Users" value={fmtNum(users.total)} sub={`${fmtNum(users.new7d)} new this week`} onClick={() => go('users')} />
        <Stat icon={UserPlus} label="New today" value={fmtNum(users.new24h)} tone="teal" sub="Signups in the last 24 hours" />
        <Stat icon={Activity} label="Active today" value={fmtNum(usage.active24h)} tone="sky" sub={`${fmtNum(usage.uses24h)} tool uses`} onClick={() => go('activity')} />
        <Stat icon={Crown} label="Paid plans" value={fmtNum(paid)} tone="amber" sub={plans.map((p) => `${p.n} ${p.plan}`).join(', ') || 'None yet'} onClick={() => go('plans')} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={Flag} label="Open reports" value={fmtNum(mod.openreports)} tone={mod.openreports ? 'red' : 'emerald'} sub="Abuse reports to review" onClick={() => go('moderation')} />
        <Stat icon={Bell} label="Unread alerts" value={fmtNum(mod.unread)} tone={mod.unread ? 'amber' : 'emerald'} onClick={() => go('notifications')} />
        <Stat icon={Gauge} label="SEO audits" value={fmtNum(seo.total)} tone="indigo" sub={`${seo.running || 0} running, ${seo.failed7d || 0} failed this week`} onClick={() => go('seo')} />
        <Stat icon={FileSignature} label="Signer docs" value={fmtNum(docs.reduce((s, d) => s + d.n, 0))} tone="teal" sub={`${docCount('sent')} waiting, ${docCount('completed')} completed`} onClick={() => go('docs')} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Signups, last 30 days">
          <BarChart series={series.map((s) => ({ label: s.day.slice(5), value: s.signups }))} color="#0d9488" label="Signups" />
        </Card>
        <Card title="Tool uses, last 30 days">
          <BarChart series={series.map((s) => ({ label: s.day.slice(5), value: s.uses }))} label="Tool uses" />
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        <Card title="Top server tools, last 7 days">
          {topTools.length ? (
            <ul className="space-y-2.5">
              {topTools.map((t) => (
                <li key={t.tool_slug}>
                  <div className="flex justify-between text-sm"><span className="font-semibold text-slate-800 dark:text-slate-100">{t.tool_slug}</span><span className="text-slate-500 dark:text-slate-400">{fmtNum(t.uses)} uses · {fmtNum(t.users)} users</span></div>
                  <div className="h-2 mt-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${(t.uses / maxTool) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-500 dark:text-slate-400">No server tool usage this week.</p>}
        </Card>
        <div className="space-y-6">
          <Card title="Storage">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><HardDrive className="w-4 h-4" /> Signer documents</dt><dd className="font-semibold text-slate-900 dark:text-white">{fmtBytes(storage.docs?.bytes)} <span className="text-slate-400 font-normal">({fmtNum(storage.docs?.files)} files)</span></dd></div>
              <div className="flex justify-between gap-3"><dt className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><ImageIcon className="w-4 h-4" /> Hosted images</dt><dd className="font-semibold text-slate-900 dark:text-white">{fmtBytes(storage.images?.bytes)} <span className="text-slate-400 font-normal">({fmtNum(mod.images)} live)</span></dd></div>
              <div className="flex justify-between gap-3"><dt className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Link2 className="w-4 h-4" /> Short links</dt><dd className="font-semibold text-slate-900 dark:text-white">{fmtNum(mod.links)} active</dd></div>
            </dl>
          </Card>
          <Card title="Community">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Heart className="w-4 h-4 text-pink-500" /> Supporters</span>
              <span className="font-semibold text-slate-900 dark:text-white">{fmtNum(users.supporters)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-3">
              <span className="text-slate-600 dark:text-slate-300">Suspended accounts</span>
              <span className="font-semibold text-slate-900 dark:text-white">{fmtNum(users.suspended)}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {docs.map((d) => <Badge key={d.status} tone={STATUS_TONE[d.status]}>{d.status} {d.n}</Badge>)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
