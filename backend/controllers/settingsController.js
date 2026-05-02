import UserSettings from '../models/UserSettings.js';

/**
 * Get all user settings (comprehensive)
 */
export const getAllSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log('[SettingsController] GET /settings for user:', userId);

    let settings = await UserSettings.findOne({ userId });

    if (!settings) {
      settings = await UserSettings.create({ userId });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user settings
 * Supports partial updates across all categories
 * Accepts nested object structure
 * Example: { "cognitiveLoad.sensitivity": 1.2, "ui.theme": "dark" }
 */
export const updateSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    // Validate that we only allow known top-level keys
    const allowedTopLevelKeys = [
      'cognitiveLoad',
      'breakPreferences',
      'notifications',
      'ui',
      'lastSuggestionResponse'
    ];

    // Build update object with nested paths
    const updateObj = {};
    
    if (updates && typeof updates === 'object') {
      Object.keys(updates).forEach(key => {
        if (allowedTopLevelKeys.includes(key)) {
          updateObj[key] = updates[key];
        } else if (key.includes('.')) {
          // Support dot notation: "cognitiveLoad.sensitivity"
          const [parent, child] = key.split('.');
          if (allowedTopLevelKeys.includes(parent)) {
            if (!updateObj[parent]) updateObj[parent] = {};
            updateObj[parent][child] = updates[key];
          }
        }
      });
    }

    console.log('[SettingsController] PUT /settings for user:', userId, 'payload:', updates, 'updateObj:', updateObj);

    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: updateObj },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: settings,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset settings to defaults
 */
export const resetSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log('[SettingsController] DELETE /settings/reset for user:', userId);

    // Remove existing settings and create fresh ones
    await UserSettings.findOneAndDelete({ userId });
    
    const settings = await UserSettings.create({ userId });

    res.status(200).json({
      success: true,
      data: settings,
      message: 'Settings reset to defaults',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get settings summary for UI display
 * Returns flattened key-value pairs for easier frontend consumption
 */
export const getSettingsSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log('[SettingsController] GET /settings/summary for user:', userId);
    let settings = await UserSettings.findOne({ userId });

    if (!settings) {
      settings = await UserSettings.create({ userId });
    }

    // Flatten nested structure for easier frontend consumption
    const flatSettings = {
      // Cognitive Load
      cognitiveLoadSensitivity: settings.cognitiveLoad?.sensitivity || 1.0,
      autoAdjustEnabled: settings.cognitiveLoad?.autoAdjustEnabled ?? true,
      notificationPaused: settings.cognitiveLoad?.notificationPaused || false,
      cognitiveLoadEnableBreakReminders: settings.cognitiveLoad?.enableBreakReminders ?? true,

      // Break Preferences
      breakDuration: settings.breakPreferences?.breakDuration || 10,
      breakFrequency: settings.breakPreferences?.breakFrequency || 60,
      suggestedBreakActivities: settings.breakPreferences?.suggestedBreakActivities || ['stretch', 'walk', 'hydrate'],
      breakEnableReminders: settings.breakPreferences?.enableBreakReminders ?? true,

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
      showCognitiveLoadPanel: settings.ui?.showCognitiveLoadPanel ?? true,
    };

    res.status(200).json({
      success: true,
      data: flatSettings,
    });
  } catch (error) {
    next(error);
  }
};
