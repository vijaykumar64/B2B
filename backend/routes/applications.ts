import { Router } from 'express';
import { getApplications, createApplication, updateApplication, checkApplication } from '../controllers/applicationController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/check', protect, checkApplication);
router.get('/', protect, getApplications);
router.post('/', protect, createApplication);
router.patch('/:id', protect, updateApplication);

export default router;
