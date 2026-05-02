import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markNotificationRead,
} from '../context/notificationSlice';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.notifications);
  const doNotDisturb = useSelector((state) => state.settings.flatSettings.doNotDisturb);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [cachedCount, setCachedCount] = useState(0);

  const unreadCount = useMemo(
    () => items.filter((notification) => !notification.read).length,
    [items]
  );

  useEffect(() => {
    dispatch(fetchNotifications());

    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (doNotDisturb) {
      setToast(null);
      setCachedCount(unreadCount);
      return;
    }

    if (unreadCount > cachedCount && unreadCount > 0) {
      const newest = items.find((notification) => !notification.read);
      if (newest) {
        setToast(`New alert: ${newest.message}`);
        window.setTimeout(() => setToast(null), 4000);
      }
    }
    setCachedCount(unreadCount);
  }, [unreadCount, cachedCount, items, doNotDisturb]);

  const handleRead = async (id) => {
    await dispatch(markNotificationRead(id));
  };

  return (
    <div className="relative">
      {toast && (
        <div className="fixed right-4 top-20 z-50 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 text-sm text-slate-800">
          <div className="font-semibold mb-1">Notification</div>
          <div>{toast}</div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-white"
      >
        <span className="text-xl">🔔</span>
        {!doNotDisturb && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-h-[420px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl z-50">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">Notifications</span>
              <span className="text-xs text-slate-500">{unreadCount} unread</span>
            </div>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {doNotDisturb ? (
              <div className="p-4 text-sm text-slate-500">
                Do Not Disturb is enabled. Notifications are hidden.
              </div>
            ) : items.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">No notifications yet.</div>
            ) : (
              items.map((notification) => (
                <div
                  key={notification._id}
                  className={`border-b border-slate-100 px-4 py-3 transition-colors ${
                    notification.read ? 'bg-white' : 'bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{notification.message}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        type="button"
                        onClick={() => handleRead(notification._id)}
                        className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-600"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
