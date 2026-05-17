import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register, login, emailLogin, googleAuth,
  logout, getMe, refreshTokenHandler,
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  registerSchema, loginSchema, emailLoginSchema,
  googleAuthSchema, refreshTokenSchema,
} from '../validators/auth.validators';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 500,
  message: { error: 'Too many attempts from this IP. Please try again after 15 minutes.', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== 'production',
});

const googleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many Google login attempts. Please try again after 15 minutes.', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/email-login', authLimiter, validate(emailLoginSchema), emailLogin);
router.post('/google', googleLimiter, validate(googleAuthSchema), googleAuth);
router.post('/refresh', validate(refreshTokenSchema), refreshTokenHandler);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
