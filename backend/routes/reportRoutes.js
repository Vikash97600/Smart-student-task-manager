import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { generateReport, generateShareableReport } from '../controllers/reportController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Generate and download PDF report
router.get('/', generateReport);

// Generate shareable HTML report
router.get('/share', generateShareableReport);

export default router;