import express from 'express';
import { 
  analyzeJobAndResume, 
  getUserReports, 
  getReportById, 
  getJobMatchHistory,
  screenResume,
  getScreeningReports,
  getScreeningReportById
} from '../controllers/atsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/analyze', protect, analyzeJobAndResume);
router.get('/reports', protect, getUserReports);
router.get('/reports/:id', protect, getReportById);
router.get('/history/:jobId', protect, getJobMatchHistory);

// Independent Resume Screening routes
router.post('/screen', protect, screenResume);
router.get('/screenings', protect, getScreeningReports);
router.get('/screenings/:id', protect, getScreeningReportById);

export default router;
