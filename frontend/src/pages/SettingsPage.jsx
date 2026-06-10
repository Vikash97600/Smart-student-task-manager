import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, resetSettings, updateSettings } from '../context/settingsSlice';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { flatSettings, loading, initialized } = useSelector((state) => state.settings);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('notifications');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchSettings());
  }, [isAuthenticated, dispatch]);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSectionChange = async (section, field, value) => {
    const updateKey = `${section}.${field}`;
    try {
      await dispatch(updateSettings({ [updateKey]: value })).unwrap();
      showSuccess('Setting updated');
    } catch (error) {
      showSuccess(error?.message || 'Error updating setting');
    }
  };

  const handleReset = async () => {
    try {
      await dispatch(resetSettings()).unwrap();
      dispatch(fetchSettings());
      showSuccess('Settings reset to defaults');
      setResetConfirm(false);
    } catch (error) {
      showSuccess('Error resetting settings');
    }
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'ui', label: 'Appearance', icon: '🎨' },
  ];

  if (!initialized && loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Customize your experience</p>
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mb-5 p-3.5 rounded-xl flex items-center gap-2.5 text-sm"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
            <span>✅</span><span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        {/* Sidebar Tabs */}
        <nav className="md:w-52 shrink-0">
          <div className="glass rounded-2xl p-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'hover:bg-gray-500/5'
                }`}
                style={{ color: activeTab === tab.id ? undefined : 'var(--text-secondary)' }}>
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Reset Button */}
          <div className="mt-6 glass rounded-2xl p-4">
            {!resetConfirm ? (
              <button onClick={() => setResetConfirm(true)}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', background: 'rgba(239,68,68,0.05)' }}>
                Reset to Defaults
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-red-400">Are you sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={handleReset}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">
                    Yes, Reset
                  </button>
                  <button onClick={() => setResetConfirm(false)}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-medium hover:bg-gray-500/10 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            <div className="glass rounded-2xl p-4 sm:p-6 lg:p-8">
              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</h2>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Control how you receive alerts</p>
                  </div>

                  <ToggleSetting label="Push Notifications" description="In-app alerts and reminders"
                    checked={flatSettings.pushNotifications}
                    onChange={(v) => handleSectionChange('notifications', 'pushNotifications', v)} />

                  <ToggleSetting label="Email Notifications" description="Receive updates via email"
                    checked={flatSettings.emailNotifications}
                    onChange={(v) => handleSectionChange('notifications', 'emailNotifications', v)} />

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Notification Frequency</label>
                    <select value={flatSettings.notificationFrequency}
                      onChange={(e) => handleSectionChange('notifications', 'frequency', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm input-focus-ring"
                      style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)', color: 'var(--text-primary)' }}>
                      <option value="immediate">Immediate</option>
                      <option value="batched">Batched (Every 15 min)</option>
                      <option value="hourly-digest">Hourly Digest</option>
                      <option value="daily-digest">Daily Digest</option>
                    </select>
                  </div>

                  <ToggleSetting label="Do Not Disturb" description="Disable all notifications temporarily"
                    checked={flatSettings.doNotDisturb}
                    onChange={(v) => handleSectionChange('notifications', 'doNotDisturb', v)} />

                  {flatSettings.pushNotifications && !flatSettings.doNotDisturb && (
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl" style={{ background: 'rgba(148,163,184,0.06)' }}>
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Quiet Hours Start</label>
                        <input type="time" value={flatSettings.quietHoursStart}
                          onChange={(e) => handleSectionChange('notifications', 'quietHoursStart', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-sm input-focus-ring"
                          style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)', color: 'var(--text-primary)' }} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Quiet Hours End</label>
                        <input type="time" value={flatSettings.quietHoursEnd}
                          onChange={(e) => handleSectionChange('notifications', 'quietHoursEnd', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-sm input-focus-ring"
                          style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)', color: 'var(--text-primary)' }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* UI & Appearance Tab */}
              {activeTab === 'ui' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Appearance</h2>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Personalize the look and feel</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Color Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: 'Light', icon: '☀️' },
                        { value: 'dark', label: 'Dark', icon: '🌙' },
                        { value: 'auto', label: 'Auto', icon: '🔄' },
                      ].map((option) => (
                        <button key={option.value}
                          onClick={() => handleSectionChange('ui', 'theme', option.value)}
                          className={`p-4 rounded-xl text-center transition-all ${
                            flatSettings.theme === option.value
                              ? 'ring-2 ring-blue-500 bg-blue-500/10'
                              : 'hover:bg-gray-500/5'
                          }`}
                          style={{ border: `1px solid ${flatSettings.theme === option.value ? 'rgba(59,130,246,0.3)' : 'rgba(148,163,184,0.15)'}` }}>
                          <div className="text-2xl mb-1">{option.icon}</div>
                          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Accent Color</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
                        { value: 'green', label: 'Green', class: 'bg-green-500' },
                        { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
                        { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
                      ].map((color) => {
                        const isActive = flatSettings.colorScheme === color.value;
                        return (
                          <button key={color.value}
                            onClick={() => handleSectionChange('ui', 'colorScheme', color.value)}
                            className={`p-4 rounded-xl text-center transition-all ${
                              isActive ? 'ring-2 ring-blue-500' : 'hover:bg-gray-500/5'
                            }`}
                            style={{ border: `1px solid ${isActive ? 'rgba(59,130,246,0.3)' : 'rgba(148,163,184,0.15)'}` }}>
                            <div className={`w-full h-8 rounded-lg mb-1 ${color.class} ${isActive ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900' : ''}`} />
                            <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{color.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Font Size</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'small', label: 'Small', preview: 'Aa', size: 'text-xs' },
                        { value: 'medium', label: 'Medium', preview: 'Aa', size: 'text-sm' },
                        { value: 'large', label: 'Large', preview: 'Aa', size: 'text-base' },
                      ].map((size) => (
                        <button key={size.value}
                          onClick={() => handleSectionChange('ui', 'fontSize', size.value)}
                          className={`p-4 rounded-xl text-center transition-all ${
                            flatSettings.fontSize === size.value
                              ? 'ring-2 ring-blue-500 bg-blue-500/10'
                              : 'hover:bg-gray-500/5'
                          }`}
                          style={{ border: `1px solid ${flatSettings.fontSize === size.value ? 'rgba(59,130,246,0.3)' : 'rgba(148,163,184,0.15)'}` }}>
                          <div className={`font-bold mb-1 ${size.size}`} style={{ color: 'var(--text-primary)' }}>{size.preview}</div>
                          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{size.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <ToggleSetting label="Enable Animations" description="Smooth transitions and visual effects"
                    checked={flatSettings.animationsEnabled}
                    onChange={(v) => handleSectionChange('ui', 'animationsEnabled', v)} />

                  <ToggleSetting label="Compact Mode" description="Denser UI layout with less spacing"
                    checked={flatSettings.compactMode}
                    onChange={(v) => handleSectionChange('ui', 'compactMode', v)} />
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }) {
  return (
    <label className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all hover:bg-gray-500/5"
      style={{ background: 'rgba(148,163,184,0.04)', border: '1px solid rgba(148,163,184,0.1)' }}>
      <div>
        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{description}</div>
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </label>
  );
}
