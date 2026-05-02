import express from 'express';
import {
  getNotifications,
  createNotification,
  markNotificationRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getNotifications);
router.post('/', createNotification);
router.put('/:id/read', markNotificationRead);

export default router;
