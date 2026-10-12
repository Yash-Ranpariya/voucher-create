import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getDashboardSummary } from '../controllers/dashboard';

const router = Router();

router.use(requireAuth);
router.get('/summary', getDashboardSummary);

export default router;
