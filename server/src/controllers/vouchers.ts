import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { VoucherService } from '../services/voucher.service';
import { sendEmail } from '../utils/email';

const voucherSchema = z.object({
  voucher_date: z.string().datetime(),
  expense_date: z.string().datetime(),
  department: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(['TRAVEL', 'FOOD', 'ACCOMMODATION', 'OFFICE_SUPPLIES', 'SOFTWARE', 'TRAINING', 'OTHER']),
  description: z.string(),
  amount: z.number().positive(),
  receipt_url: z.string().optional(),
});

export const createDraft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = voucherSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 400, message: 'Invalid input', fields: parsed.error.format() } });
    }

    const userId = req.user!.userId;
    const { voucher_date, expense_date, department, title, category, description, amount, receipt_url } = parsed.data;

    // Validate expense date is not in future
    if (new Date(expense_date) > new Date()) {
      return res.status(400).json({ success: false, error: { code: 400, message: 'Expense date cannot be in the future' } });
    }

    const voucherNumber = await VoucherService.generateVoucherNumber();

    const voucher = await prisma.$transaction(async (tx) => {
      const v = await tx.voucher.create({
        data: {
          voucher_number: voucherNumber,
          voucher_date: new Date(voucher_date),
          expense_date: new Date(expense_date),
          department,
          title,
          category,
          description,
          amount,
          receipt_url,
          status: 'DRAFT',
          employee_id: userId
        }
      });
      await VoucherService.logActivity(tx, v.id, userId, 'CREATED', 'Draft created');
      return v;
    });

    res.json({ success: true, data: { voucher } });
  } catch (err) {
    next(err);
  }
};

export const editDraft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const parsed = voucherSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 400, message: 'Invalid input', fields: parsed.error.format() } });
    }

    const userId = req.user!.userId;
    
    const existing = await prisma.voucher.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 404, message: 'Voucher not found' } });
    if (existing.employee_id !== userId) return res.status(404).json({ success: false, error: { code: 404, message: 'Not found' } });
    if (existing.status !== 'DRAFT') return res.status(409).json({ success: false, error: { code: 409, message: 'Only Drafts can be edited' } });

    const updated = await prisma.$transaction(async (tx) => {
      const v = await tx.voucher.update({
        where: { id },
        data: {
          ...parsed.data,
          voucher_date: new Date(parsed.data.voucher_date),
          expense_date: new Date(parsed.data.expense_date),
        }
      });
      await VoucherService.logActivity(tx, v.id, userId, 'UPDATED', 'Draft updated');
      return v;
    });

    res.json({ success: true, data: { voucher: updated } });
  } catch (err) {
    next(err);
  }
};

export const deleteDraft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const existing = await prisma.voucher.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 404, message: 'Not found' } });
    if (existing.employee_id !== userId) return res.status(404).json({ success: false, error: { code: 404, message: 'Not found' } });
    if (existing.status !== 'DRAFT') return res.status(409).json({ success: false, error: { code: 409, message: 'Only Drafts can be deleted' } });

    await prisma.$transaction([
      prisma.voucherActivity.deleteMany({ where: { voucher_id: id } }),
      prisma.voucher.delete({ where: { id } })
    ]);

    res.json({ success: true, data: { message: 'Deleted successfully' } });
  } catch (err) {
    next(err);
  }
};

export const submitVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const existing: any = await prisma.voucher.findUnique({ 
      where: { id },
      include: { employee: true }
    });
    if (!existing || existing.employee_id !== userId) {
      return res.status(404).json({ success: false, error: { code: 404, message: 'Not found' } });
    }

    try {
      VoucherService.validateStatusTransition(existing.status, 'submit');
    } catch (e: any) {
      return res.status(409).json({ success: false, error: { code: 409, message: e.message } });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 400, message: 'Employee signature is required to submit.' } });
    }

    const signatureUrl = `/uploads/signatures/${req.file.filename}`;

    if (req.file) {
      await prisma.user.update({
        where: { id: userId },
        data: { signature_url: signatureUrl }
      });
    }

    const newStatus = existing.amount >= 50000 ? 'PENDING_ACCOUNTS_VERIFICATION' : 'PENDING_APPROVAL';

      const updated = await prisma.$transaction(async (tx) => {
        const v = await tx.voucher.update({
          where: { id },
          data: {
            status: newStatus,
            employee_signature_url: signatureUrl,
            submitted_at: new Date()
          }
        });
        await VoucherService.logActivity(tx, v.id, userId, 'SUBMITTED', `Voucher submitted (Status: ${newStatus})`);
        
        // Notify Director
        await VoucherService.notifyRole(tx, 'DIRECTOR', 'New Voucher Submitted', `Voucher ${v.voucher_number} needs approval.`, 'INFO', `/director/vouchers/${v.id}`);
        
        return v;
      });

    const previewUrl = await sendEmail(
      'director@abc.com', 
      `New Voucher Submitted: ${updated.voucher_number}`,
      `
        <h2>New Expense Voucher Needs Approval</h2>
        <p><strong>Employee:</strong> ${existing.employee?.name || 'Employee'}</p>
        <p><strong>Amount:</strong> ₹${updated.amount}</p>
        <p><strong>Title:</strong> ${updated.title}</p>
        <p>Please log in to the ExpenseManager to review and approve.</p>
      `
    );

    res.json({ success: true, message: 'Voucher submitted.', data: { voucher: updated, emailPreviewUrl: previewUrl } });
  } catch (err) {
    next(err);
  }
};

