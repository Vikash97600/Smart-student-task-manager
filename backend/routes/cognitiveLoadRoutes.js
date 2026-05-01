import express from 'express';
import { 
  logActivity, 
  completeActivity,
  getCognitiveLoad, 
  getActivityHistory,
  recordTaskSwitch,
  updateSuggestionResponse,
  getUserSettings,
  updateUserSettings
} from '../controllers/cognitiveLoadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Log new activity when starting a task
router.post('/log', logActivity);

// Complete activity when finishing a task
router.post('/complete', completeActivity);

// Record task switch
router.post('/switch', recordTaskSwitch);

// Get current cognitive load
router.get('/load', getCognitiveLoad);

// Get activity history
router.get('/history', getActivityHistory);

// Record user's response to a suggestion
router.post('/response', updateSuggestionResponse);

// Get user settings
router.get('/settings', getUserSettings);

// Update user settings
router.put('/settings', updateUserSettings);

export default router;
