import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';

export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    let stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      totalAmount: 0
    };
    
    let chartData = [];
    let recentActivity = [];

    if (role === 'EMPLOYEE') {
      const vouchers = await prisma.voucher.findMany({ where: { employee_id: userId } });
      stats.pending = vouchers.filter(v => v.status === 'PENDING_APPROVAL').length;
      stats.approved = vouchers.filter(v => v.status === 'APPROVED').length;
      stats.rejected = vouchers.filter(v => v.status === 'REJECTED').length;
      stats.totalAmount = vouchers
        .filter(v => v.status === 'APPROVED' || v.status === 'PENDING_APPROVAL')
        .reduce((sum, v) => sum + Number(v.amount), 0);

      const grouped = await prisma.voucher.groupBy({
        by: ['category'],
        where: { employee_id: userId },
        _sum: { amount: true }
      });
      chartData = grouped.map(g => ({ name: g.category, value: Number(g._sum.amount) }));

      recentActivity = await prisma.voucherActivity.findMany({
        where: { voucher: { employee_id: userId } },
        orderBy: { created_at: 'desc' },
        take: 10,
        include: { voucher: { select: { title: true, voucher_number: true } } }
      });
    } else if (role === 'DIRECTOR') {
      const pending = await prisma.voucher.count({ where: { status: 'PENDING_APPROVAL' } });
      const approved = await prisma.voucher.count({ where: { status: 'APPROVED' } });
      
      const sumQuery = await prisma.voucher.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true }
      });

      stats.pending = pending;
      stats.approved = approved;
      stats.totalAmount = Number(sumQuery._sum.amount) || 0;

      const grouped = await prisma.voucher.groupBy({
        by: ['status'],
        _count: { id: true }
      });
      chartData = grouped.map(g => ({ name: g.status, value: Number(g._count.id) }));

      recentActivity = await prisma.voucherActivity.findMany({
        orderBy: { created_at: 'desc' },
        take: 10,
        include: { voucher: { select: { title: true, voucher_number: true } } }
      });
    } else if (role === 'ACCOUNTS') {
      const approved = await prisma.voucher.count({ where: { status: 'APPROVED' } });
      const sumQuery = await prisma.voucher.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true }
      });

      stats.approved = approved;
      stats.totalAmount = Number(sumQuery._sum.amount) || 0;

      const grouped = await prisma.voucher.groupBy({
        by: ['department'],
        where: { status: 'APPROVED' },
        _sum: { amount: true }
      });
      chartData = grouped.map(g => ({ name: g.department, value: Number(g._sum.amount) }));

      recentActivity = await prisma.voucherActivity.findMany({
        where: { action: 'APPROVED' },
        orderBy: { created_at: 'desc' },
        take: 10,
        include: { voucher: { select: { title: true, voucher_number: true } } }
      });
    }

    res.json({ success: true, data: { stats, chartData, recentActivity } });
  } catch (err) {
    next(err);
  }
};