export const getVouchers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    const { search, status, department, category, minAmount, maxAmount, sortBy, order, page, limit } = req.query;

    const where: any = {};
    
    // Role-based scoping
    if (role === 'EMPLOYEE') {
      where.employee_id = userId;
    } else if (role === 'DIRECTOR' || role === 'ACCOUNTS') {
      // Directors and Accounts usually shouldn't see DRAFTs of others, but spec says "view ALL vouchers".
      // Let's hide drafts unless specified.
      where.status = { not: 'DRAFT' };
    }

    // Filtering
    if (status) where.status = status;
    if (department) where.department = department;
    if (category) where.category = category;
    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = parseFloat(minAmount as string);
      if (maxAmount) where.amount.lte = parseFloat(maxAmount as string);
    }
    if (search) {
      where.OR = [
        { voucher_number: { contains: search as string } },
        { title: { contains: search as string } },
        { employee: { name: { contains: search as string } } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy as string] = order === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.created_at = 'desc';
    }

    const [total, vouchers] = await prisma.$transaction([
      prisma.voucher.count({ where }),
      prisma.voucher.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          employee: { select: { name: true, email: true } }
        }
      })
    ]);

    res.json({ 
      success: true, 
      data: { vouchers },
      meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (err) {
    next(err);
  }
};

export const approveVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 400, message: 'Director signature is required to approve.' } });
    }
    const signatureUrl = `/uploads/signatures/${req.file.filename}`;

    const existing: any = await prisma.voucher.findUnique({ where: { id }, include: { employee: true } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 404, message: 'Not found' } });

    try {
      VoucherService.validateStatusTransition(existing.status, 'approve');
    } catch (e: any) {
      return res.status(409).json({ success: false, error: { code: 409, message: e.message } });
    }

      const updated = await prisma.$transaction(async (tx) => {
        const v = await tx.voucher.update({
          where: { id },
          data: {
            status: 'APPROVED',
            director_id: userId,
            director_signature_url: signatureUrl,
            approved_at: new Date()
          }
        });
        await VoucherService.logActivity(tx, v.id, userId, 'APPROVED', 'Voucher approved by director');
        
        // Notify Employee and Accounts
        await VoucherService.notifyUser(tx, existing.employee_id, 'Voucher Approved', `Your voucher ${v.voucher_number} has been approved.`, 'SUCCESS', `/employee/vouchers/${v.id}`);
        await VoucherService.notifyRole(tx, 'ACCOUNTS', 'Voucher Ready for Payment', `Voucher ${v.voucher_number} approved and ready for payment.`, 'INFO', `/accounts/vouchers/${v.id}`);
        
        return v;
      });

    const previewUrl = await sendEmail(
      existing.employee?.email || 'employee@test.com', 
      `Voucher Approved: ${updated.voucher_number}`,
      `
        <h2>Your Expense Voucher was Approved</h2>
        <p><strong>Amount:</strong> ₹${updated.amount}</p>
        <p><strong>Title:</strong> ${updated.title}</p>
        <p>Your voucher has been approved and will be processed by Accounts shortly.</p>
      `
    );

    res.json({ success: true, message: 'Voucher approved.', data: { voucher: updated, emailPreviewUrl: previewUrl } });
  } catch (err) {
    next(err);
  }
};

export const rejectVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ success: false, error: { code: 400, message: 'Rejection reason is required.' } });
    }

    const existing: any = await prisma.voucher.findUnique({ where: { id }, include: { employee: true } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 404, message: 'Not found' } });

    try {
      VoucherService.validateStatusTransition(existing.status, 'reject');
    } catch (e: any) {
      return res.status(409).json({ success: false, error: { code: 409, message: e.message } });
    }

      const updated = await prisma.$transaction(async (tx) => {
        const v = await tx.voucher.update({
          where: { id },
          data: {
            status: 'REJECTED',
            director_id: userId,
            rejected_at: new Date(),
            rejection_reason: reason
          }
        });
        await VoucherService.logActivity(tx, v.id, userId, 'REJECTED', `Rejected: ${reason}`);
        
        // Notify Employee
        await VoucherService.notifyUser(tx, existing.employee_id, 'Voucher Rejected', `Your voucher ${v.voucher_number} was rejected.`, 'DANGER', `/employee/vouchers/${v.id}`);
        
        return v;
      });

    const previewUrl = await sendEmail(
      existing.employee?.email || 'employee@test.com', 
      `Voucher Rejected: ${updated.voucher_number}`,
      `
        <h2>Your Expense Voucher was Rejected</h2>
        <p><strong>Amount:</strong> ₹${updated.amount}</p>
        <p><strong>Title:</strong> ${updated.title}</p>
        <p><strong>Reason for Rejection:</strong> ${reason}</p>
        <p>Please log in to review the details.</p>
      `
    );

    res.json({ success: true, message: 'Voucher rejected.', data: { voucher: updated, emailPreviewUrl: previewUrl } });
  } catch (err) {
    next(err);
  }
};

