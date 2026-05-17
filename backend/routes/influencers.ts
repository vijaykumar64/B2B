import { Router } from 'express';
import { getInfluencers } from '../controllers/influencerController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.get('/', protect, restrictTo('admin'), getInfluencers);

export default router;
