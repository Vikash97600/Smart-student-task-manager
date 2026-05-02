import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
  // Full settings object (nested structure from backend)
  settings: {
    notifications: {
      pushNotifications: true,
      emailNotifications: false,
      frequency: 'immediate',
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      doNotDisturb: false,
    },
    ui: {
      theme: 'auto',
      animationsEnabled: true,
      compactMode: false,
      fontSize: 'medium',
      colorScheme: 'blue',
    },
  },
  // Flattened settings for easier component access
  flatSettings: {
    pushNotifications: true,
    emailNotifications: false,
    notificationFrequency: 'immediate',
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    doNotDisturb: false,
    theme: 'auto',
    animationsEnabled: true,
    compactMode: false,
    fontSize: 'medium',
    colorScheme: 'blue',
  },
  loading: false,
  error: null,
  initialized: false,
};

// Flatten nested settings object
const flattenSettings = (settings) => {
  if (!settings) return initialState.flatSettings;
  
  return {
    // Notifications
    pushNotifications: settings.notifications?.pushNotifications ?? true,
    emailNotifications: settings.notifications?.emailNotifications || false,
    notificationFrequency: settings.notifications?.frequency || 'immediate',
    quietHoursStart: settings.notifications?.quietHoursStart || '22:00',
    quietHoursEnd: settings.notifications?.quietHoursEnd || '07:00',
    doNotDisturb: settings.notifications?.doNotDisturb || false,
    
    // UI
    theme: settings.ui?.theme || 'auto',
    animationsEnabled: settings.ui?.animationsEnabled ?? true,
    compactMode: settings.ui?.compactMode || false,
    fontSize: settings.ui?.fontSize || 'medium',
    colorScheme: settings.ui?.colorScheme || 'blue',
  };
};

// Async thunks

/**
 * Fetch user settings from server
 */
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[SettingsSlice] Fetching settings from API...');
      const response = await api.get('/settings');
      console.log('[SettingsSlice] API Response:', response.data);
      const settings = response.data.data;
      console.log('[SettingsSlice] Settings loaded:', JSON.stringify(settings).substring(0, 200));
      return settings;
    } catch (error) {
      console.error('[SettingsSlice] Failed to fetch settings:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
    }
  }
);

/**
 * Update user settings on server
 * Accepts either nested object or flat key-value pairs
 */
export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (settingsData, { rejectWithValue }) => {
    try {
      console.log('[SettingsSlice] Updating settings with:', settingsData);
      const response = await api.put('/settings', settingsData);
      console.log('[SettingsSlice] Update response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('[SettingsSlice] Failed to update settings:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
    }
  }
);

/**
 * Reset settings to defaults
 */
export const resetSettings = createAsyncThunk(
  'settings/reset',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete('/settings/reset');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset settings');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
/**
     * Local update - updates state without API call
     * Useful for immediate UI feedback
     */
    updateLocalSetting: (state, action) => {
      const { category, field, value } = action.payload;
      
      console.log(`[SettingsSlice] updateLocalSetting: category=${category}, field=${field}, value=${value}`);
      
      // Update nested structure
      if (state.settings[category]) {
        state.settings[category][field] = value;
      }
      
      // Generate flat key with explicit mapping to match UI expectations
      // This ensures the flat key matches what SettingsPage and other components read
      let flatKey;
      
      // Explicit mapping for known settings categories to ensure flat state consistency
      if (category === 'notifications') {
        switch (field) {
          case 'pushNotifications':
            flatKey = 'pushNotifications';
            break;
          case 'emailNotifications':
            flatKey = 'emailNotifications';
            break;
          case 'frequency':
            flatKey = 'notificationFrequency';
            break;
          case 'quietHoursStart':
            flatKey = 'quietHoursStart';
            break;
          case 'quietHoursEnd':
            flatKey = 'quietHoursEnd';
            break;
          case 'doNotDisturb':
            flatKey = 'doNotDisturb';
            break;
          default:
            flatKey = category + field.charAt(0).toUpperCase() + field.slice(1);
        }
      } else if (category === 'ui') {
        switch (field) {
          case 'theme':
            flatKey = 'theme';
            break;
          case 'animationsEnabled':
            flatKey = 'animationsEnabled';
            break;
          case 'compactMode':
            flatKey = 'compactMode';
            break;
          case 'fontSize':
            flatKey = 'fontSize';
            break;
          case 'colorScheme':
            flatKey = 'colorScheme';
            break;
          default:
            flatKey = category + field.charAt(0).toUpperCase() + field.slice(1);
        }
      } else {
        flatKey = category + field.charAt(0).toUpperCase() + field.slice(1);
      }
      
      state.flatSettings[flatKey] = value;
      console.log(`[SettingsSlice] Mapped to flatKey: ${flatKey}, value now: ${state.flatSettings[flatKey]}`);
    },
    /**
     * Apply multiple local updates
     */
    applyLocalUpdates: (state, action) => {
      const updates = action.payload;
      
      Object.keys(updates).forEach(key => {
        if (key.includes('.')) {
          // Handle dot notation: "category.field"
          const [category, field] = key.split('.');
          if (state.settings[category]) {
            state.settings[category][field] = updates[key];
          }
          // Also update flat version
          const flatKey = category + field.charAt(0).toUpperCase() + field.slice(1);
          state.flatSettings[flatKey] = updates[key];
        } else {
          // Handle flat key - find which category it belongs to and update both
          state.flatSettings[key] = updates[key];
          // Also try to find in nested structure
          for (const cat of Object.keys(state.settings)) {
            const categoryFields = Object.keys(state.settings[cat]);
            if (categoryFields.includes(key)) {
              state.settings[cat][key] = updates[key];
            }
          }
        }
      });
    },
    /**
     * Reset to default (local only)
     */
    resetLocalSettings: (state) => {
      state.settings = { ...initialState.settings };
      state.flatSettings = { ...initialState.flatSettings };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.flatSettings = flattenSettings(action.payload);
        state.initialized = true;
        state.error = null;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.initialized = true; // Still mark as initialized even on error to avoid infinite retries
      })
      // Update Settings
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.flatSettings = flattenSettings(action.payload);
        state.error = null;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reset Settings
      .addCase(resetSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.flatSettings = flattenSettings(action.payload);
        state.error = null;
      })
      .addCase(resetSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateLocalSetting, applyLocalUpdates, resetLocalSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
