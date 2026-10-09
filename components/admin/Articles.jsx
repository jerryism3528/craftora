'use client';

// Articles manager (moved unchanged from the original admin page).
import { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import ArticleEditor from '../ArticleEditor';

export default function ArticlesTab() {
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
