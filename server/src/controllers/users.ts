import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';

export const uploadSignatureHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 400, message: 'No signature file uploaded.' } });
    }

    const userId = req.user?.userId;
    const signatureUrl = `/uploads/signatures/${req.file.filename}`;

    await prisma.user.update({
      where: { id: userId },
      data: { signature_url: signatureUrl }
    });

    res.json({ success: true, data: { signature_url: signatureUrl } });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        employee_code: true,
        signature_url: true,
        created_at: true,
      }
    });
    res.json({ success: true, data: { users } });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { name, department, employee_code } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name: name.trim() }),
        ...(department !== undefined && { department: department.trim() }),
        ...(employee_code !== undefined && { employee_code: employee_code.trim() }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        employee_code: true,
        signature_url: true,
      }
    });

    res.json({ success: true, data: { user: updated } });
  } catch (err) {
    next(err);
  }
};


