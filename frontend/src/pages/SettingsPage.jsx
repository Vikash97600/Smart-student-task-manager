import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, updateSettings, resetSettings } from '../context/settingsSlice';

function SettingsPage() {
  const dispatch = useDispatch();
  const { settings, flatSettings, loading, initialized } = useSelector((state) => state.settings);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [activeSection, setActiveSection] = useState('ui');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetConfirm, setResetConfirm] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchSettings());
    }
  }, [isAuthenticated, dispatch]);

  // Show success message transient
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle section-based updates
  const handleSectionChange = async (section, field, value) => {
    const updateKey = `${section}.${field}`;
    console.log('[SettingsPage] Updating setting:', updateKey, value);

    try {
      await dispatch(updateSettings({ [updateKey]: value })).unwrap();
      showSuccess(`${getSectionLabel(section)} setting updated`);
    } catch (error) {
      showSuccess(error?.message || 'Error updating setting');
    }
  };

  // Reset all settings
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

  // Helper to get display label for section
  const getSectionLabel = (section) => {
    const labels = {
      notifications: 'Notifications',
      ui: 'UI & Appearance',
    };
    return labels[section] || section;
  };

  if (!initialized && loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-gray-600">
          Customize your task manager experience
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg animate-fade-in">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <nav className="md:w-64 flex-shrink-0">
          <ul className="space-y-2">
            {[
              { id: 'notifications', label: 'Notifications', icon: '🔔' },
              { id: 'ui', label: 'UI & Appearance', icon: '🎨' },
            ].map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="text-xl">{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Reset Button */}
          <div className="mt-8 pt-6 border-t">
            {!resetConfirm ? (
              <button
                onClick={() => setResetConfirm(true)}
                className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
              >
                Reset to Defaults
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-red-600">Are you sure?</p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            
            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Notifications</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Control how and when you receive alerts
                  </p>
                </div>

                {/* Push Notifications Toggle */}
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">Push Notifications</div>
                    <div className="text-xs text-gray-500">In-app alerts and reminders</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={flatSettings.pushNotifications}
                    onChange={(e) => handleSectionChange('notifications', 'pushNotifications', e.target.checked)}
                    className="h-6 w-11 rounded-full cursor-pointer accent-blue-600"
                  />
                </label>

                {/* Email Notifications Toggle */}
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">Email Notifications</div>
                    <div className="text-xs text-gray-500">Receive updates via email</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={flatSettings.emailNotifications}
                    onChange={(e) => handleSectionChange('notifications', 'emailNotifications', e.target.checked)}
                    className="h-6 w-11 rounded-full cursor-pointer accent-blue-600"
                  />
                </label>

                {/* Notification Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Frequency
                  </label>
                  <select
                    value={flatSettings.notificationFrequency}
                    onChange={(e) => handleSectionChange('notifications', 'frequency', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="batched">Batched (Every 15 min)</option>
                    <option value="hourly-digest">Hourly Digest</option>
                    <option value="daily-digest">Daily Digest</option>
                  </select>
                </div>

                {/* Do Not Disturb */}
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">Do Not Disturb</div>
                    <div className="text-xs text-gray-500">Disable all notifications temporarily</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={flatSettings.doNotDisturb}
                    onChange={(e) => handleSectionChange('notifications', 'doNotDisturb', e.target.checked)}
                    className="h-6 w-11 rounded-full cursor-pointer accent-blue-600"
                  />
                </label>

                {/* Quiet Hours (only if push notifications enabled) */}
                {flatSettings.pushNotifications && !flatSettings.doNotDisturb && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quiet Hours Start
                      </label>
                      <input
                        type="time"
                        value={flatSettings.quietHoursStart}
                        onChange={(e) => handleSectionChange('notifications', 'quietHoursStart', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quiet Hours End
                      </label>
                      <input
                        type="time"
                        value={flatSettings.quietHoursEnd}
                        onChange={(e) => handleSectionChange('notifications', 'quietHoursEnd', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* UI & Appearance Section */}
            {activeSection === 'ui' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">UI & Appearance</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Personalize the look and feel of the app
                  </p>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Theme
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: '☀️' },
                      { value: 'dark', label: 'Dark', icon: '🌙' },
                      { value: 'auto', label: 'Auto', icon: '🔄' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSectionChange('ui', 'theme', option.value)}
                        className={`flex-1 p-4 border rounded-lg transition-all ${
                          flatSettings.theme === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{option.icon}</div>
                        <div className="text-sm font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Scheme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
                      { value: 'green', label: 'Green', class: 'bg-green-500' },
                      { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
                      { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
                    ].map((color) => (
                      <button
                        key={color.value}
                        onClick={() => {
                          // Update CSS custom properties
                          const root = document.documentElement;
                          const colorMap = {
                            blue: { primary: '#3b82f6', ring: '#2563eb', light: '#dbeafe' },
                            green: { primary: '#10b981', ring: '#059669', light: '#d1fae5' },
                            purple: { primary: '#8b5cf6', ring: '#7c3aed', light: '#ede9fe' },
                            rose: { primary: '#f43f5e', ring: '#e11d48', light: '#ffe4e6' },
                          };
                          if (colorMap[color.value]) {
                            root.style.setProperty('--color-primary', colorMap[color.value].primary);
                            root.style.setProperty('--color-primary-ring', colorMap[color.value].ring);
                            root.style.setProperty('--color-primary-light', colorMap[color.value].light);
                          }
                          handleSectionChange('ui', 'colorScheme', color.value);
                        }}
                        className={`flex-1 p-4 border rounded-lg transition-all ${
                          flatSettings.colorScheme === color.value
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className={`w-full h-8 rounded mb-2 ${color.class}`}></div>
                        <div className="text-sm font-medium text-gray-700">{color.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'small', label: 'Small', class: 'text-sm' },
                      { value: 'medium', label: 'Medium', class: 'text-base' },
                      { value: 'large', label: 'Large', class: 'text-lg' },
                    ].map((size) => (
                      <button
                        key={size.value}
                        onClick={() => handleSectionChange('ui', 'fontSize', size.value)}
                        className={`flex-1 p-3 border rounded-lg transition-all ${
                          flatSettings.fontSize === size.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300'
                        } ${size.class}`}
                      >
                        <div className="font-medium">Aa</div>
                        <div className="text-xs mt-1">{size.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animations Toggle */}
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">Enable Animations</div>
                    <div className="text-xs text-gray-500">Smooth transitions and visual effects</div>
                  </div>
                  <button
                    onClick={() => handleSectionChange('ui', 'animationsEnabled', !flatSettings.animationsEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      flatSettings.animationsEnabled ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        flatSettings.animationsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>

                {/* Compact Mode Toggle */}
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">Compact Mode</div>
                    <div className="text-xs text-gray-500">Denser UI layout with less spacing</div>
                  </div>
                  <button
                    onClick={() => handleSectionChange('ui', 'compactMode', !flatSettings.compactMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      flatSettings.compactMode ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        flatSettings.compactMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default SettingsPage;
