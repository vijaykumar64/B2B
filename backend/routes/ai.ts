import { Router } from 'express';
import { chat, aiRateLimiter } from '../controllers/aiController';
import { optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { aiChatSchema } from '../validators/ai.validators';

const router = Router();

// optionalAuth: logged-in users can receive personalised context in the future
router.post('/chat', aiRateLimiter, optionalAuth, validate(aiChatSchema), chat);

export default router;