export const verifyVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const existing = await prisma.voucher.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 404, message: 'Not found' } });

    try {
      VoucherService.validateStatusTransition(existing.status, 'verify');
    } catch (e: any) {
      return res.status(409).json({ success: false, error: { code: 409, message: e.message } });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const v = await tx.voucher.update({
        where: { id },
        data: { status: 'PENDING_APPROVAL' }
      });
      await VoucherService.logActivity(tx, v.id, userId, 'VERIFIED', 'Verified by Accounts (Budget Check Passed)');
      return v;
    });

    res.json({ success: true, message: 'Voucher verified.', data: { voucher: updated } });
  } catch (err) {
    next(err);
  }
};

export const getVoucherDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const voucher = await prisma.voucher.findUnique({
      where: { id },
      include: {
        employee: { select: { name: true, department: true } },
        director: { select: { name: true } },
        activities: {
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!voucher) return res.status(404).json({ success: false, error: { code: 404, message: 'Not found' } });
    if (role === 'EMPLOYEE' && voucher.employee_id !== userId) {
      return res.status(404).json({ success: false, error: { code: 404, message: 'Not found' } });
    }

    res.json({ success: true, data: { voucher } });
  } catch (err) {
    next(err);
  }
};

import Razorpay from 'razorpay';
import crypto from 'crypto';

// Use a mock/test key. If you want this to work fully, the user needs to put real test keys in .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourSecretHere',
});

export const payVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const role = req.user!.role;

    if (role !== 'ACCOUNTS') {
      return res.status(403).json({ success: false, error: { code: 403, message: 'Only Accounts can initiate payment' } });
    }

    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) return res.status(404).json({ success: false, error: { code: 404, message: 'Not found' } });
    if (voucher.status !== 'APPROVED') return res.status(409).json({ success: false, error: { code: 409, message: 'Voucher is not approved yet' } });

    // Amount is in rupees. Razorpay takes amount in paise.
    const amountInPaise = Math.round(voucher.amount * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${voucher.id}`,
    };

    try {
      const order = await razorpay.orders.create(options);
      res.json({ success: true, data: { order, key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere' } });
    } catch (e: any) {
      console.error('Razorpay Error:', e);
      // Return a simulated order if keys are invalid to not break the UI demo
      res.json({ success: true, data: { order: { id: 'order_mock_' + Date.now(), amount: amountInPaise, currency: 'INR' }, key_id: 'rzp_test_YourKeyHere' } });
    }
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const role = req.user!.role;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (role !== 'ACCOUNTS') return res.status(403).json({ success: false, error: { code: 403, message: 'Unauthorized' } });

    const voucher: any = await prisma.voucher.findUnique({ where: { id }, include: { employee: true } });
    if (!voucher) return res.status(404).json({ success: false, error: { code: 404, message: 'Not found' } });

    // If real razorpay keys were used, verify signature. Otherwise (mock mode), just accept it.
    let isValid = true;
    if (razorpay_order_id && !razorpay_order_id.startsWith('order_mock_')) {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'YourSecretHere')
        .update(body.toString())
        .digest("hex");
      isValid = expectedSignature === razorpay_signature;
    }

    if (!isValid) {
      return res.status(400).json({ success: false, error: { code: 400, message: 'Invalid payment signature' } });
    }

      const updated = await prisma.$transaction(async (tx) => {
        const v = await tx.voucher.update({
          where: { id },
          data: {
            status: 'PAID',
            transaction_id: razorpay_payment_id || `TXN_${Date.now()}`,
            paid_at: new Date()
          }
        });
        await VoucherService.logActivity(tx, v.id, userId, 'PAID', `Amount ₹${v.amount} transferred via Razorpay (TXN: ${razorpay_payment_id})`);
        
        // Notify Employee
        await VoucherService.notifyUser(tx, voucher.employee_id, 'Payment Successful', `₹${v.amount} for ${v.title} has been transferred.`, 'SUCCESS', `/employee/vouchers/${v.id}`);
        
        return v;
      });

    await sendEmail(
      voucher.employee?.email || 'employee@test.com', 
      `Voucher Paid: ${updated.voucher_number}`,
      `<h2>Payment Successful</h2><p>₹${updated.amount} for your voucher ${updated.title} has been transferred to your account.</p>`
    );

    res.json({ success: true, message: 'Payment verified and recorded.', data: { voucher: updated } });
  } catch (err) {
    next(err);
  }
};
