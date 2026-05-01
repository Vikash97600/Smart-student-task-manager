import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  cognitiveLoadSensitivity: {
    type: Number,
    min: 0.5,
    max: 1.5,
    default: 1.0, // 1.0 = baseline, <1 = more sensitive, >1 = less sensitive
  },
  notificationPaused: {
    type: Boolean,
    default: false,
  },
  lastSuggestionResponse: {
    type: String,
    enum: ['NONE', 'BREAK_TAKEN', 'TASK_SWITCHED', 'IGNORED'],
    default: 'NONE',
  },
  autoAdjustEnabled: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

export default UserSettings;
