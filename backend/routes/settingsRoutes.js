import express from 'express';
import {
  getAllSettings,
  updateSettings,
  resetSettings,
  getSettingsSummary,
} from '../controllers/settingsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/settings - Get all user settings (full nested object)
router.get('/', getAllSettings);

// GET /api/settings/summary - Get flattened settings for UI
router.get('/summary', getSettingsSummary);

// PUT /api/settings - Update settings (supports partial updates)
router.put('/', updateSettings);

// DELETE /api/settings/reset - Reset to defaults
router.delete('/reset', resetSettings);

export default router;
