'use client';

import { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ArticleEditor from '../../components/ArticleEditor';

export default function AdminPage() {
  const [tab, setTab] = useState('users');

  return (
    <div>
      <Header />
      <main className="editorial-width px-4 sm:px-7 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Lucide.ShieldCheck className="w-7 h-7 brand-text" />
          <h1 className="font-extrabold text-2xl" style={{ color: 'var(--ink)' }}>Admin panel</h1>
        </div>

        <div className="flex gap-2 mb-8 border-b surface">
          {[['users', 'Users'], ['articles', 'Articles'], ['activity', 'Activity']].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className="px-4 py-2.5 text-sm font-bold border-b-2 -mb-px" style={{ color: tab === k ? 'var(--brand)' : 'var(--muted)', borderColor: tab === k ? 'var(--brand)' : 'transparent' }}>{label}</button>
          ))}
        </div>

        {tab === 'users' && <UsersTab />}
        {tab === 'articles' && <ArticlesTab />}
        {tab === 'activity' && <ActivityTab />}
      </main>
      <Footer />
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function act(action, userId, extra = {}) {
    setMsg('');
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, userId, ...extra }),
    });
    const data = await res.json();
    if (!data.ok) { setMsg(data.error || 'Action failed.'); return; }
    setMsg(data.message || 'Done.');
    load();
  }

  const filtered = users.filter((u) => !q || u.email.toLowerCase().includes(q.toLowerCase()) || (u.username || '').toLowerCase().includes(q.toLowerCase()));

  if (loading) return <p className="muted text-sm">Loading users...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by email or username" className="rounded-xl border surface px-4 py-2 text-sm bg-transparent w-full max-w-xs" style={{ color: 'var(--ink)' }} />
        <span className="muted text-sm shrink-0">{filtered.length} users</span>
      </div>
      {msg && <p className="text-sm mb-3 brand-text">{msg}</p>}
      <div className="space-y-3">
        {filtered.map((u) => (
          <div key={u.id} className="border surface rounded-xl p-4" style={{ background: 'var(--surface)' }}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{u.username || '(no username)'} {u.is_admin && <span className="brand-text text-xs">ADMIN</span>}</p>
                <p className="muted text-xs">{u.email}</p>
                <p className="muted text-xs mt-1">Joined {new Date(u.created_at).toLocaleDateString()} {u.suspended && <span style={{ color: '#b3261e' }}>· SUSPENDED</span>}</p>
              </div>
              {!u.is_admin && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => act('reset_limits', u.id)} className="rounded-lg px-3 py-1.5 text-xs font-semibold border surface" style={{ color: 'var(--ink)' }}>Reset limits</button>
                  <button onClick={() => { const t = prompt('Tool slug to block (e.g. email-verifier):'); if (t) act('block_tool', u.id, { tool: t }); }} className="rounded-lg px-3 py-1.5 text-xs font-semibold border surface" style={{ color: 'var(--ink)' }}>Block tool</button>
                  <button onClick={() => { const d = prompt('Suspend for how many days?', '7'); if (d) act('suspend', u.id, { days: Number(d) }); }} className="rounded-lg px-3 py-1.5 text-xs font-semibold border surface" style={{ color: '#c98a13' }}>Suspend</button>
                  {u.suspended && <button onClick={() => act('unsuspend', u.id)} className="rounded-lg px-3 py-1.5 text-xs font-semibold border surface" style={{ color: 'var(--mint)' }}>Unsuspend</button>}
                  <button onClick={() => { if (confirm('Delete this user permanently? This cannot be undone.')) act('delete', u.id); }} className="rounded-lg px-3 py-1.5 text-xs font-semibold border surface" style={{ color: '#b3261e' }}>Delete</button>
                </div>
              )}
            </div>
            {u.blocked_tools && u.blocked_tools.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {u.blocked_tools.map((t) => (
                  <span key={t} className="rounded-md px-2 py-1 text-xs inline-flex items-center gap-1" style={{ background: 'var(--surface-soft)', color: '#b3261e' }}>
                    {t} <button onClick={() => act('unblock_tool', u.id, { tool: t })}><Lucide.X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ArticlesTab() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | article object
  const [msg, setMsg] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/articles');
    const data = await res.json();
    setArticles(data.articles || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function openEdit(id) {
    const res = await fetch('/api/admin/articles/get?id=' + id);
    const data = await res.json();
    if (data.ok) setEditing(data.article);
  }

  async function del(id) {
    if (!confirm('Delete this article permanently?')) return;
    const res = await fetch('/api/admin/articles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.ok) { setMsg('Article deleted.'); load(); }
    else setMsg(data.error || 'Delete failed.');
  }

  if (editing) {
    return (
      <ArticleEditor
        initial={editing === 'new' ? null : editing}
        onSaved={() => { setEditing(null); setMsg('Article saved.'); load(); }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  if (loading) return <p className="muted text-sm">Loading articles...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="muted text-sm">{articles.length} articles</span>
        <button onClick={() => setEditing('new')} className="rounded-xl px-5 py-2.5 font-bold text-sm inline-flex items-center gap-2" style={{ background: 'var(--brand)', color: '#fff' }}>
          <Lucide.Plus className="w-4 h-4" /> New article
        </button>
      </div>
      {msg && <p className="text-sm mb-3 brand-text">{msg}</p>}
      <div className="space-y-3">
        {articles.map((art) => (
          <div key={art.id} className="border surface rounded-xl p-4 flex items-start justify-between gap-3 flex-wrap" style={{ background: 'var(--surface)' }}>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>
                {art.title}
                {art.published
                  ? <span className="ml-2 text-xs" style={{ color: 'var(--mint)' }}>PUBLISHED</span>
                  : <span className="ml-2 text-xs muted">DRAFT</span>}
              </p>
              <p className="muted text-xs mt-1">/insights/{art.slug} · updated {new Date(art.updated_at).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <a href={'/insights/' + art.slug} target="_blank" rel="noreferrer" className="rounded-lg px-3 py-1.5 text-xs font-semibold border surface" style={{ color: 'var(--ink)' }}>View</a>
              <button onClick={() => openEdit(art.id)} className="rounded-lg px-3 py-1.5 text-xs font-semibold border surface" style={{ color: 'var(--ink)' }}>Edit</button>
              <button onClick={() => del(art.id)} className="rounded-lg px-3 py-1.5 text-xs font-semibold border surface" style={{ color: '#b3261e' }}>Delete</button>
            </div>
          </div>
        ))}
        {articles.length === 0 && <p className="muted text-sm">No articles yet. Click New article to write your first post.</p>}
      </div>
    </div>
  );
}

function ActivityTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/activity');
      const data = await res.json();
      setLogs(data.logs || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="muted text-sm">Loading activity...</p>;
  if (!logs.length) return <p className="muted text-sm">No activity logged yet.</p>;

  return (
    <div className="space-y-2">
      {logs.map((l, i) => (
        <div key={i} className="border surface rounded-xl p-3 text-sm flex justify-between gap-3" style={{ background: 'var(--surface)' }}>
          <span style={{ color: 'var(--ink)' }}>{l.email || 'anon'} used <strong>{l.tool_slug}</strong> ({l.amount})</span>
          <span className="muted text-xs shrink-0">{new Date(l.created_at).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
