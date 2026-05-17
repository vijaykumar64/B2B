import { Router } from 'express';
import { createCallback, updateCallback, getCallbacks } from '../controllers/callbackController';
import { protect, optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/', optionalAuth, createCallback);
router.get('/', protect, getCallbacks);
router.patch('/:id', protect, updateCallback);

export default router;
