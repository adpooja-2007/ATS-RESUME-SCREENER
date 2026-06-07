import express from 'express';
import { downloadPDF, downloadDOCX } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:id/pdf', protect, downloadPDF);
router.get('/:id/docx', protect, downloadDOCX);

export default router;
