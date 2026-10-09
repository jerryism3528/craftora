'use client';

import { useEffect, useRef, useState } from 'react';
import { Crown, Gift, Upload, Trash2, Plus, Save, FileSpreadsheet, Clock } from 'lucide-react';
import { useApi, post, useToast, Card, Table, Badge, Btn, Field, Loading, ErrorBox, Empty, inputCls, fmtNum, fmtDate, PLAN_TONE } from './ui';

export default function PlansSection() {
  const { data, error, loading, reload } = useApi('/api/admin/plans');
  const [toast, show] = useToast();
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox>{error}</ErrorBox>;
  const counts = Object.fromEntries((data.counts || []).map((c) => [c.plan, c]));

  return (
    <div className="space-y-6">
      {toast}
      <div className="grid lg:grid-cols-3 gap-4">
        {data.plans.map((p) => <PlanCard key={p.key} plan={p} tools={data.tools} count={counts[p.key]} onSaved={(r) => { show(r); reload(); }} />)}
      </div>
      <TiersCard tiers={data.tiers} onDone={(r) => { show(r); reload(); }} />
      <ImportCard tiers={data.tiers} onDone={(r) => { show(r); reload(); }} />
      <GrantsCard grants={data.grants} onDone={(r) => { show(r); reload(); }} />
    </div>
  );
}

function PlanCard({ plan, tools, count, onSaved }) {
  const [f, setF] = useState(plan);
  const [busy, setBusy] = useState(false);
  useEffect(() => setF(plan), [plan]);
  const set = (k, v) => setF({ ...f, [k]: v });
  const setO = (slug, v) => setF({ ...f, tool_overrides: { ...f.tool_overrides, [slug]: v } });
  const free = plan.key === 'free';

  async function save() {
    setBusy(true);
    const r = await post('/api/admin/plans', { action: 'save_plan', plan: f });
    setBusy(false);
    onSaved(r);
  }

  return (
    <Card title={<span className="flex items-center gap-2"><Crown className="w-4 h-4" style={{ color: f.color }} />{plan.name}</span>} action={<Badge tone={PLAN_TONE[plan.key] || 'sky'}>{free ? 'default' : `${fmtNum(count?.n || 0)} users`}</Badge>}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Display name"><input value={f.name} onChange={(e) => set('name', e.target.value)} className={inputCls} /></Field>
        <Field label="Limit multiplier" hint={free ? 'Free uses the base limits' : 'Base limit x this number'}><input type="number" step="0.5" min="0.5" value={f.multiplier} disabled={free} onChange={(e) => set('multiplier', e.target.value)} className={inputCls} /></Field>
        <Field label="Doc storage (MB)"><input type="number" min="0" value={f.storage_mb} onChange={(e) => set('storage_mb', e.target.value)} className={inputCls} /></Field>
        <Field label="Team seats"><input type="number" min="1" value={f.seats} onChange={(e) => set('seats', e.target.value)} className={inputCls} /></Field>
      </div>
      <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-700 dark:text-slate-200">
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!f.ad_free} onChange={(e) => set('ad_free', e.target.checked)} /> No ads</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!f.white_label} onChange={(e) => set('white_label', e.target.checked)} /> White-label</label>
        <label className="flex items-center gap-2">Color <input type="color" value={f.color} onChange={(e) => set('color', e.target.value)} className="w-8 h-6 rounded" /></label>
      </div>
      {!free && (
        <details className="mt-4">
          <summary className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer">Daily limit per tool</summary>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Leave empty to use base limit x {f.multiplier}.</p>
          <div className="mt-2 space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {tools.map((t) => (
              <div key={t.tool_slug} className="flex items-center gap-2 text-sm">
                <span className="flex-1 truncate text-slate-700 dark:text-slate-200">{t.tool_slug}</span>
                <span className="text-xs text-slate-400 w-16 text-right">base {t.daily_limit}</span>
                <input type="number" min="0" value={f.tool_overrides?.[t.tool_slug] ?? ''} placeholder={String(Math.round(t.daily_limit * (Number(f.multiplier) || 1)))} onChange={(e) => setO(t.tool_slug, e.target.value)} className={`${inputCls} w-24 py-1`} aria-label={`${t.tool_slug} limit on ${plan.name}`} />
              </div>
            ))}
          </div>
        </details>
      )}
      <div className="mt-4"><Btn tone="primary" busy={busy} onClick={save}><Save className="w-4 h-4" />Save {plan.name}</Btn></div>
    </Card>
  );
}

const EMPTY_TIER = { key: '', name: '', price_usd: '', plan: 'pro', months: '', supporter: true, max_backers: '', extras: '', sort: 10 };

