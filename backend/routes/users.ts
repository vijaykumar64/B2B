import { Router } from 'express';
import { getUser, updateUser, getAllUsers } from '../controllers/userController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.get('/', protect, restrictTo('admin'), getAllUsers);
router.get('/:id', protect, getUser);
router.patch('/:id', protect, updateUser);

export default router;
