import { Router } from 'express';
import { submitFeedback, getAllFeedback } from '../controllers/feedbackController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.post('/', protect, submitFeedback);
router.get('/', protect, restrictTo('admin'), getAllFeedback);

export default router;