function TiersCard({ tiers, onDone }) {
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    const r = await post('/api/admin/plans', { action: 'save_tier', tier: edit });
    setBusy(false);
    if (r.ok !== false) setEdit(null);
    onDone(r);
  }
  async function del(key) {
    if (!confirm('Delete this reward tier? Users who already got it keep their plan.')) return;
    onDone(await post('/api/admin/plans', { action: 'delete_tier', key }));
  }
  return (
    <Card title={<span className="flex items-center gap-2"><Gift className="w-4 h-4 text-pink-500" />Kickstarter reward tiers</span>} action={<Btn size="xs" onClick={() => setEdit({ ...EMPTY_TIER })}><Plus className="w-3.5 h-3.5" />Add tier</Btn>}>
      <Table head={['Tier', { label: 'Price', right: true }, 'Gives', { label: 'Claimed', right: true }, { label: 'Waiting', right: true }, { label: 'Limit', right: true }, '']}>
        {tiers.map((t) => (
          <tr key={t.key}>
            <td className="py-2.5 px-3"><div className="font-semibold">{t.name}</div><div className="text-xs text-slate-500 dark:text-slate-400">{t.key}{t.extras && ` · ${t.extras}`}</div></td>
            <td className="py-2.5 px-3 text-right font-semibold">${t.price_usd}</td>
            <td className="py-2.5 px-3"><Badge tone={PLAN_TONE[t.plan]}>{t.plan} {t.months ? `${t.months} mo` : 'lifetime'}</Badge>{t.supporter && <Badge tone="red" className="ml-1">supporter</Badge>}</td>
            <td className="py-2.5 px-3 text-right">{fmtNum(t.claimed)}</td>
            <td className="py-2.5 px-3 text-right">{fmtNum(t.pending)}</td>
            <td className="py-2.5 px-3 text-right">{t.max_backers ? (
              <span className={t.claimed + t.pending >= t.max_backers ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>{t.claimed + t.pending}/{t.max_backers}</span>
            ) : 'none'}</td>
            <td className="py-2.5 px-3 text-right whitespace-nowrap"><Btn size="xs" tone="ghost" onClick={() => setEdit({ ...t, months: t.months ?? '', max_backers: t.max_backers ?? '' })}>Edit</Btn><Btn size="xs" tone="ghost" onClick={() => del(t.key)} title="Delete"><Trash2 className="w-3.5 h-3.5" /></Btn></td>
          </tr>
        ))}
      </Table>
      {!tiers.length && <Empty>No tiers yet.</Empty>}
      {edit && (
        <div className="mt-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 p-4">
          <div className="grid sm:grid-cols-4 gap-3">
            <Field label="Key (id)"><input value={edit.key} disabled={!!tiers.find((t) => t.key === edit.key) && edit.name !== ''} onChange={(e) => setEdit({ ...edit, key: e.target.value })} placeholder="lifetime-pro" className={inputCls} /></Field>
            <Field label="Name"><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={inputCls} /></Field>
            <Field label="Price (USD)"><input type="number" value={edit.price_usd} onChange={(e) => setEdit({ ...edit, price_usd: e.target.value })} className={inputCls} /></Field>
            <Field label="Plan"><select value={edit.plan} onChange={(e) => setEdit({ ...edit, plan: e.target.value })} className={inputCls}><option value="free">Free</option><option value="pro">Pro</option><option value="business">Business</option></select></Field>
            <Field label="Months" hint="Empty = lifetime"><input type="number" value={edit.months} onChange={(e) => setEdit({ ...edit, months: e.target.value })} className={inputCls} /></Field>
            <Field label="Max backers" hint="Empty = no limit"><input type="number" value={edit.max_backers} onChange={(e) => setEdit({ ...edit, max_backers: e.target.value })} className={inputCls} /></Field>
            <Field label="Sort order"><input type="number" value={edit.sort} onChange={(e) => setEdit({ ...edit, sort: e.target.value })} className={inputCls} /></Field>
            <Field label="Extras"><input value={edit.extras} onChange={(e) => setEdit({ ...edit, extras: e.target.value })} placeholder="Written SEO report" className={inputCls} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm mt-3 text-slate-700 dark:text-slate-200"><input type="checkbox" checked={!!edit.supporter} onChange={(e) => setEdit({ ...edit, supporter: e.target.checked })} /> Add to supporters wall</label>
          <div className="flex gap-2 mt-3"><Btn tone="primary" busy={busy} onClick={save}>Save tier</Btn><Btn tone="ghost" onClick={() => setEdit(null)}>Cancel</Btn></div>
        </div>
      )}
    </Card>
  );
}

