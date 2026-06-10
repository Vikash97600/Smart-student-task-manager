import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { logout } from '../context/authSlice';
import { fetchStats, fetchTasks } from '../context/taskSlice';
import NotificationBell from './NotificationBell';
import ProfileDropdown from './ProfileDropdown';

// Sidebar navigation items
const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', activeIcon: 'LayoutDashboardFill' },
  { path: '/tasks', label: 'Tasks', icon: 'ListTodo', activeIcon: 'ListTodoFill' },
  { path: '/calendar', label: 'Calendar', icon: 'Calendar', activeIcon: 'CalendarFill' },
  { path: '/report', label: 'Reports', icon: 'BarChart3', activeIcon: 'BarChart3Fill' },
  { path: '/settings', label: 'Settings', icon: 'Settings', activeIcon: 'SettingsFill' },
];

function NavIcon({ name, active }) {
  const props = { className: 'w-5 h-5', fill: active ? 'currentColor' : 'none', stroke: active ? 'none' : 'currentColor', strokeWidth: 1.5, viewBox: '0 0 24 24' };

  const icons = {
    LayoutDashboard: <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
    LayoutDashboardFill: <svg {...props}><path d="M3.75 3A.75.75 0 003 3.75v2.25A.75.75 0 003.75 6.75h2.25a.75.75 0 00.75-.75V3.75A.75.75 0 006.75 3H3.75zM3.75 13.5a.75.75 0 00-.75.75v2.25c0 .414.336.75.75.75h2.25a.75.75 0 00.75-.75v-2.25a.75.75 0 00-.75-.75H3.75zM13.5 3.75A.75.75 0 0114.25 3h2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-2.25a.75.75 0 01-.75-.75V3.75zM13.5 13.5a.75.75 0 00-.75.75v2.25c0 .414.336.75.75.75h2.25a.75.75 0 00.75-.75v-2.25a.75.75 0 00-.75-.75h-2.25z" /></svg>,

    ListTodo: <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>,
    ListTodoFill: <svg {...props}><path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clipRule="evenodd" /><path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zm9.586 4.594a.75.75 0 00-1.172-.938l-2.476 3.096-.908-.907a.75.75 0 00-1.06 1.06l1.5 1.5a.75.75 0 001.116-.062l3-3.75z" clipRule="evenodd" /></svg>,

    Calendar: <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
    CalendarFill: <svg {...props}><path d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" /></svg>,

    BarChart3: <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
    BarChart3Fill: <svg {...props}><path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" /></svg>,

    Settings: <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    SettingsFill: <svg {...props}><path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567l-.09.542a.569.569 0 01-.427.464.58.58 0 01-.272-.005l-.415-.11a1.875 1.875 0 00-1.943.546l-1.297 1.565a1.88 1.88 0 00-.348 1.478c.066.385.162.761.287 1.126a.564.564 0 01-.073.531.524.524 0 01-.482.263l-.555-.031a1.875 1.875 0 00-1.88 1.638l-.177 1.972c-.04.44.12.87.425 1.192l.38.4a.57.57 0 01.14.518.574.574 0 01-.304.393l-.46.237a1.875 1.875 0 00-.884 1.931c.098.434.27.85.512 1.23l1.096 1.657a1.875 1.875 0 001.84.756l.516-.093a.573.573 0 01.529.198.565.565 0 01.126.48l-.14.572a1.876 1.876 0 001.291 2.187l1.934.55c.437.124.905.025 1.25-.266l.384-.324a.568.568 0 01.478-.143.55.55 0 01.396.287l.25.502a1.876 1.876 0 001.628.966h1.883a1.876 1.876 0 001.628-.966l.25-.502a.55.55 0 01.396-.287.568.568 0 01.478.143l.384.324c.345.291.813.39 1.25.266l1.934-.55a1.876 1.876 0 001.29-2.187l-.14-.572a.565.565 0 01.126-.48.573.573 0 01.53-.198l.515.093a1.875 1.875 0 001.84-.756l1.097-1.658c.241-.38.413-.795.511-1.23a1.875 1.875 0 00-.884-1.93l-.46-.238a.574.574 0 01-.304-.393.57.57 0 01.14-.518l.38-.4c.305-.323.465-.752.425-1.192l-.177-1.972a1.875 1.875 0 00-1.88-1.638l-.555.03a.524.524 0 01-.482-.262.564.564 0 01-.073-.532c.125-.365.221-.74.287-1.126a1.88 1.88 0 00-.348-1.478l-1.297-1.565a1.875 1.875 0 00-1.943-.546l-.415.11a.58.58 0 01-.272.005.569.569 0 01-.427-.464l-.09-.542a1.878 1.878 0 00-1.85-1.567h-1.844zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" clipRule="evenodd" /></svg>,
  };

  return icons[name] || null;
}

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { flatSettings } = useSelector((state) => state.settings);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTasks());
      dispatch(fetchStats());
    }
  }, [isAuthenticated, dispatch]);

  const handleLogout = async () => {
    try { await authService.logout(); }
    catch (error) { console.error('Logout error:', error); }
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/tasks') return location.pathname.startsWith('/tasks');
    return location.pathname === path;
  };

  if (!isAuthenticated) return <Outlet />;

  return (
    <div className="min-h-screen flex w-full max-w-full overflow-hidden" style={{ background: 'var(--surface-bg)' }}>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 68 : 260 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed left-0 top-0 h-full z-50 flex flex-col ${sidebarCollapsed ? 'w-[68px]' : 'w-[260px]'} lg:relative ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{
          background: 'var(--surface-sidebar)',
          backdropFilter: 'blur(20px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
          borderRight: '1px solid var(--surface-card-border)',
          transition: 'width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200/20 dark:border-gray-700/30">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
              S
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <h1 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    <span style={{ color: 'var(--color-primary)' }}>Smart</span> Tasks
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-gray-500/10 transition-colors shrink-0 hidden lg:flex"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`sidebar-link ${active ? 'active' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="shrink-0">
                  <NavIcon name={active ? item.activeIcon : item.icon} active={active} />
                </span>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && !sidebarCollapsed && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(59,130,246,0.1)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-200/20 dark:border-gray-700/30">
          {!sidebarCollapsed ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <span>Logout</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
          >
            <svg className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
        {/* Top Navbar */}
        <header
          className="h-16 flex items-center px-4 lg:px-6 border-b border-gray-200/20 dark:border-gray-700/30 z-30 sticky top-0"
          style={{
            background: 'var(--surface-navbar)',
            backdropFilter: 'blur(16px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(16px) saturate(1.8)',
          }}
        >
          {/* Mobile menu & sidebar toggle */}
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-500/10 transition-colors lg:hidden"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-9 h-9 rounded-xl items-center justify-center hover:bg-gray-500/10 transition-colors hidden lg:flex"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={sidebarCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
              </svg>
            </button>

            {/* Page Title */}
            <div className="hidden sm:block">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {navItems.find((n) => isActive(n.path))?.label || 'Dashboard'}
              </h2>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ProfileDropdown />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
