import mongoose from 'mongoose';

/**
 * Comprehensive User Settings Schema
 * Organized into logical categories for maintainability
 */
const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  // ===== COGNITIVE LOAD SETTINGS =====
  cognitiveLoad: {
    sensitivity: {
      type: Number,
      min: 0.5,
      max: 1.5,
      default: 1.0, // 1.0 = baseline, <1 = more sensitive, >1 = less sensitive
      description: 'Multiplier for cognitive load thresholds',
    },
    autoAdjustEnabled: {
      type: Boolean,
      default: true,
      description: 'Automatically adjust sensitivity based on responsiveness',
    },
    notificationPaused: {
      type: Boolean,
      default: false,
      description: 'Temporarily pause cognitive load notifications',
    },
    enableBreakReminders: {
      type: Boolean,
      default: true,
      description: 'Show break suggestion notifications',
    },
  },

  // ===== BREAK PREFERENCES =====
  breakPreferences: {
    breakDuration: {
      type: Number,
      min: 5,
      max: 30,
      default: 10,
      description: 'Suggested break duration in minutes',
    },
    breakFrequency: {
      type: Number,
      min: 25,
      max: 120,
      default: 60,
      description: 'Maximum work minutes before suggesting a break (Pomodoro-style)',
    },
    suggestedBreakActivities: {
      type: [String],
      enum: ['stretch', 'walk', 'meditate', 'hydrate', 'snack', 'eye-rest'],
      default: ['stretch', 'walk', 'hydrate'],
      description: 'Recommended activities during breaks',
    },
    enableBreakReminders: {
      type: Boolean,
      default: true,
      description: 'Enable periodic break reminders based on work duration',
    },
  },

  // ===== NOTIFICATION BEHAVIOR =====
  notifications: {
    pushNotifications: {
      type: Boolean,
      default: true,
      description: 'Enable in-app push notifications',
    },
    emailNotifications: {
      type: Boolean,
      default: false,
      description: 'Receive notifications via email',
    },
    frequency: {
      type: String,
      enum: ['immediate', 'batched', 'hourly-digest', 'daily-digest'],
      default: 'immediate',
      description: 'How often to deliver notifications',
    },
    quietHoursStart: {
      type: String,
      default: '22:00',
      description: 'Start of quiet hours (HH:MM 24-hour format)',
    },
    quietHoursEnd: {
      type: String,
      default: '07:00',
      description: 'End of quiet hours (HH:MM 24-hour format)',
    },
    doNotDisturb: {
      type: Boolean,
      default: false,
      description: 'Disable all notifications temporarily',
    },
  },

  // ===== UI PREFERENCES =====
  ui: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
      description: 'Color scheme preference',
    },
    animationsEnabled: {
      type: Boolean,
      default: true,
      description: 'Enable UI animations and transitions',
    },
    compactMode: {
      type: Boolean,
      default: false,
      description: 'Use denser UI layout (smaller spacing, smaller fonts)',
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
      description: 'Base font size for UI',
    },
    colorScheme: {
      type: String,
      enum: ['blue', 'green', 'purple', 'rose'],
      default: 'blue',
      description: 'Primary accent color for UI elements',
    },
    showCognitiveLoadPanel: {
      type: Boolean,
      default: true,
      description: 'Display cognitive load indicator panel',
    },
  },

  // Legacy support for existing fields
  lastSuggestionResponse: {
    type: String,
    enum: ['NONE', 'BREAK_TAKEN', 'TASK_SWITCHED', 'IGNORED'],
    default: 'NONE',
  },
}, {
  timestamps: true,
});

// Index for faster queries
userSettingsSchema.index({ userId: 1 });

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

export default UserSettings;
