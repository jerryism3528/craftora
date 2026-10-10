'use client';

import { useEffect, useState } from 'react';
import { Search, ShieldCheck, Heart, Ban, RotateCcw, Trash2, UserX, UserCheck, Crown, Lock, X, Mail } from 'lucide-react';
import { useApi, post, useToast, useDebounced, Card, Table, Badge, PlanBadge, Btn, Drawer, Field, Loading, ErrorBox, Empty, Pager, inputCls, fmtDate, fmtNum, fmtBytes, ago } from './ui';

export default function UsersSection({ tools }) {
  const [q, setQ] = useState('');
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const dq = useDebounced(q);
  useEffect(() => { setPage(1); }, [dq, plan, status]);
  const url = `/api/admin/users?q=${encodeURIComponent(dq)}&plan=${plan}&status=${status}&page=${page}`;
  const { data, error, loading, reload } = useApi(url);

  return (
    <Card pad>
      <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email or username" className={`${inputCls} pl-9`} aria-label="Search users" />
        </div>
        <select value={plan} onChange={(e) => setPlan(e.target.value)} className={`${inputCls} lg:w-40`} aria-label="Filter by plan">
          <option value="">All plans</option><option value="paid">Any paid plan</option><option value="free">Free</option><option value="pro">Pro</option><option value="business">Business</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} lg:w-40`} aria-label="Filter by status">
          <option value="">All statuses</option><option value="supporter">Supporters</option><option value="suspended">Suspended</option><option value="admin">Admins</option>
        </select>
        <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0 lg:ml-2">{data ? `${fmtNum(data.total)} users` : ''}</span>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      {loading && !data ? <Loading /> : data && (
        <>
          <Table head={['User', 'Plan', 'Joined', 'Last active', { label: 'Uses 7d', right: true }, '']}>
            {data.users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer" onClick={() => setOpen(u.id)}>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">{(u.username || u.email).slice(0, 1).toUpperCase()}</span>
                    <div className="min-w-0">
                      <div className="font-semibold truncate flex items-center gap-1.5">{u.username || '(no username)'}
                        {u.is_admin && <Badge tone="indigo"><ShieldCheck className="w-3 h-3" />Admin</Badge>}
                        {u.is_supporter && <Heart className="w-3.5 h-3.5 text-pink-500" aria-label="Supporter" />}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3"><div className="flex flex-wrap gap-1"><PlanBadge plan={u.plan} expires={u.plan_expires_at} />{u.suspended && <Badge tone="red">Suspended</Badge>}{u.blocked_tools?.length > 0 && <Badge tone="amber">{u.blocked_tools.length} blocked</Badge>}</div></td>
                <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{fmtDate(u.created_at)}</td>
                <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{ago(u.last_active)}</td>
                <td className="py-2.5 px-3 text-right font-semibold">{fmtNum(u.uses7d)}</td>
                <td className="py-2.5 px-3 text-right"><span className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold">Manage</span></td>
              </tr>
            ))}
          </Table>
          {!data.users.length && <Empty>No users match these filters.</Empty>}
          <Pager page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
      <UserDrawer id={open} onClose={() => setOpen(null)} onChanged={reload} tools={tools} />
    </Card>
  );
}

function UserDrawer({ id, onClose, onChanged, tools }) {
  const { data, error, loading, reload } = useApi(id ? `/api/admin/users/${id}` : null);
  const [toast, show] = useToast();
  const [busy, setBusy] = useState('');
  const [planForm, setPlanForm] = useState({ plan: 'free', mode: 'lifetime', months: 12, date: '' });
  const [tier, setTier] = useState('');
  const [tiers, setTiers] = useState([]);
  const [note, setNote] = useState('');
  const [blockTool, setBlockTool] = useState('');
  const [suspendDays, setSuspendDays] = useState(7);
  const [supporterName, setSupporterName] = useState('');
  const [wall, setWall] = useState({ show: true, sponsorUrl: '', sponsorLogo: '' });

  useEffect(() => {
    if (!data?.user) return;
    const u = data.user;
    setPlanForm({ plan: u.active_plan, mode: u.plan_expires_at ? 'date' : 'lifetime', months: 12, date: u.plan_expires_at ? String(u.plan_expires_at).slice(0, 10) : '' });
    setNote(u.admin_note || '');
    setSupporterName(u.supporter_name || '');
    setWall({ show: u.show_on_wall !== false, sponsorUrl: u.sponsor_url || '', sponsorLogo: u.sponsor_logo || '' });
  }, [data]);
  useEffect(() => { if (id) fetch('/api/admin/plans').then((r) => r.json()).then((d) => setTiers(d.tiers || [])).catch(() => {}); }, [id]);

  async function act(action, extra = {}, confirmText) {
    if (confirmText && !confirm(confirmText)) return;
    setBusy(action);
    const r = await post('/api/admin/users', { action, userId: id, ...extra });
    setBusy('');
    show(r);
    if (r.ok !== false) { if (action === 'delete') { onClose(); onChanged(); return; } reload(); onChanged(); }
  }

  const u = data?.user;
  return (
    <Drawer open={!!id} onClose={onClose} title={u ? u.email : 'User'} wide>
      {toast}
      {error && <ErrorBox>{error}</ErrorBox>}
      {loading && !data ? <Loading /> : u && (
        <>
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xl font-extrabold shrink-0">{(u.username || u.email).slice(0, 1).toUpperCase()}</span>
              <div className="min-w-0 flex-1">
                <div className="text-lg font-extrabold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">{u.username || '(no username)'} <PlanBadge plan={u.active_plan} expires={u.plan_expires_at} /> {u.is_admin && <Badge tone="indigo">Admin</Badge>} {u.suspended && <Badge tone="red">Suspended until {fmtDate(u.suspended_until)}</Badge>} {u.is_supporter && <Badge tone="red"><Heart className="w-3 h-3" />Supporter</Badge>}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{u.email} {u.email_verified ? <Badge tone="emerald">verified</Badge> : <Badge tone="amber">unverified</Badge>}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Joined {fmtDate(u.created_at, true)} · Sign-in: {[u.has_password && 'password', ...data.providers].filter(Boolean).join(', ') || 'none'}{u.reward_tier && ` · Reward: ${u.reward_tier}`}{u.plan_source && ` · Plan source: ${u.plan_source}`}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 text-center">
              {[['SEO audits', data.counts.audits], ['Documents', data.counts.docs], ['Doc storage', fmtBytes(data.counts.doc_bytes)], ['Images', data.counts.images], ['Short links', data.counts.links]].map(([l, v]) => (
                <div key={l} className="rounded-xl bg-slate-50 dark:bg-slate-900 p-2.5"><div className="font-extrabold text-slate-900 dark:text-white">{v ?? 0}</div><div className="text-[11px] text-slate-500 dark:text-slate-400">{l}</div></div>
              ))}
            </div>
          </Card>

          <Card title={<span className="flex items-center gap-2"><Crown className="w-4 h-4 text-amber-500" />Plan</span>}>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Plan">
                <select value={planForm.plan} onChange={(e) => setPlanForm({ ...planForm, plan: e.target.value })} className={inputCls}>
                  <option value="free">Free</option><option value="pro">Pro</option><option value="business">Business</option>
                </select>
              </Field>
              {planForm.plan !== 'free' && (
                <Field label="Duration">
                  <select value={planForm.mode} onChange={(e) => setPlanForm({ ...planForm, mode: e.target.value })} className={inputCls}>
                    <option value="lifetime">Lifetime</option><option value="months">Number of months</option><option value="date">Until a date</option>
                  </select>
                </Field>
              )}
              {planForm.plan !== 'free' && planForm.mode === 'months' && <Field label="Months"><input type="number" min="1" max="120" value={planForm.months} onChange={(e) => setPlanForm({ ...planForm, months: e.target.value })} className={inputCls} /></Field>}
              {planForm.plan !== 'free' && planForm.mode === 'date' && <Field label="Ends on"><input type="date" value={planForm.date} onChange={(e) => setPlanForm({ ...planForm, date: e.target.value })} className={inputCls} /></Field>}
            </div>
            <div className="mt-3"><Btn tone="primary" busy={busy === 'set_plan'} onClick={() => act('set_plan', planForm)}>Save plan</Btn></div>
            <div className="border-t border-slate-200 dark:border-slate-700 mt-4 pt-4">
              <Field label="Apply a Kickstarter reward tier" hint="Adds the tier's plan on top of what they have. Never downgrades.">
                <div className="flex gap-2">
                  <select value={tier} onChange={(e) => setTier(e.target.value)} className={inputCls}>
                    <option value="">Choose a tier</option>
                    {tiers.map((t) => <option key={t.key} value={t.key}>{t.name} (${t.price_usd})</option>)}
                  </select>
                  <Btn disabled={!tier} busy={busy === 'apply_tier'} onClick={() => act('apply_tier', { tier })}>Apply</Btn>
                </div>
              </Field>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 mt-4 pt-4 space-y-3">
              <div className="flex items-center justify-between gap-2"><span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Heart className="w-4 h-4 text-pink-500" />Supporters wall</span><a href="/supporters" target="_blank" rel="noreferrer" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">View wall</a></div>
              <div className="grid sm:grid-cols-[1fr_auto] gap-2 items-end">
                <Field label="Name on the wall"><input value={supporterName} onChange={(e) => setSupporterName(e.target.value)} placeholder={u.username || ''} className={inputCls} /></Field>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 pb-2"><input type="checkbox" checked={wall.show} onChange={(e) => setWall({ ...wall, show: e.target.checked })} /> Show publicly</label>
              </div>
              <details open={!!(wall.sponsorUrl || wall.sponsorLogo || u.reward_tier === 'sponsor')}>
                <summary className="text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">Sponsor link and logo</summary>
                <div className="grid sm:grid-cols-2 gap-2 mt-2">
                  <Field label="Website link" hint="Shown as a sponsored link"><input value={wall.sponsorUrl} onChange={(e) => setWall({ ...wall, sponsorUrl: e.target.value })} placeholder="https://example.com" className={inputCls} /></Field>
                  <Field label="Logo" hint="PNG, JPG, or WebP under 3 MB. A wide logo works best.">
                    <div className="flex gap-2 items-center">
                      {wall.sponsorLogo && <img src={wall.sponsorLogo} alt="" className="h-9 w-16 object-contain rounded bg-white border border-slate-200 dark:border-slate-600" />}
                      <input value={wall.sponsorLogo} onChange={(e) => setWall({ ...wall, sponsorLogo: e.target.value })} placeholder="/uploads/logo.png" className={inputCls} />
                      <label className="shrink-0 cursor-pointer inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700">
                        {busy === 'logo' ? 'Uploading...' : 'Upload'}
                        <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={async (e) => {
                          const f = e.target.files?.[0]; if (!f) return;
                          setBusy('logo');
                          const fd = new FormData(); fd.append('file', f);
                          try { const r = await fetch('/api/admin/upload', { method: 'POST', body: fd }).then((x) => x.json()); if (r.ok) setWall((w) => ({ ...w, sponsorLogo: r.url })); else show(r); } catch { show({ ok: false, error: 'Upload failed.' }); }
                          setBusy('');
                        }} />
                      </label>
                    </div>
                  </Field>
                </div>
              </details>
              <div className="flex gap-2">
                <Btn busy={busy === 'set_supporter'} onClick={() => act('set_supporter', { supporter: true, supporterName, showOnWall: wall.show, sponsorUrl: wall.sponsorUrl, sponsorLogo: wall.sponsorLogo })}><Heart className="w-4 h-4" />{u.is_supporter ? 'Save listing' : 'Make supporter'}</Btn>
                {u.is_supporter && <Btn tone="ghost" onClick={() => act('set_supporter', { supporter: false }, 'Remove supporter status? They disappear from the wall.')}>Remove supporter</Btn>}
              </div>
            </div>
          </Card>

          {!u.is_admin && (
            <Card title={<span className="flex items-center gap-2"><Lock className="w-4 h-4 text-red-500" />Access</span>}>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Blocked tools</div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {data.blocks.length ? data.blocks.map((b) => (
                      <span key={b.tool_slug} className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300">{b.tool_slug}
                        <button onClick={() => act('unblock_tool', { tool: b.tool_slug })} aria-label={`Unblock ${b.tool_slug}`}><X className="w-3 h-3" /></button></span>
                    )) : <span className="text-sm text-slate-500 dark:text-slate-400">None</span>}
                  </div>
                  <div className="flex gap-2">
                    <select value={blockTool} onChange={(e) => setBlockTool(e.target.value)} className={inputCls} aria-label="Tool to block">
                      <option value="">Choose a tool to block</option>
                      {tools.filter((t) => t.engine === 'server').map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                    </select>
                    <Btn tone="warn" disabled={!blockTool} onClick={() => { act('block_tool', { tool: blockTool }); setBlockTool(''); }}><Ban className="w-4 h-4" />Block</Btn>
                  </div>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <Btn busy={busy === 'reset_limits'} onClick={() => act('reset_limits')}><RotateCcw className="w-4 h-4" />Reset today&apos;s limits</Btn>
                  {u.suspended ? (
                    <Btn tone="primary" busy={busy === 'unsuspend'} onClick={() => act('unsuspend')}><UserCheck className="w-4 h-4" />Unsuspend</Btn>
                  ) : (
                    <div className="flex items-end gap-2">
                      <Field label="Days"><input type="number" min="1" max="3650" value={suspendDays} onChange={(e) => setSuspendDays(e.target.value)} className={`${inputCls} w-20`} /></Field>
                      <Btn tone="warn" busy={busy === 'suspend'} onClick={() => act('suspend', { days: suspendDays }, `Suspend ${u.email} for ${suspendDays} days? They will be blocked from all server tools and from signing in.`)}><UserX className="w-4 h-4" />Suspend</Btn>
                    </div>
                  )}
                  <Btn tone="danger" busy={busy === 'delete'} onClick={() => act('delete', {}, `Delete ${u.email} permanently? Their account, usage history, and sign-in links are removed. This cannot be undone.`)} className="sm:ml-auto"><Trash2 className="w-4 h-4" />Delete user</Btn>
                </div>
              </div>
            </Card>
          )}

          <Card title="Admin note">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Private note, only admins see this" className={inputCls} />
            <div className="mt-2"><Btn busy={busy === 'note'} onClick={() => act('note', { note })}>Save note</Btn></div>
          </Card>

          <Card title="Usage, last 30 days">
            {data.usage.length ? (
              <Table head={['Tool', { label: 'Last 24h', right: true }, { label: '30 days', right: true }]}>
                {data.usage.map((r) => <tr key={r.tool_slug}><td className="py-2 px-3 font-semibold">{r.tool_slug}</td><td className="py-2 px-3 text-right">{fmtNum(r.uses24h)}</td><td className="py-2 px-3 text-right">{fmtNum(r.uses)}</td></tr>)}
              </Table>
            ) : <Empty>No server tool usage in the last 30 days.</Empty>}
          </Card>

          <div className="grid sm:grid-cols-2 gap-5">
            <Card title="Recent activity">
              <ul className="space-y-2 text-sm max-h-72 overflow-y-auto">
                {data.recent.map((r, i) => <li key={i} className="flex justify-between gap-2"><span className="font-semibold text-slate-800 dark:text-slate-100">{r.tool_slug}{r.amount > 1 && ` ×${r.amount}`}</span><span className="text-xs text-slate-500 dark:text-slate-400 text-right">{ago(r.created_at)}<br />{r.ip}</span></li>)}
                {!data.recent.length && <li className="text-slate-500 dark:text-slate-400">No activity yet.</li>}
              </ul>
            </Card>
            <Card title="IP addresses">
              <ul className="space-y-2 text-sm max-h-72 overflow-y-auto">
                {data.ips.map((r) => <li key={r.ip} className="flex justify-between gap-2"><span className="font-mono text-slate-800 dark:text-slate-100">{r.ip}</span><span className="text-xs text-slate-500 dark:text-slate-400">{r.n} uses · {ago(r.last)}</span></li>)}
                {!data.ips.length && <li className="text-slate-500 dark:text-slate-400">None recorded.</li>}
              </ul>
            </Card>
          </div>

          <Card title="Admin history">
            <ul className="space-y-2 text-sm">
              {data.log.map((l, i) => <li key={i} className="flex justify-between gap-3"><span><span className="font-semibold text-slate-800 dark:text-slate-100">{l.action.replace(/_/g, ' ')}</span>{l.detail && <span className="text-slate-500 dark:text-slate-400"> {JSON.stringify(l.detail)}</span>}</span><span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{l.admin_email || 'system'} · {ago(l.created_at)}</span></li>)}
              {!data.log.length && <li className="text-slate-500 dark:text-slate-400">No admin actions on this account.</li>}
            </ul>
          </Card>
        </>
      )}
    </Drawer>
  );
}
