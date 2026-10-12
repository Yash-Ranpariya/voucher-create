import { Router } from 'express';
import { uploadSignatureHandler, getUsers, updateProfile } from '../controllers/users';
import { requireAuth } from '../middleware/auth';
import { uploadSignature } from '../config/upload';

const router = Router();

router.use(requireAuth);

router.get('/', getUsers);
router.put('/me', updateProfile);

router.post(
  '/me/signature',
  uploadSignature.single('signature'),
  uploadSignatureHandler
);

export default router;
