import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notifications';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(getNotifications));
router.post('/read', asyncHandler(markAsRead));

export default router;
