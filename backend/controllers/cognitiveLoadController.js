import UserActivity from '../models/UserActivity.js';
import UserSettings from '../models/UserSettings.js';

/**
 * Get user's effective sensitivity multiplier
 * Combines manual setting with auto-adjustment based on recent response patterns
 */
const getEffectiveSensitivity = async (userId) => {
  const settings = await UserSettings.findOne({ userId });
  let baseMultiplier = settings ? settings.cognitiveLoadSensitivity : 1.0;
  
  if (settings && settings.autoAdjustEnabled) {
    const responsiveness = await calculateUserResponsiveness(userId);
    // Map responsiveness [0,1] to multiplier range [0.7, 1.3]
    // More responsive → less sensitive (trust user can handle load)
    // Less responsive → more sensitive (need to intervene earlier)
    const autoMultiplier = 0.7 + (responsiveness * 0.6);
    baseMultiplier *= autoMultiplier;
  }
  
  return Math.max(0.5, Math.min(1.5, baseMultiplier));
};

/**
 * Calculate user responsiveness based on recent suggestion responses.
 */
const calculateUserResponsiveness = async (userId) => {
  const recentActivities = await UserActivity.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20);

  if (recentActivities.length === 0) {
    return 1.0;
  }

  const responsiveActions = ['BREAK_TAKEN', 'TASK_SWITCHED'];
  const responsiveCount = recentActivities.filter(activity =>
    activity.suggestionActionTaken && responsiveActions.includes(activity.suggestionActionTaken)
  ).length;

  return Math.max(0, Math.min(1, responsiveCount / recentActivities.length));
};

/**
 * Get user's current sensitivity setting
 */
const getUserSensitivity = async (userId) => {
  const settings = await UserSettings.findOne({ userId });
  if (settings && settings.autoAdjustEnabled) {
    // Apply auto-adjustment based on responsiveness
    const responsiveness = await calculateUserResponsiveness(userId);
    // Sensitivity multiplier: if responsive (< 1.0 means more sensitive), if unresponsive (> 1.0 means less sensitive)
    // Map responsiveness [0,1] to multiplier [0.7, 1.3]
    const autoMultiplier = 0.7 + (responsiveness * 0.6);
    return settings.cognitiveLoadSensitivity * autoMultiplier;
  }
  return settings ? settings.cognitiveLoadSensitivity : 1.0;
};

/**
 * Calculate cognitive load score based on activity signals
 * 
 * Signals:
 * 1. Hard Task Streak - consecutive hard tasks
 * 2. Task Switches - number of switches in last 30 min
 * 3. Delay Factor - ratio of actual vs expected duration
 *
 * Scoring: cognitiveLoadScore = (hardTaskStreak * 2) + (taskSwitches * 1.5) + (delayFactor * 2)
 * 
 * Thresholds are adjusted by user sensitivity:
 *   NORMAL: score < 5 * sensitivity
 *   MODERATE: 5*sensitivity <= score < 8*sensitivity
 *   OVERLOADED: score >= 8*sensitivity
 */
export const calculateCognitiveLoad = async (userId) => {
  const now = new Date();
  const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Get recent activities (last hour, completed or ongoing)
  const recentActivities = await UserActivity.find({
    userId,
    createdAt: { $gte: oneHourAgo },
  }).sort({ createdAt: -1 });

  // Separate completed and incomplete activities
  const completedActivities = recentActivities.filter(a => a.completed);
  const ongoingActivities = recentActivities.filter(a => !a.completed);

  // 1. Hard Task Streak: count consecutive hard tasks starting from most recent
  let hardTaskStreak = 0;
  for (const activity of recentActivities) {
    if (activity.difficulty === 3) {
      hardTaskStreak++;
    } else {
      break;
    }
  }

  // 2. Task Switches in last 30 minutes
  // Sum switches from all activities that started in last 30 min
  const taskSwitches = recentActivities
    .filter(a => a.createdAt >= thirtyMinAgo)
    .reduce((sum, a) => sum + (a.switches || 0), 0);

  // 3. Delay Factor: average of (actualDuration / expectedDuration) for completed tasks
  let delayFactor = 0;
  const completedWithDuration = completedActivities.filter(a => 
    a.actualDuration && a.expectedDuration && a.actualDuration > 0
  );

  if (completedWithDuration.length > 0) {
    const totalRatio = completedWithDuration.reduce((sum, a) => {
      return sum + (a.actualDuration / a.expectedDuration);
    }, 0);
    delayFactor = totalRatio / completedWithDuration.length;
  } else if (ongoingActivities.length > 0) {
    // If no completed tasks, use ongoing task's expected progress
    // If user has been working on current task longer than expected, indicate delay
    const ongoing = ongoingActivities[0]; // Most recent
    const elapsed = (now - ongoing.startTime) / (1000 * 60); // minutes
    if (elapsed > ongoing.expectedDuration * 0.5) {
      delayFactor = Math.min(elapsed / ongoing.expectedDuration, 2.0);
    } else {
      delayFactor = 1.0;
    }
  } else {
    delayFactor = 1.0;
  }

  // Get sensitivity multiplier
  const sensitivity = await getUserSensitivity(userId);

  // Calculate cognitive load score
  const cognitiveLoadScore = 
    (hardTaskStreak * 2) + 
    (taskSwitches * 1.5) + 
    (delayFactor * 2);

  // Apply sensitivity to thresholds
  const normalThreshold = 5 * sensitivity;
  const overloadedThreshold = 8 * sensitivity;

  // Determine state and suggestions
  let state, suggestion, reasons;
  
  if (cognitiveLoadScore < normalThreshold) {
    state = 'NORMAL';
    suggestion = 'Great pace! Keep working at your current rhythm.';
    reasons = ['Task load is manageable'];
  } else if (cognitiveLoadScore < overloadedThreshold) {
    state = 'MODERATE';
    suggestion = "You're doing well. Consider avoiding new hard tasks for now.";
    reasons = [];
    
    if (hardTaskStreak >= 2) {
      reasons.push(`${hardTaskStreak} hard tasks in succession`);
    }
    if (taskSwitches >= 3) {
      reasons.push(`${taskSwitches} task switches in 30 minutes`);
    }
    if (delayFactor > 1.2) {
      reasons.push(`Taking longer than expected on tasks`);
    }
  } else {
    state = 'OVERLOADED';
    suggestion = 'Take a 5-10 minute break or switch to an easy task.';
    reasons = [];
    
    if (hardTaskStreak >= 3) {
      reasons.push(`${hardTaskStreak} hard tasks in a row`);
    }
    if (taskSwitches >= 4) {
      reasons.push(`${taskSwitches} task switches in 20 minutes`);
    }
    if (delayFactor > 1.5) {
      reasons.push(`Tasks taking significantly longer than expected`);
    }
  }

  // Add user responsiveness note if applicable
  const responsiveness = await calculateUserResponsiveness(userId);
  if (state === 'OVERLOADED' && responsiveness < 0.3) {
    reasons.push('You frequently ignore break suggestions');
  }

  return {
    score: Math.round(cognitiveLoadScore * 10) / 10,
    state,
    suggestion,
    reasons,
    signals: {
      hardTaskStreak,
      taskSwitches,
      delayFactor: Math.round(delayFactor * 10) / 10,
    },
    sensitivity: Math.round(sensitivity * 10) / 10,
    responsiveness: Math.round(responsiveness * 10) / 10,
  };
};

