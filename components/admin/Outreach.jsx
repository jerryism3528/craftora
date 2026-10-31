'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Send, Upload, Pause, Play, FlaskConical, Save, MessageSquareReply, AlertTriangle } from 'lucide-react';
import { useApi, post, useToast, Card, Table, Badge, Btn, Loading, ErrorBox, Empty, Toolbar, fmtDate, ago, inputCls, useDebounced } from './ui';

const usd = (c) => `$${(Number(c || 0) / 100).toFixed(2)}`;
const TONE = { new: 'slate', active: 'sky', done: 'indigo', replied: 'emerald', opted_out: 'amber', bounced: 'red', skipped: 'slate', stopped: 'slate' };

function SegmentRow({ s, onSave, busy }) {
  const [f, setF] = useState(s);
  useEffect(() => setF(s), [s]);
  const dirty = ['daily_cap', 'active', 'inbox_email', 'promo_code'].some((k) => String(f[k] ?? '') !== String(s[k] ?? ''));
  return (
    <tr>
      <td className="py-2 px-3">
        <div className="font-semibold">{s.name}</div>
        <input value={f.inbox_email} onChange={(e) => setF({ ...f, inbox_email: e.target.value })} className={`${inputCls} py-1 mt-1 text-xs w-56`} aria-label={`${s.key} inbox`} />
        <div className="mt-1">{s.password_set ? <Badge tone="emerald">password set</Badge> : <Badge tone="red">OUTREACH_PASS_{s.key.toUpperCase()} missing</Badge>}</div>
      </td>
      <td className="py-2 px-3"><input value={f.promo_code || ''} onChange={(e) => setF({ ...f, promo_code: e.target.value.toUpperCase() })} className={`${inputCls} py-1 w-24`} aria-label={`${s.key} code`} /></td>
      <td className="py-2 px-3"><input type="number" min="0" max="200" value={f.daily_cap} onChange={(e) => setF({ ...f, daily_cap: e.target.value })} className={`${inputCls} py-1 w-20`} aria-label={`${s.key} daily cap`} /></td>
      <td className="py-2 px-3">
        <button onClick={() => setF({ ...f, active: !f.active })} className={`relative w-10 h-6 rounded-full transition ${f.active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} role="switch" aria-checked={!!f.active} aria-label={`${s.key} sending`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${f.active ? 'left-[18px]' : 'left-0.5'}`} />
        </button>
      </td>
      <td className="py-2 px-3 text-xs leading-5">
        <div><b>{s.waiting}</b> waiting, <b>{s.contacted}</b> contacted</div>
        <div><b>{s.sent24h}</b> sent today ({s.sent_total} total)</div>
        <div className="text-slate-500">{s.last_sent_at ? `last ${ago(s.last_sent_at)}` : 'nothing sent yet'}</div>
      </td>
      <td className="py-2 px-3 text-xs leading-5">
        <div><b className="text-emerald-600">{s.replied}</b> replied, <b>{s.clicked}</b> clicked</div>
        <div><b>{s.opted_out}</b> said no, <b className={s.bounced ? 'text-red-600' : ''}>{s.bounced}</b> bounced, {s.skipped} skipped</div>
      </td>
      <td className="py-2 px-3 text-xs leading-5">
        <div><b>{s.signed_up}</b> signed up</div>
        <div><b>{s.paid}</b> paid with code, {usd(s.revenue_cents)}</div>
      </td>
      <td className="py-2 px-3 text-right"><Btn size="xs" tone={dirty ? 'primary' : 'default'} disabled={!dirty} busy={busy} onClick={() => onSave({ action: 'segment', key: s.key, ...f })}><Save className="w-3.5 h-3.5" />Save</Btn></td>
    </tr>
  );
}

