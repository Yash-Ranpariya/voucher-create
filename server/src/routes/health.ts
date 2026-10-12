import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Server is healthy',
      timestamp: new Date().toISOString()
    }
  });
});

export default router;
