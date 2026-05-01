import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  difficulty: {
    type: Number,
    enum: [1, 2, 3], // 1 = Easy, 2 = Medium, 3 = Hard
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  switches: {
    type: Number,
    default: 0,
  },
  expectedDuration: {
    type: Number, // in minutes
    default: 30,
  },
  actualDuration: {
    type: Number, // in minutes
  },
  completed: {
    type: Boolean,
    default: false,
  },
  // Cognitive load state at the time this activity was logged
  cognitiveLoadState: {
    type: String,
    enum: ['NORMAL', 'MODERATE', 'OVERLOADED'],
  },
  // User's response to suggestion (if any)
  suggestionShown: {
    type: String,
    enum: ['NORMAL', 'MODERATE', 'OVERLOADED'],
  },
  suggestionActionTaken: {
    type: String,
    enum: ['NONE', 'BREAK_TAKEN', 'TASK_SWITCHED', 'IGNORED'],
    default: 'NONE',
  },
}, {
  timestamps: true,
});

// Index for efficient querying by user and time
userActivitySchema.index({ userId: 1, createdAt: -1 });
// Compound index for recent activity queries
userActivitySchema.index({ userId: 1, completed: 1, createdAt: -1 });
// Index for analyzing suggestion patterns
userActivitySchema.index({ userId: 1, suggestionActionTaken: 1, createdAt: -1 });

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

export default UserActivity;
