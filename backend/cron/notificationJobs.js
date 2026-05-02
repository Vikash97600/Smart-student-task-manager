import cron from 'node-cron';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const createNotification = async (userId, type, message, metadata = {}) => {
  try {
    await Notification.create({
      userId,
      type,
      message,
      metadata,
    });
  } catch (error) {
    console.error('[NotificationJobs] Failed to create notification:', error.message);
  }
};

const hasNotification = async (userId, type, metadata = {}) => {
  const query = { userId, type };

  if (metadata.taskId) {
    query['metadata.taskId'] = metadata.taskId;
  }
  if (metadata.stage) {
    query['metadata.stage'] = metadata.stage;
  }

  const existing = await Notification.findOne(query);
  return Boolean(existing);
};

const runDeadlineAlerts = async () => {
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);

    const tasks24 = await Task.find({
      status: 'Pending',
      dueDate: { $gte: now, $lte: in24Hours },
    });

    const tasks1 = await Task.find({
      status: 'Pending',
      dueDate: { $gte: now, $lte: in1Hour },
    });

    for (const task of tasks24) {
      if (!(await hasNotification(task.createdBy, 'deadline', { taskId: task._id.toString(), stage: '24h' }))) {
        await createNotification(
          task.createdBy,
          'deadline',
          `Your task "${task.title}" is due within 24 hours.`,
          { taskId: task._id.toString(), stage: '24h' }
        );
      }
    }

    for (const task of tasks1) {
      if (!(await hasNotification(task.createdBy, 'deadline', { taskId: task._id.toString(), stage: '1h' }))) {
        await createNotification(
          task.createdBy,
          'deadline',
          `Your task "${task.title}" is due within 1 hour.`,
          { taskId: task._id.toString(), stage: '1h' }
        );
      }
    }
  } catch (error) {
    console.error('[NotificationJobs] Deadline alerts failed:', error.message);
  }
};

const runMissedTaskAlerts = async () => {
  try {
    const now = new Date();
    const missedTasks = await Task.find({
      status: 'Pending',
      dueDate: { $lt: now },
    });

    for (const task of missedTasks) {
      if (!(await hasNotification(task.createdBy, 'missed_task', { taskId: task._id.toString() }))) {
        await createNotification(
          task.createdBy,
          'missed_task',
          `You missed the deadline for "${task.title}". Please take action.`,
          { taskId: task._id.toString() }
        );
      }
    }
  } catch (error) {
    console.error('[NotificationJobs] Missed task alerts failed:', error.message);
  }
};

const runInactivityReminders = async () => {
  try {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const users = await User.find({});

    for (const user of users) {
      const recentTask = await Task.findOne({
        createdBy: user._id,
        updatedAt: { $gte: twoDaysAgo },
      });

      if (!recentTask) {
        if (!(await hasNotification(user._id, 'inactivity', {}))) {
          await createNotification(
            user._id,
            'inactivity',
            'We noticed you have not updated a task in the last 48 hours. Let’s get back on track!',
            {}
          );
        }
      }
    }
  } catch (error) {
    console.error('[NotificationJobs] Inactivity reminders failed:', error.message);
  }
};

const runDailySummary = async () => {
  try {
    const users = await User.find({});

    for (const user of users) {
      const [pendingCount, overdueCount, dueTodayCount] = await Promise.all([
        Task.countDocuments({ createdBy: user._id, status: 'Pending' }),
        Task.countDocuments({ createdBy: user._id, status: 'Pending', dueDate: { $lt: new Date() } }),
        Task.countDocuments({
          createdBy: user._id,
          status: 'Pending',
          dueDate: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        }),
      ]);

      await createNotification(
        user._id,
        'daily_summary',
        `Daily summary: ${pendingCount} pending task(s), ${dueTodayCount} due today, ${overdueCount} overdue.`,
        { pendingCount, dueTodayCount, overdueCount }
      );
    }
  } catch (error) {
    console.error('[NotificationJobs] Daily summary failed:', error.message);
  }
};

export const setupNotificationJobs = () => {
  // Run immediately on startup and then on schedule
  runDeadlineAlerts();
  runMissedTaskAlerts();
  runInactivityReminders();
  runDailySummary();

  cron.schedule('0 * * * *', async () => {
    await runDeadlineAlerts();
    await runMissedTaskAlerts();
  });

  cron.schedule('0 7 * * *', runDailySummary);
  cron.schedule('0 9 * * *', runInactivityReminders);
};