function ImportCard({ tiers, onDone }) {
  const [csv, setCsv] = useState('');
  const [defaultTier, setDefaultTier] = useState('');
  const [source, setSource] = useState('kickstarter');
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState('');
  const fileRef = useRef(null);

  async function run(action) {
    setBusy(action);
    const r = await post('/api/admin/plans', { action, csv, defaultTier, source });
    setBusy('');
    if (action === 'import_preview') { if (r.ok === false) onDone(r); else setPreview(r); return; }
    onDone(r);
    if (r.ok !== false) { setPreview(null); setCsv(''); }
  }
  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { setCsv(String(rd.result || '')); setPreview(null); };
    rd.readAsText(f);
  }

  return (
    <Card title={<span className="flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-emerald-500" />Import backers</span>}>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Upload the Kickstarter backer report CSV, or paste emails (one per line). Columns for email, backer name, and reward title are detected automatically. Backers with an account are upgraded right away. Others get their plan when they sign up with the same email.</p>
      <div className="grid lg:grid-cols-[1fr_260px] gap-4">
        <textarea value={csv} onChange={(e) => { setCsv(e.target.value); setPreview(null); }} rows={7} placeholder={'Backer Name,Email,Reward Title\nJane Doe,jane@example.com,Lifetime Pro'} className={`${inputCls} font-mono text-xs`} aria-label="Backer CSV" />
        <div className="space-y-3">
          <Btn onClick={() => fileRef.current?.click()} className="w-full"><Upload className="w-4 h-4" />Choose CSV file</Btn>
          <input ref={fileRef} type="file" accept=".csv,text/csv,text/plain" className="hidden" onChange={onFile} />
          <Field label="Tier when not detected"><select value={defaultTier} onChange={(e) => setDefaultTier(e.target.value)} className={inputCls}><option value="">Skip the row</option>{tiers.map((t) => <option key={t.key} value={t.key}>{t.name}</option>)}</select></Field>
          <Field label="Source label"><input value={source} onChange={(e) => setSource(e.target.value)} className={inputCls} /></Field>
          <Btn tone="primary" className="w-full" disabled={!csv.trim()} busy={busy === 'import_preview'} onClick={() => run('import_preview')}>Preview</Btn>
        </div>
      </div>
      {preview && (
        <div className="mt-5">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge tone="slate">{preview.summary.total} rows</Badge>
            <Badge tone="emerald">{preview.summary.existing} have accounts</Badge>
            <Badge tone="amber">{preview.summary.pending} will wait for signup</Badge>
            <Badge tone="red">{preview.summary.skipped} skipped</Badge>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <Table head={['Email', 'Name', 'Reward', 'Result']}>
              {preview.rows.map((r, i) => (
                <tr key={i}>
                  <td className="py-1.5 px-3">{r.email || <span className="text-slate-400">(none)</span>}</td>
                  <td className="py-1.5 px-3">{r.name}</td>
                  <td className="py-1.5 px-3">{r.tierName || r.tierText}</td>
                  <td className="py-1.5 px-3">{r.issue ? <Badge tone="red">{r.issue}</Badge> : r.userId ? <Badge tone="emerald">Upgrade now</Badge> : <Badge tone="amber">On signup</Badge>}</td>
                </tr>
              ))}
            </Table>
          </div>
          <div className="mt-3 flex gap-2"><Btn tone="primary" disabled={!preview.summary.ready} busy={busy === 'import'} onClick={() => run('import')}>Import {preview.summary.ready} backers</Btn><Btn tone="ghost" onClick={() => setPreview(null)}>Cancel</Btn></div>
        </div>
      )}
    </Card>
  );
}

function GrantsCard({ grants, onDone }) {
  async function del(id) {
    if (!confirm('Remove this pending plan?')) return;
    onDone(await post('/api/admin/plans', { action: 'delete_grant', id }));
  }
  return (
    <Card title={<span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" />Waiting for signup ({grants.length})</span>}>
      {grants.length ? (
        <Table head={['Email', 'Plan', 'Tier', 'Source', 'Added', '']}>
          {grants.map((g) => (
            <tr key={g.id}>
              <td className="py-2 px-3">{g.email}{g.supporter_name && <div className="text-xs text-slate-500 dark:text-slate-400">{g.supporter_name}</div>}</td>
              <td className="py-2 px-3"><Badge tone={PLAN_TONE[g.plan]}>{g.plan} {g.months ? `${g.months} mo` : 'lifetime'}</Badge></td>
              <td className="py-2 px-3">{g.tier}</td>
              <td className="py-2 px-3">{g.source}</td>
              <td className="py-2 px-3 whitespace-nowrap">{fmtDate(g.created_at)}</td>
              <td className="py-2 px-3 text-right"><Btn size="xs" tone="ghost" onClick={() => del(g.id)} title="Remove"><Trash2 className="w-3.5 h-3.5" /></Btn></td>
            </tr>
          ))}
        </Table>
      ) : <Empty>No pending plans. Imported backers without an account show up here until they sign up.</Empty>}
    </Card>
  );
}
