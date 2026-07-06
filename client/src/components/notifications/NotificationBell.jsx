import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../api';

const POLL_INTERVAL_MS = 30000;

export function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { notifications: list } = await api.notifications.list({ unreadOnly: true, limit: 10 });
      setNotifications(list);
    } catch {
      // Silent: a failed background poll shouldn't interrupt the user.
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    function onClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  async function markRead(id) {
    await api.notifications.markRead(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  async function markAllRead() {
    await api.notifications.markAllRead();
    setNotifications([]);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={`Notifications${notifications.length ? `, ${notifications.length} unread` : ''}`}
        className="relative rounded-md p-2 text-brand-500 hover:bg-brand-100"
      >
        🔔
        {notifications.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-gradient px-1 text-[10px] font-semibold text-white">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-lg border border-brand-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-brand-100 p-3">
            <span className="text-sm font-medium">Notifications</span>
            {notifications.length > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs text-brand-500 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="p-4 text-center text-sm text-brand-400">You're all caught up.</li>
            )}
            {notifications.map((n) => (
              <li key={n.id} className="border-b border-brand-50 p-3 text-sm last:border-0">
                <p className="text-brand-700">{n.payload?.message || n.event_type}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-brand-400">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className="text-xs text-brand-500 hover:underline"
                  >
                    Mark read
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
