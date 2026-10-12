import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { createDraft, editDraft, deleteDraft, submitVoucher, getVouchers, getVoucherDetails, approveVoucher, rejectVoucher, verifyVoucher } from '../controllers/vouchers';

const router = Router();

router.use(requireAuth);

router.get('/', getVouchers);
router.get('/:id', getVoucherDetails);

router.post('/', requireRole(['EMPLOYEE']), createDraft);
router.put('/:id', requireRole(['EMPLOYEE']), editDraft);
router.delete('/:id', requireRole(['EMPLOYEE']), deleteDraft);
import { uploadSignature } from '../config/upload';
router.post('/:id/submit', requireRole(['EMPLOYEE']), uploadSignature.single('signature'), submitVoucher);

router.post('/:id/approve', requireRole(['DIRECTOR']), uploadSignature.single('signature'), approveVoucher);
router.post('/:id/reject', requireRole(['DIRECTOR']), rejectVoucher);
router.post('/:id/verify', requireRole(['ACCOUNTS']), verifyVoucher);

import { payVoucher, verifyPayment } from '../controllers/vouchers';
router.post('/:id/pay', requireRole(['ACCOUNTS']), payVoucher);
router.post('/:id/verify-payment', requireRole(['ACCOUNTS']), verifyPayment);

export default router;
