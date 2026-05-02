import Task from '../models/Task.js';
import Notification from '../models/Notification.js';

// Helper function for streak calculation (simplified)
const calculateStreak = async (userId) => {
  const tasks = await Task.find({ createdBy: userId, status: 'Completed', isDeleted: false })
    .sort({ updatedAt: -1 })
    .limit(10);
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let task of tasks) {
    const taskDate = new Date(task.updatedAt);
    taskDate.setHours(0, 0, 0, 0);
    const diffTime = today - taskDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      streak++;
    }
  }

  return streak;
};

// Get all tasks for logged in user
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id, isDeleted: false }).sort({ dueDate: 1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get deleted tasks for logged in user
export const getDeletedTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id, isDeleted: true }).sort({ deletedAt: -1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// Get single task
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      isDeleted: false,
    });

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// Create task
export const createTask = async (req, res, next) => {
  const { title, description, subject, dueDate, priority, status } = req.body;

  try {
    const task = await Task.create({
      title,
      description,
      subject,
      dueDate,
      priority,
      status,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// Update task
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id, isDeleted: false });
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const previousStatus = task.status;
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedTask && previousStatus !== updatedTask.status) {
      const message =
        updatedTask.status === 'Completed'
          ? `Great job! Task "${updatedTask.title}" has been marked completed.`
          : `Task "${updatedTask.title}" status changed to ${updatedTask.status}.`;

      await Notification.create({
        userId: req.user._id,
        message,
        type: 'follow_up',
        metadata: { taskId: updatedTask._id.toString(), previousStatus, newStatus: updatedTask.status },
      });
    }

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// Delete task (soft delete)
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// Restore a deleted task
export const restoreTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id, isDeleted: true });
    if (!task) {
      res.status(404);
      throw new Error('Deleted task not found');
    }

    task.isDeleted = false;
    task.deletedAt = null;
    await task.save();

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// Permanently delete a single task
export const permanentDeleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      createdBy: req.user._id, 
      isDeleted: true 
    });

    if (!task) {
      res.status(404);
      throw new Error('Deleted task not found');
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// Permanently delete multiple tasks
export const permanentDeleteMultipleTasks = async (req, res, next) => {
  try {
    const { taskIds } = req.body;
    
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      res.status(400);
      throw new Error('No task IDs provided');
    }

    const result = await Task.deleteMany({
      _id: { $in: taskIds },
      createdBy: req.user._id,
      isDeleted: true
    });

    res.status(200).json({
      success: true,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const totalTasks = await Task.countDocuments({ createdBy: userId, isDeleted: false });
    const completedTasks = await Task.countDocuments({ createdBy: userId, status: 'Completed', isDeleted: false });
    const pendingTasks = await Task.countDocuments({ createdBy: userId, status: 'Pending', isDeleted: false });
    const overdueTasks = await Task.countDocuments({
      createdBy: userId,
      status: 'Pending',
      isDeleted: false,
      dueDate: { $lt: today },
    });

    const productivityPercentage = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    // Weekly completed tasks for Chart.js
    const weeklyStats = await Task.aggregate([
      {
        $match: {
          createdBy: userId,
          status: 'Completed',
          updatedAt: { $gte: weekAgo },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$updatedAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days with 0
    const weeklyData = [0, 0, 0, 0, 0, 0, 0];
    weeklyStats.forEach((item) => {
      weeklyData[item._id - 1] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        productivityPercentage,
        weeklyData,
        streak: await calculateStreak(userId),
      },
    });
  } catch (error) {
    next(error);
  }
};