import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getNotifications = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError('Unauthorized', 401);

  const notifications = await prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: 50
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  res.json({
    status: 'success',
    data: {
      notifications,
      unreadCount
    }
  });
};

export const markAsRead = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError('Unauthorized', 401);

  await prisma.notification.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true }
  });

  res.json({
    status: 'success',
    message: 'Notifications marked as read'
  });
};
