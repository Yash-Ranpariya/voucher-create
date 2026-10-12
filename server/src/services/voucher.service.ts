import { PrismaClient } from '@prisma/client';
import { prisma } from '../server';

export class VoucherService {
  /**
   * Generates a safe, unique voucher number using a transaction.
   * Format: VCH-YYYY-0001
   */
  static async generateVoucherNumber(): Promise<string> {
    const year = new Date().getFullYear();

    return await prisma.$transaction(async (tx) => {
      const counter = await tx.voucherCounter.upsert({
        where: { year },
        update: { last_number: { increment: 1 } },
        create: { year, last_number: 1 }
      });

      const formattedNumber = String(counter.last_number).padStart(4, '0');
      return `VCH-${year}-${formattedNumber}`;
    });
  }

  static async logActivity(tx: any, voucherId: string, actorId: string, action: string, note?: string) {
    await tx.voucherActivity.create({
      data: { voucher_id: voucherId, actor_id: actorId, action, note }
    });
  }

  static validateStatusTransition(current: string, action: 'submit' | 'approve' | 'reject' | 'verify') {
    if (action === 'submit' && current !== 'DRAFT') throw new Error('Only Drafts can be submitted');
    if (action === 'verify' && current !== 'PENDING_ACCOUNTS_VERIFICATION') throw new Error('Cannot verify this voucher');
    if ((action === 'approve' || action === 'reject') && current !== 'PENDING_APPROVAL' && current !== 'PENDING_ACCOUNTS_VERIFICATION') {
      throw new Error(`Cannot ${action} a voucher that is not pending`);
    }
  }

  static async notifyUser(tx: any, userId: string, title: string, message: string, type: string = 'INFO', link?: string) {
    await tx.notification.create({
      data: { user_id: userId, title, message, type, link }
    });
  }

  static async notifyRole(tx: any, role: string, title: string, message: string, type: string = 'INFO', link?: string) {
    const users = await tx.user.findMany({ where: { role } });
    if (users.length > 0) {
      await tx.notification.createMany({
        data: users.map((u: any) => ({
          user_id: u.id, title, message, type, link
        }))
      });
    }
  }
}
