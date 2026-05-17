import { Router, Request, Response } from 'express';
import { getOpportunities, createOpportunity, updateOpportunity, deleteOpportunity } from '../controllers/opportunityController';
import { protect, optionalAuth, restrictTo } from '../middleware/auth';
import { clearAndReseed } from '../utils/seedData';

const router = Router();

router.get('/', optionalAuth, getOpportunities);
router.post('/', protect, restrictTo('brand_owner', 'admin'), createOpportunity);
router.patch('/:id', protect, updateOpportunity);
router.delete('/:id', protect, restrictTo('admin'), deleteOpportunity);

// Admin-only: wipe all opportunities and reseed with fresh production data
router.post('/admin/reseed', protect, restrictTo('admin'), async (_req: Request, res: Response) => {
  try {
    await clearAndReseed();
    res.json({ message: 'Database reseeded successfully with production data.' });
  } catch (error) {
    res.status(500).json({ error: 'Reseed failed' });
  }
});

export default router;
