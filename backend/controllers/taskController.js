import Task from '../models/Task.js';

// Helper function for streak calculation (simplified)
const calculateStreak = async (userId) => {
  const tasks = await Task.find({ createdBy: userId, status: 'Completed' })
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
    const tasks = await Task.find({ createdBy: req.user._id }).sort({ dueDate: 1 });
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

// Get single task
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
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
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
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

// Delete task
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    res.status(200).json({
      success: true,
      data: {},
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

    const totalTasks = await Task.countDocuments({ createdBy: userId });
    const completedTasks = await Task.countDocuments({ createdBy: userId, status: 'Completed' });
    const pendingTasks = await Task.countDocuments({ createdBy: userId, status: 'Pending' });
    const overdueTasks = await Task.countDocuments({
      createdBy: userId,
      status: 'Pending',
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