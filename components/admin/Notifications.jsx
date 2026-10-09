'use client';

import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useApi, post, useToast, Card, Badge, Btn, Loading, ErrorBox, Empty, ago } from './ui';

export default function NotificationsSection({ onChange, go }) {
  const { data, error, loading, reload } = useApi('/api/admin/notifications');
  const [toast, show] = useToast();
  async function act(action, id) {
    const r = await post('/api/admin/notifications', { action, id });
    if (action !== 'read') show(r);
    reload(); onChange?.();
  }
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox>{error}</ErrorBox>;
  return (
    <Card title={<span className="flex items-center gap-2"><Bell className="w-4 h-4 text-amber-500" />Notifications {data.unread > 0 && <Badge tone="amber">{data.unread} unread</Badge>}</span>}
      action={<div className="flex gap-2"><Btn size="xs" disabled={!data.unread} onClick={() => act('read_all')}><CheckCheck className="w-3.5 h-3.5" />Mark all read</Btn><Btn size="xs" tone="ghost" onClick={() => act('delete_read')}><Trash2 className="w-3.5 h-3.5" />Clear read</Btn></div>}>
      {toast}
      {data.rows.length ? (
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {data.rows.map((n) => (
            <li key={n.id} className={`py-3 flex gap-3 ${n.is_read ? 'opacity-60' : ''}`}>
              <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.is_read ? 'bg-transparent' : 'bg-amber-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-slate-900 dark:text-white">{n.title}</span><Badge>{n.type}</Badge><span className="text-xs text-slate-500 dark:text-slate-400">{ago(n.created_at)}</span></div>
                {n.body && <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5 break-words">{n.body}</p>}
                <div className="flex gap-3 mt-1">
                  {['image', 'images', 'link', 'short_link', 'report'].includes(n.target_type) && <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline" onClick={() => { if (!n.is_read) act('read', n.id); go('moderation'); }}>Review</button>}
                  {!n.is_read && <button className="text-xs font-semibold text-slate-500 hover:underline" onClick={() => act('read', n.id)}>Mark read</button>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : <Empty>No notifications.</Empty>}
    </Card>
  );
}
