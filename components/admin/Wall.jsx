'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Plus, Check, X, Eye, EyeOff, Pin, Trash2, Pencil, Heart, ExternalLink, ImagePlus } from 'lucide-react';
import { useApi, post, useToast, useDebounced, Card, Badge, Btn, Field, Tabs, Loading, ErrorBox, Empty, Drawer, inputCls, fmtDate } from './ui';
import { resizeImage } from '../resizeImage';

const LEVELS = [['sponsor', 'Sponsor', 'amber'], ['business', 'Founding Business', 'teal'], ['pro', 'Founding Pro', 'indigo'], ['supporter', 'Supporter', 'red']];
const LV = Object.fromEntries(LEVELS.map(([k, l, t]) => [k, { label: l, tone: t }]));
const SOURCES = ['kickstarter', 'gofundme', 'ko-fi', 'indiegogo', 'paypal', 'manual'];
const EMPTY = { name: '', level: 'supporter', url: '', photo: '', photo_url: '', source: 'gofundme', note: '', visible: true, pinned: false };

function Avatar({ src, name, size = 'w-10 h-10', logo = false }) {
  if (src) return <img src={src} alt="" className={`${size} ${logo ? 'object-contain bg-white rounded-lg' : 'object-cover rounded-full'} border border-slate-200 dark:border-slate-600 shrink-0`} />;
  const ini = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return <span className={`${size} rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 flex items-center justify-center text-xs font-bold shrink-0`}>{ini}</span>;
}