function Templates({ templates, segments, act, busy }) {
  const [seg, setSeg] = useState(segments[0]?.key || 'law');
  const [drafts, setDrafts] = useState({});
  const [to, setTo] = useState('');
  const list = templates.filter((t) => t.segment === seg);
  const val = (t, k) => drafts[`${t.segment}-${t.step}`]?.[k] ?? t[k];
  const set = (t, k, v) => setDrafts({ ...drafts, [`${t.segment}-${t.step}`]: { ...(drafts[`${t.segment}-${t.step}`] || {}), [k]: v } });
  return (
    <Card title="Emails" action={<select className={inputCls + ' w-56'} value={seg} onChange={(e) => setSeg(e.target.value)}>{segments.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}</select>}>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Plain text only. {'{first_name}'}, {'{company}'}, {'{code}'}, {'{tools_link}'} and {'{pricing_link}'} are filled in for each person. Emails 2 and 3 go in the same thread as email 1. Keep one link per email.</p>
      <div className="space-y-4">
        {list.map((t) => (
          <div key={t.step} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <b className="text-sm">Email {t.step}</b>
              <label className="text-xs text-slate-500 inline-flex items-center gap-1">day <input type="number" min="0" max="60" value={val(t, 'delay_days')} onChange={(e) => set(t, 'delay_days', e.target.value)} className={`${inputCls} py-1 w-16`} /></label>
              {t.step === 1 ? <input value={val(t, 'subject')} onChange={(e) => set(t, 'subject', e.target.value)} placeholder="Subject" className={`${inputCls} py-1 flex-1 min-w-[200px]`} /> : <span className="text-xs text-slate-500">Subject: Re: (email 1 subject)</span>}
            </div>
            <textarea value={val(t, 'body')} onChange={(e) => set(t, 'body', e.target.value)} rows={t.step === 1 ? 13 : 6} className={`${inputCls} mt-2 font-mono text-xs leading-5`} />
            <div className="flex flex-wrap justify-end gap-2 mt-2">
              <Btn size="xs" busy={busy === `test${t.step}`} disabled={!to} onClick={() => act({ action: 'test', segment: seg, step: t.step, to }, `test${t.step}`)}><FlaskConical className="w-3.5 h-3.5" />Send test</Btn>
              <Btn size="xs" tone="primary" busy={busy === `tpl${t.step}`} onClick={() => act({ action: 'template', segment: seg, step: t.step, delay_days: val(t, 'delay_days'), subject: val(t, 'subject'), body: val(t, 'body') }, `tpl${t.step}`)}><Save className="w-3.5 h-3.5" />Save email {t.step}</Btn>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2"><span className="text-xs text-slate-500">Test emails go to</span><input value={to} onChange={(e) => setTo(e.target.value)} placeholder="you@example.com" className={`${inputCls} py-1 w-64`} /></div>
    </Card>
  );
}

const EV = {
  sent: ['Email sent', 'indigo'], reply: ['Replied', 'emerald'], optout: ['Said no', 'amber'], bounce: ['Bounced', 'red'],
  click: ['Clicked the link', 'sky'], scan: ['Link checked by a mail filter (not a person)', 'slate'], auto: ['Auto-reply (ignored)', 'slate'], skip: ['Skipped', 'slate'], verify: ['Email check', 'slate'], error: ['Send failed', 'red'],
};

function DryRun({ r, onClose }) {
  return (
    <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-sm">Preview: who gets the next emails</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Nothing was sent. Emails go out {r.window} in each person&apos;s own time zone, one at a time per inbox.{r.paused ? ' All sending is paused right now.' : ''}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close preview" className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-800"><X className="w-4 h-4" /></button>
      </div>
      <div className="mt-3 space-y-4">
        {r.segments.map((g) => (
          <div key={g.key}>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <b>{g.name}</b>
              {g.active ? <Badge tone="emerald">on, up to {g.cap} a day</Badge> : <Badge>off: turn it on to start</Badge>}
              <span className="text-xs text-slate-500">{g.waiting} waiting · {g.sent24h} sent in the last 24 hours</span>
            </div>
            {g.next.length ? (
              <ol className="mt-1.5 space-y-1">
                {g.next.map((n, i) => (
                  <li key={n.email} className="text-xs flex flex-wrap gap-x-2 gap-y-0.5 items-baseline">
                    <span className="text-slate-400 w-4">{i + 1}.</span>
                    <span className="font-semibold">{n.name}</span>
                    <span className="text-slate-500">{n.company ? `${n.company} · ` : ''}{n.email}</span>
                    <span>email {n.step}: &quot;{n.subject}&quot;</span>
                    <span className={n.in_window ? 'text-emerald-600 font-semibold' : 'text-slate-500'}>{n.in_window ? `in their send window now (${n.local_now})` : n.opens ? `their time now ${n.local_now}, window opens ${n.opens}${n.opens_in_hours ? ` (in about ${n.opens_in_hours}h)` : ''}` : 'no send window found'}</span>
                    {n.needs_check && <span className="text-slate-400">address checked before sending</span>}
                  </li>
                ))}
              </ol>
            ) : <p className="text-xs text-slate-500 mt-1">Nobody is due. Import leads or wait for follow-up days.</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function LeadHistory({ id, onClose }) {
  const { data, error, loading } = useApi(`/api/admin/outreach?lead=${id}`);
  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-slate-900/50" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label="Lead history">
      <div className="w-full max-w-xl h-full overflow-y-auto bg-white dark:bg-slate-900 p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          {data?.lead ? (
            <div>
              <h2 className="text-lg font-extrabold">{[data.lead.first_name, data.lead.last_name].filter(Boolean).join(' ') || data.lead.email}</h2>
              <p className="text-sm text-slate-500">{data.lead.company} · {data.lead.email}</p>
              <p className="text-xs text-slate-500 mt-1">{data.lead.segment_name} from {data.lead.inbox_email} · {[data.lead.state, data.lead.country].filter(Boolean).join(', ')} · {data.lead.tz}</p>
              <div className="mt-2 flex flex-wrap gap-1"><Badge tone={TONE[data.lead.status] || 'slate'}>{data.lead.status.replace('_', ' ')}</Badge>{data.lead.verify && <Badge>email check: {data.lead.verify}</Badge>}{data.lead.batch && <Badge>{data.lead.batch}</Badge>}</div>
            </div>
          ) : <div />}
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
        </div>
        {loading && <Loading />}
        {error && <ErrorBox>{error}</ErrorBox>}
        {data?.events && (
          <ol className="mt-5 space-y-3">
            {!data.events.length && <Empty>Nothing has happened with this lead yet.</Empty>}
            {data.events.map((e, i) => (
              <li key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge tone={EV[e.type]?.[1] || 'slate'}>{EV[e.type]?.[0] || e.type}{e.type === 'sent' && e.step ? ` (email ${e.step})` : ''}</Badge>
                  <span className="text-xs text-slate-500 ml-auto">{fmtDate(e.created_at, true)}</span>
                </div>
                {e.type === 'sent' && <p className="mt-2 text-sm font-semibold">Subject: {e.detail}</p>}
                {e.body ? <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-200">{e.body}</pre> : e.detail && e.type !== 'sent' && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{e.detail}</p>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export default function OutreachSection() {
  const [segF, setSegF] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const dq = useDebounced(q);
  const { data, error, loading, reload } = useApi(`/api/admin/outreach?segment=${segF}&status=${status}&q=${encodeURIComponent(dq)}`);
  const [toast, show] = useToast();
  const [busy, setBusy] = useState('');
  const [set, setSet] = useState(null);
  const [imp, setImp] = useState({ segment: 'law', csv: '', name: '', batch: '' });
  const [dry, setDry] = useState(null);
  const [open, setOpen] = useState(null);

  useEffect(() => { if (data?.settings) setSet(data.settings); }, [data?.settings]);

  async function act(body, key) {
    setBusy(key || body.action);
    const r = await post('/api/admin/outreach', body);
    setBusy('');
    show(r);
    if (body.action === 'dry_run' && r.ok !== false) setDry(r.result);
    if (r.ok !== false && body.action !== 'test') reload();
    return r;
  }

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox>{error}</ErrorBox>;
  const s = set || data.settings;

  return (
    <div className="space-y-6">
      {toast}
      <div className="flex flex-wrap items-center gap-2">
        {s.paused ? <Badge tone="amber">All sending paused</Badge> : <Badge tone="emerald">Sending on (active inboxes only)</Badge>}
        {!data.secretSet && <Badge tone="red">OUTREACH_SECRET missing in .env, n8n cannot connect</Badge>}
      </div>

      <Card title="Inboxes" action={<Btn busy={busy === 'dry_run'} onClick={() => act({ action: 'dry_run' })}><FlaskConical className="w-4 h-4" />Preview next emails</Btn>}>
        {dry && <div className="mb-4"><DryRun r={dry} onClose={() => setDry(null)} /></div>}
        <Table head={['Inbox', 'Code', 'Per day', 'On', 'Sending', 'Responses', 'Results', '']}>
          {data.segments.map((x) => <SegmentRow key={x.key} s={x} busy={busy === 'segment' + x.key} onSave={(b) => act(b, 'segment' + x.key)} />)}
        </Table>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Start each inbox at 10 a day after warm-up and raise slowly toward 30. Every new address is checked with the email verifier before the first email; only safe ones are sent. Signed up counts contacted people who later made a Craftora account with the same email.</p>
      </Card>

      <Card title="Schedule">
        <div className="flex flex-wrap items-end gap-3 text-sm">
          <label className="text-xs font-semibold">Send from<input type="number" min="0" max="23" value={s.window_start} onChange={(e) => setSet({ ...s, window_start: e.target.value })} className={`${inputCls} mt-1 w-20`} /></label>
          <label className="text-xs font-semibold">until<input type="number" min="1" max="24" value={s.window_end} onChange={(e) => setSet({ ...s, window_end: e.target.value })} className={`${inputCls} mt-1 w-20`} /></label>
          <span className="text-xs text-slate-500 pb-2">hours, in each person&apos;s own time zone</span>
          <label className="text-xs font-semibold">Gap min<input type="number" min="1" value={s.gap_min} onChange={(e) => setSet({ ...s, gap_min: e.target.value })} className={`${inputCls} mt-1 w-20`} /></label>
          <label className="text-xs font-semibold">Gap max<input type="number" min="1" value={s.gap_max} onChange={(e) => setSet({ ...s, gap_max: e.target.value })} className={`${inputCls} mt-1 w-20`} /></label>
          <label className="inline-flex items-center gap-2 text-xs font-semibold pb-2"><input type="checkbox" checked={!!s.weekdays_only} onChange={(e) => setSet({ ...s, weekdays_only: e.target.checked })} />Weekdays only</label>
          <Btn tone="primary" busy={busy === 'settings'} onClick={() => act({ action: 'settings', ...s })}><Save className="w-4 h-4" />Save</Btn>
          <Btn tone={s.paused ? 'primary' : 'warn'} busy={busy === 'pause'} onClick={() => act({ action: 'settings', ...s, paused: !s.paused }, 'pause')}>{s.paused ? <><Play className="w-4 h-4" />Resume all</> : <><Pause className="w-4 h-4" />Pause all</>}</Btn>
        </div>
      </Card>

      <Card title="Add leads">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold">Inbox<select className={`${inputCls} mt-1 w-56`} value={imp.segment} onChange={(e) => setImp({ ...imp, segment: e.target.value })}>{data.segments.map((x) => <option key={x.key} value={x.key}>{x.name}</option>)}</select></label>
          <label className="text-xs font-semibold">CSV file<input type="file" accept=".csv,text/csv" className="block mt-1 text-sm" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setImp({ ...imp, csv: await f.text(), name: f.name }); }} /></label>
          <label className="text-xs font-semibold">Batch name<input value={imp.batch} onChange={(e) => setImp({ ...imp, batch: e.target.value })} placeholder="Law pilot 1" className={`${inputCls} mt-1 w-40`} /></label>
          <Btn tone="primary" disabled={!imp.csv} busy={busy === 'import'} onClick={async () => { const r = await act({ action: 'import', segment: imp.segment, csv: imp.csv, batch: imp.batch || imp.name }); if (r.ok !== false) setImp({ ...imp, csv: '', name: '' }); }}><Upload className="w-4 h-4" />Import</Btn>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Columns used: Email, First name, Last name, Title, Company (short, for emails) or Company, Website, Country, State, City. Duplicates, existing Craftora users and anyone on the do-not-contact list are skipped automatically.</p>
      </Card>

      <Templates templates={data.templates} segments={data.segments} act={act} busy={busy} />

      <Card title="Latest replies">
        {data.replies.length ? (
          <div className="space-y-2">
            {data.replies.map((r, i) => (
              <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2"><MessageSquareReply className="w-4 h-4 text-emerald-600" /><b>{r.first_name || r.email}</b><span className="text-slate-500">{r.company} · {r.email}</span>{r.type === 'optout' ? <Badge tone="amber">said no</Badge> : <Badge tone="emerald">reply</Badge>}<span className="text-xs text-slate-400 ml-auto">{ago(r.created_at)}</span></div>
                <p className="mt-1 whitespace-pre-line text-slate-700 dark:text-slate-200">{r.detail}</p>
              </div>
            ))}
          </div>
        ) : <Empty>No replies yet. Replies also land in each inbox, answer them from there.</Empty>}
      </Card>

      {data.errors.length > 0 && (
        <Card title="Sending errors and warnings">
          {data.errors.map((e, i) => <p key={i} className="text-xs text-red-700 dark:text-red-300 flex gap-1.5"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{fmtDate(e.created_at, true)} · {e.segment ? `${e.segment}: ` : ''}{e.detail}</p>)}
        </Card>
      )}

      <Card title="Leads" action={<span className="text-xs text-slate-500 dark:text-slate-400">Click a name to see every email sent and every reply</span>}>
        <Toolbar>
          <input className={inputCls + ' sm:max-w-xs'} placeholder="Search email, name or company" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className={inputCls + ' sm:max-w-[200px]'} value={segF} onChange={(e) => setSegF(e.target.value)}><option value="">All inboxes</option>{data.segments.map((x) => <option key={x.key} value={x.key}>{x.name}</option>)}</select>
          <select className={inputCls + ' sm:max-w-[180px]'} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Any status</option>{Object.keys(TONE).map((k) => <option key={k} value={k}>{k.replace('_', ' ')}</option>)}</select>
        </Toolbar>
        <Table head={['Person', 'Inbox', 'Status', 'Emails sent', 'Last activity', '']} empty={!data.leads.length && <Empty>No leads match.</Empty>}>
          {data.leads.map((l) => (
            <tr key={l.id}>
              <td className="py-2 px-3"><button type="button" onClick={() => setOpen(l.id)} className="text-left font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">{[l.first_name, l.last_name].filter(Boolean).join(' ') || l.email}</button><div className="text-xs text-slate-500">{l.company} · {l.email}</div></td>
              <td className="py-2 px-3 text-xs">{l.segment}<div className="text-slate-500">{[l.state, l.country].filter(Boolean).join(', ')}</div></td>
              <td className="py-2 px-3"><Badge tone={TONE[l.status] || 'slate'}>{l.status.replace('_', ' ')}</Badge>{l.clicked_at && <Badge tone="indigo" className="ml-1">clicked</Badge>}{l.stop_reason && <div className="text-[11px] text-slate-500 mt-0.5 max-w-[220px] truncate" title={l.stop_reason}>{l.stop_reason}</div>}</td>
              <td className="py-2 px-3">{l.step}</td>
              <td className="py-2 px-3 text-xs">{ago(l.replied_at || l.last_sent_at || l.first_sent_at) || '-'}</td>
              <td className="py-2 px-3 text-right whitespace-nowrap">
                {['new', 'active'].includes(l.status) && <Btn size="xs" onClick={() => act({ action: 'lead', id: l.id, do: 'stop' }, 'l' + l.id)}>Stop</Btn>}{' '}
                {['stopped', 'skipped'].includes(l.status) && <Btn size="xs" onClick={() => act({ action: 'lead', id: l.id, do: 'resume' }, 'l' + l.id)}>Resume</Btn>}{' '}
                <Btn size="xs" tone="danger" onClick={() => act({ action: 'lead', id: l.id, do: 'suppress' }, 'l' + l.id)}>Never email</Btn>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
      {open && <LeadHistory id={open} onClose={() => setOpen(null)} />}
      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Send className="w-3.5 h-3.5" />n8n calls the sender every 10 minutes and forwards new mail from the four inboxes. Replies stop the emails to that person for good.</p>
    </div>
  );
}
