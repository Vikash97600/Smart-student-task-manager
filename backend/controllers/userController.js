import User from '../models/User.js';
import Task from '../models/Task.js';
import bcrypt from 'bcryptjs';

// Get user profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile (name, avatar)
export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400);
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get user stats for profile dropdown
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Tasks completed today
    const tasksCompletedToday = await Task.countDocuments({
      createdBy: userId,
      status: 'Completed',
      isDeleted: false,
      updatedAt: { $gte: today },
    });

    // Pending tasks
    const pendingTasks = await Task.countDocuments({
      createdBy: userId,
      status: 'Pending',
      isDeleted: false,
    });

    // Upcoming deadlines (next 2 days)
    const upcomingDeadlines = await Task.countDocuments({
      createdBy: userId,
      status: 'Pending',
      isDeleted: false,
      dueDate: { $gte: today, $lt: tomorrow },
    });

    // Weekly progress calculation
    const totalWeeklyTasks = await Task.countDocuments({
      createdBy: userId,
      isDeleted: false,
      createdAt: { $gte: weekAgo },
    });
    
    const completedWeeklyTasks = await Task.countDocuments({
      createdBy: userId,
      status: 'Completed',
      isDeleted: false,
      createdAt: { $gte: weekAgo },
    });

    const weeklyProgress = totalWeeklyTasks > 0 
      ? Math.round((completedWeeklyTasks / totalWeeklyTasks) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        tasksCompletedToday,
        pendingTasks,
        upcomingDeadlines,
        weeklyProgress,
      },
    });
  } catch (error) {
    next(error);
  }
};