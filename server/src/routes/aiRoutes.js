import express from 'express';
import { rewriteBullet } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/rewrite', protect, rewriteBullet);

export default router;
