import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../context/authSlice';
import { updateLocalSetting } from '../context/settingsSlice';
import { userService } from '../services/api';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({ tasksCompletedToday: 0, pendingTasks: 0, upcomingDeadlines: 0, weeklyProgress: 0 });
  const [profileData, setProfileData] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { flatSettings } = useSelector((state) => state.settings);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchProfileData();
      fetchUserStats();
    }
  }, [isOpen]);

  const fetchProfileData = async () => {
    try {
      const response = await userService.getProfile();
      if (response.success) setProfileData(response.data);
    } catch (error) { console.error('Failed to fetch profile:', error); }
  };

  const fetchUserStats = async () => {
    try {
      const response = await userService.getStats();
      if (response.success) setStats(response.data);
    } catch (error) { console.error('Failed to fetch stats:', error); }
  };

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); }
    catch (error) { console.error('Logout error:', error); }
    dispatch(logout());
    navigate('/login');
  };

  const toggleTheme = () => {
    const currentTheme = flatSettings?.theme || 'auto';
    const themes = ['auto', 'light', 'dark'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    dispatch(updateLocalSetting({ category: 'ui', field: 'theme', value: nextTheme }));
  };

  const getThemeIcon = () => {
    switch (flatSettings?.theme || 'auto') {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      default: return '🌓';
    }
  };

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'U';
  const formatLastLogin = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 dark:hover:bg-gray-700/30 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
          {profileData?.avatar ? (
            <img src={profileData.avatar} alt="" className="w-full h-full object-cover rounded-lg" />
          ) : (
            getInitials(user?.name)
          )}
        </div>
        <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--text-primary)' }}>
          {user?.name?.split(' ')[0]}
        </span>
        <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 origin-top-right glass-strong rounded-2xl overflow-hidden shadow-elevated z-50"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-200/20 dark:border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {profileData?.avatar ? (
                    <img src={profileData.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    getInitials(user?.name)
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{user?.name}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/30">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>Productivity Today</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(59,130,246,0.08)' }}>
                  <div className="text-xl font-bold text-blue-500">{stats.tasksCompletedToday}</div>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Completed</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(234,179,8,0.08)' }}>
                  <div className="text-xl font-bold text-yellow-500">{stats.pendingTasks}</div>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Pending</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: 'var(--text-tertiary)' }}>Weekly Progress</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{stats.weeklyProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: 'rgba(148,163,184,0.15)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.weeklyProgress}%` }}
                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <MenuItem icon="👤" label="View Profile" onClick={() => { setIsOpen(false); navigate('/profile'); }} />
              <MenuItem icon="⚙️" label="Settings" onClick={() => { setIsOpen(false); navigate('/settings'); }} />
              <MenuItem icon={getThemeIcon()} label={`Theme: ${flatSettings?.theme || 'auto'}`} onClick={toggleTheme} />
              <div className="my-1 border-t border-gray-200/20 dark:border-gray-700/30" />
              <MenuItem icon="🚪" label="Logout" onClick={handleLogout} danger />
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-200/20 dark:border-gray-700/30">
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                Last login: {formatLastLogin(profileData?.lastLogin)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger = false }) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
        danger
          ? 'text-red-500 hover:bg-red-500/10'
          : 'hover:bg-gray-500/10'
      }`}
      style={{ color: danger ? undefined : 'var(--text-secondary)' }}
    >
      <span>{icon}</span>
      <span className={danger ? 'text-red-500' : ''}>{label}</span>
    </motion.button>
  );
}
