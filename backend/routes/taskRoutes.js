import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getDeletedTasks,
  restoreTask,
  getDashboardStats,
} from '../controllers/taskController.js';

const router = express.Router();

// All routes below require authentication
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.get('/deleted', getDeletedTasks);
router.route('/:id/restore').put(restoreTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

router.get('/dashboard/stats', getDashboardStats);

export default router;