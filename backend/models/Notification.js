import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ['deadline', 'inactivity', 'follow_up', 'missed_task', 'daily_summary', 'general'],
      default: 'general',
    },
    read: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Object,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ 'metadata.taskId': 1, type: 1, userId: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
