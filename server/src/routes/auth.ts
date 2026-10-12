import { Router } from 'express';
import { login, logout, me } from '../controllers/auth';
import { requireAuth } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 1000,
  message: { success: false, error: { code: 429, message: 'Too many login attempts, please try again later' } },
  skip: () => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development'
});

router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
