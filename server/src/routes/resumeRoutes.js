import express from 'express';
import { uploadResume, getUserResumes, getResumeById } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/', protect, getUserResumes);
router.get('/:id', protect, getResumeById);

export default router;