export default function WallSection() {
  const [level, setLevel] = useState('');
  const [show, setShow] = useState('all');
  const [q, setQ] = useState('');
  const dq = useDebounced(q);
  const { data, error, loading, reload } = useApi(`/api/admin/wall?level=${level}&show=${show}&q=${encodeURIComponent(dq)}`);
  const [toast, notify] = useToast();
  const [edit, setEdit] = useState(null);

  async function act(action, id, confirmText) {
    if (confirmText && !confirm(confirmText)) return;
    const r = await post('/api/admin/wall', { action, id });
    notify(r);
    if (r.ok !== false) reload();
  }

  const counts = Object.fromEntries((data?.counts || []).map((c) => [c.level, c]));
  const total = Object.values(counts).reduce((s, c) => s + c.n, 0);
  const pending = (data?.rows || []).filter((r) => r.pending_photo);

  return (
    <div className="space-y-6">
      {toast}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {LEVELS.map(([k, l, tone]) => (
          <button key={k} onClick={() => setLevel(level === k ? '' : k)} className={`text-left rounded-2xl border bg-white dark:bg-slate-800 p-4 ${level === k ? 'border-indigo-500' : 'border-slate-200 dark:border-slate-700'} hover:border-indigo-400`}>
            <Badge tone={tone}>{l}</Badge>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{counts[k]?.n || 0}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{counts[k]?.visible || 0} shown on the wall</div>
          </button>
        ))}
      </div>

      {data?.pendingPhotos > 0 && show !== 'photos' && (
        <button onClick={() => setShow('photos')} className="w-full rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 px-4 py-3 text-sm font-semibold text-left">
          {data.pendingPhotos} {data.pendingPhotos === 1 ? 'photo is' : 'photos are'} waiting for approval. Review now
        </button>
      )}

      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
          <Tabs value={show} onChange={setShow} items={[['all', 'All', total], ['visible', 'Shown'], ['hidden', 'Hidden'], ['photos', 'Photos to review', data?.pendingPhotos || 0]]} />
          <div className="flex gap-2 lg:ml-auto">
            <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email, or source" className={`${inputCls} pl-9 w-56`} /></div>
            <Btn tone="primary" onClick={() => setEdit({ ...EMPTY })}><Plus className="w-4 h-4" />Add person</Btn>
            <a href="/supporters" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400"><ExternalLink className="w-4 h-4" />View wall</a>
          </div>
        </div>
        {error && <ErrorBox>{error}</ErrorBox>}
        {loading && !data ? <Loading /> : data && (
          show === 'photos' ? (
            pending.length ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pending.map((r) => (
                  <div key={r.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex gap-4 items-center">
                    <img src={`/api/admin/wall/preview?id=${r.id}`} alt={`Photo from ${r.name}`} className="w-20 h-20 rounded-full object-cover bg-slate-100 dark:bg-slate-900" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">{r.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{r.account_email || r.email}</div>
                      <div className="flex gap-2 mt-2">
                        <Btn size="xs" tone="primary" onClick={() => act('approve_photo', r.id)}><Check className="w-3.5 h-3.5" />Approve</Btn>
                        <Btn size="xs" tone="danger" onClick={() => act('reject_photo', r.id)}><X className="w-3.5 h-3.5" />Reject</Btn>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <Empty>No photos waiting for review.</Empty>
          ) : data.rows.length ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {data.rows.map((r) => (
                <li key={r.id} className={`py-3 flex flex-col sm:flex-row sm:items-center gap-3 ${r.visible ? '' : 'opacity-60'}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar src={r.photo_url} name={r.name} logo={r.level === 'sponsor'} size={r.level === 'sponsor' ? 'w-16 h-10' : 'w-10 h-10'} />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white flex flex-wrap items-center gap-1.5">
                        {r.pinned && <Pin className="w-3.5 h-3.5 text-indigo-500" />}{r.name}
                        <Badge tone={LV[r.level].tone}>{LV[r.level].label}</Badge>
                        {!r.visible && <Badge>hidden</Badge>}
                        {r.pending_photo && <Badge tone="amber">photo waiting</Badge>}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {[r.source && `via ${r.source}`, r.account_email ? `account: ${r.account_email}` : r.email ? `${r.email} (no account yet)` : 'added by hand', fmtDate(r.created_at)].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Btn size="xs" tone="ghost" title={r.visible ? 'Hide' : 'Show'} onClick={() => act('toggle', r.id)}>{r.visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</Btn>
                    <Btn size="xs" onClick={() => setEdit({ ...r, url: r.url || '', photo: r.photo || '', note: r.note || '' })}><Pencil className="w-3.5 h-3.5" />Edit</Btn>
                    <Btn size="xs" tone="ghost" title="Delete" onClick={() => act('delete', r.id, `Remove ${r.name} from the wall?`)}><Trash2 className="w-3.5 h-3.5" /></Btn>
                  </div>
                </li>
              ))}
            </ul>
          ) : <Empty>No one on the wall yet. Import backers in Plans and backers, or add a person by hand.</Empty>
        )}
      </Card>
      <EntryDrawer entry={edit} onClose={() => setEdit(null)} onSaved={(r) => { notify(r); setEdit(null); reload(); }} notify={notify} />
    </div>
  );
}

function EntryDrawer({ entry, onClose, onSaved, notify }) {
  const [f, setF] = useState(entry || EMPTY);
  const [busy, setBusy] = useState('');
  const fileRef = useRef(null);
  useEffect(() => { if (entry) setF(entry); }, [entry]);
  if (!entry) return null;
  const isNew = !entry.id;
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  async function upload(file) {
    if (!file) return;
    setBusy('upload');
    try {
      const small = await resizeImage(file, f.level === 'sponsor' ? 'logo' : 'avatar');
      const fd = new FormData(); fd.append('file', small);
      const r = await fetch('/api/admin/wall/photo', { method: 'POST', body: fd }).then((x) => x.json());
      if (r.ok) setF((x) => ({ ...x, photo: r.photo, photo_url: r.url })); else notify(r);
    } catch (e) { notify({ ok: false, error: e.message }); }
    setBusy('');
  }
  async function save() {
    setBusy('save');
    const r = await post('/api/admin/wall', { action: isNew ? 'create' : 'update', ...f });
    setBusy('');
    if (r.ok === false) notify(r); else onSaved(r);
  }

  return (
    <Drawer open onClose={onClose} title={isNew ? 'Add a person to the wall' : `Edit ${entry.name}`}>
      <Card>
        <div className="flex items-center gap-4">
          <Avatar src={f.photo_url} name={f.name || '?'} logo={f.level === 'sponsor'} size={f.level === 'sponsor' ? 'w-28 h-16' : 'w-16 h-16'} />
          <div className="flex flex-wrap gap-2">
            <Btn busy={busy === 'upload'} onClick={() => fileRef.current?.click()}><ImagePlus className="w-4 h-4" />{f.photo ? 'Replace' : 'Upload'} {f.level === 'sponsor' ? 'logo' : 'photo'}</Btn>
            {f.photo && <Btn tone="ghost" onClick={() => setF((x) => ({ ...x, photo: '', photo_url: '' }))}>Remove</Btn>}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
          </div>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">{f.level === 'sponsor' ? 'Logos are resized to fit 480 x 240.' : 'Photos are cropped to a square and resized to 256 x 256.'} Only add a photo with the person&apos;s permission.</p>
        {entry.pending_url && <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">This person uploaded a photo that is waiting for review in Photos to review.</p>}
      </Card>
      <Card>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Name on the wall"><input value={f.name} maxLength={40} onChange={(e) => set('name', e.target.value)} className={inputCls} /></Field>
          <Field label="Level"><select value={f.level} onChange={(e) => set('level', e.target.value)} className={inputCls}>{LEVELS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
          {f.level === 'sponsor' && <Field label="Website" hint="Shown as a sponsored link"><input value={f.url} onChange={(e) => set('url', e.target.value)} placeholder="https://example.com" className={inputCls} /></Field>}
          <Field label="Source (private)" hint="Never shown on the wall"><input value={f.source} list="wall-sources" onChange={(e) => set('source', e.target.value)} className={inputCls} /><datalist id="wall-sources">{SOURCES.map((s) => <option key={s} value={s} />)}</datalist></Field>
        </div>
        <Field label="Private note"><textarea value={f.note} onChange={(e) => set('note', e.target.value)} rows={2} placeholder="For example: GoFundMe donation, Oct 12, asked to be listed" className={`${inputCls} mt-1`} /></Field>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-700 dark:text-slate-200">
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.visible} onChange={(e) => set('visible', e.target.checked)} /> Show on the wall</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.pinned} onChange={(e) => set('pinned', e.target.checked)} /> Pin to the top of its level</label>
        </div>
        <div className="flex gap-2 mt-4"><Btn tone="primary" busy={busy === 'save'} onClick={save}><Heart className="w-4 h-4" />{isNew ? 'Add to wall' : 'Save'}</Btn><Btn tone="ghost" onClick={onClose}>Cancel</Btn></div>
      </Card>
    </Drawer>
  );
}
