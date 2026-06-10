import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationRead } from '../context/notificationSlice';

export default function NotificationBell() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.notifications);
  const doNotDisturb = useSelector((state) => state.settings.flatSettings.doNotDisturb);
  const [open, setOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [cachedCount, setCachedCount] = useState(0);
  const dropdownRef = useRef(null);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  useEffect(() => {
    dispatch(fetchNotifications());
    const interval = setInterval(() => dispatch(fetchNotifications()), 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (doNotDisturb) { setToastMsg(null); setCachedCount(unreadCount); return; }
    if (unreadCount > cachedCount && unreadCount > 0) {
      const newest = items.find((n) => !n.read);
      if (newest) {
        setToastMsg(newest.message);
        setTimeout(() => setToastMsg(null), 4000);
      }
    }
    setCachedCount(unreadCount);
  }, [unreadCount, cachedCount, items, doNotDisturb]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRead = async (id) => {
    await dispatch(markNotificationRead(id));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="fixed top-20 right-4 z-50 glass-strong rounded-xl p-4 max-w-sm"
          >
            <div className="flex items-start gap-3">
              <span>🔔</span>
              <div>
                <div className="text-sm font-semibold mb-0.5">Notification</div>
                <div className="text-sm opacity-80">{toastMsg}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 dark:hover:bg-gray-700/30 transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {!doNotDisturb && unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 origin-top-right glass-strong rounded-2xl overflow-hidden shadow-elevated z-50"
          >
            <div className="px-5 py-4 border-b border-gray-200/20 dark:border-gray-700/30">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{unreadCount} unread</span>
              </div>
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {doNotDisturb ? (
                <div className="p-6 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  🔕 Do Not Disturb is enabled
                </div>
              ) : items.length === 0 ? (
                <div className="p-6 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  <span className="text-2xl block mb-2">🔔</span>
                  No notifications yet
                </div>
              ) : (
                items.map((notification) => (
                  <div
                    key={notification._id}
                    className={`px-5 py-3.5 border-b border-gray-100/50 dark:border-gray-700/20 transition-colors ${
                      notification.read ? '' : 'bg-blue-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {notification.message}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRead(notification._id)}
                          className="shrink-0 px-3 py-1 rounded-lg text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                        >
                          Read
                        </motion.button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
