import { rewriteBulletPoint } from '../services/ai/rewriteResume.js';

/**
 * Rewrite a single resume bullet point
 * POST /api/ai/rewrite
 */
export const rewriteBullet = async (req, res, next) => {
  const { bulletPoint } = req.body;

  try {
    if (!bulletPoint || bulletPoint.trim().length === 0) {
      res.status(400);
      throw new Error('Please provide a bullet point to rewrite.');
    }

    const rewritten = await rewriteBulletPoint(bulletPoint);
    res.json({ original: bulletPoint, rewritten });
  } catch (error) {
    next(error);
  }
};