/**
 * Log user activity when starting a task
 * Also captures the current cognitive load state for later analysis
 */
export const logActivity = async (req, res, next) => {
  try {
    const { taskId, difficulty, switches, expectedDuration } = req.body;
    const userId = req.user._id;

    // Close any incomplete activities for this user first
    await UserActivity.updateMany(
      { userId, completed: false },
      { 
        $set: { 
          completed: true,
          endTime: new Date(),
        } 
      }
    );

    // Capture current cognitive load state (without sensitivity adjustments for logging)
    const currentLoad = await calculateCognitiveLoad(userId);

    const activity = await UserActivity.create({
      userId,
      taskId,
      difficulty: difficulty || 2, // Default to Medium
      switches: switches || 0,
      expectedDuration: expectedDuration || 30,
      cognitiveLoadState: currentLoad.state,
    });

    res.status(201).json({
      success: true,
      data: activity,
      meta: { currentLoad },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update activity when task is completed
 */
export const completeActivity = async (req, res, next) => {
  try {
    const { activityId, actualDuration, switches } = req.body;
    const userId = req.user._id;

    const activity = await UserActivity.findByIdAndUpdate(
      activityId,
      {
        completed: true,
        endTime: new Date(),
        actualDuration,
        switches: switches || 0,
      },
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user's response to a suggestion
 * This helps the system learn user behavior patterns (for future ML)
 */
export const updateSuggestionResponse = async (req, res, next) => {
  try {
    const { actionTaken } = req.body; // 'BREAK_TAKEN', 'TASK_SWITCHED', 'IGNORED'
    const userId = req.user._id;

    // Update the most recent activity's suggestion response
    const lastActivity = await UserActivity.findOne({ userId })
      .sort({ createdAt: -1 });

    if (lastActivity && !lastActivity.suggestionActionTaken) {
      lastActivity.suggestionActionTaken = actionTaken;
      lastActivity.suggestionShown = lastActivity.cognitiveLoadState || 'UNKNOWN';
      await lastActivity.save();
    }

    // Note: Auto-adjustment is done on-the-fly in getEffectiveSensitivity,
    // so we don't permanently modify the user's manual sensitivity setting
    // Future: could log this interaction for ML training

    res.status(200).json({
      success: true,
      message: 'Response recorded',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get or update user cognitive load settings
 */
export const getUserSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
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

export const updateUserSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { cognitiveLoadSensitivity, notificationPaused, autoAdjustEnabled } = req.body;

    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      {
        ...(cognitiveLoadSensitivity !== undefined && { cognitiveLoadSensitivity }),
        ...(notificationPaused !== undefined && { notificationPaused }),
        ...(autoAdjustEnabled !== undefined && { autoAdjustEnabled }),
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current cognitive load status
 */
export const getCognitiveLoad = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const loadData = await calculateCognitiveLoad(userId);

    res.status(200).json({
      success: true,
      data: loadData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get activity history for analytics
 */
export const getActivityHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { hours = 24 } = req.query;
    
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const activities = await UserActivity.find({
      userId,
      createdAt: { $gte: since },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record a task switch (user navigated away from task)
 */
export const recordTaskSwitch = async (req, res, next) => {
  try {
    const { activityId } = req.body;
    const userId = req.user._id;

    if (activityId) {
      // Increment switch count for existing activity
      await UserActivity.findByIdAndUpdate(activityId, {
        $inc: { switches: 1 },
      });
    }

    // If no activityId, create a new activity to track the switch
    if (!activityId) {
      await UserActivity.create({
        userId,
        difficulty: 2,
        switches: 1,
      });
    }

    // Get updated load data
    const loadData = await calculateCognitiveLoad(userId);

    res.status(200).json({
      success: true,
      data: loadData,
    });
  } catch (error) {
    next(error);
  }
};
