import { Router } from 'express';
import { getNotifications, createNotification, markRead, markAllRead } from '../controllers/notificationController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getNotifications);
router.post('/', protect, createNotification);
router.post('/mark-all-read', protect, markAllRead);
router.patch('/:id', protect, markRead);

export default router;
