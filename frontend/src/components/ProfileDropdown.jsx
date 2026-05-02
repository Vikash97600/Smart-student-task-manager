import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../context/authSlice';
import { updateLocalSetting } from '../context/settingsSlice';
import { userService } from '../services/api';

function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({
    tasksCompletedToday: 0,
    pendingTasks: 0,
    upcomingDeadlines: 0,
    weeklyProgress: 0,
  });
  const [profileData, setProfileData] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { flatSettings } = useSelector((state) => state.settings);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
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
      if (response.success) {
        setProfileData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await userService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
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
    const theme = flatSettings?.theme || 'auto';
    switch (theme) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      default: return '🌓';
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const formatLastLogin = (date) => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-all duration-200 focus:outline-none"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
          {profileData?.avatar ? (
            <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            getInitials(user?.name)
          )}
        </div>
        <span className="text-sm text-gray-300 hidden sm:block">{user?.name}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                {profileData?.avatar ? (
                  <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  getInitials(user?.name)
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-gray-100 dark:border-slate-700">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Productivity Snapshot</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.tasksCompletedToday}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Completed Today</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pendingTasks}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Pending Tasks</div>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">Weekly Progress</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">{stats.weeklyProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.weeklyProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/profile');
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span>👤</span>
              <span>View Profile</span>
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/settings');
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span>{getThemeIcon()}</span>
              <span>Toggle Theme</span>
            </button>

            <hr className="my-2 border-gray-200 dark:border-slate-700" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>

          <div className="px-4 py-2 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last login: {formatLastLogin(profileData?.lastLogin)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;