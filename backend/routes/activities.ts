import { Router } from 'express';
import { trackActivity, getActivities } from '../controllers/activityController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.post('/', protect, trackActivity);
router.get('/', protect, restrictTo('admin'), getActivities);

export default router;
