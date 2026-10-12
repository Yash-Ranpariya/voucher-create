import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../server';
import { env } from '../config/env';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string()
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 400, message: 'Invalid input', fields: parsed.error.format() } });
    }

    const { email, password, role } = parsed.data;

    let user = await prisma.user.findUnique({ where: { email } });
    
    // Demo Mode: Auto-create user if they don't exist
    if (!user) {
      const password_hash = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          password_hash,
          role,
          department: 'General'
        }
      });
    } else if (user.role !== role) {
      // Demo Mode: Update user role if they selected a different one
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role }
      });
    }

    // Demo Mode: We bypass password validation so anyone can log in with any password
    // (If you want strict passwords later, uncomment below)
    /*
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: { code: 401, message: 'Invalid credentials' } });
    }
    */

    const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  res.json({ success: true, data: { message: 'Logged out successfully' } });
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: { id: true, name: true, email: true, role: true, department: true, employee_code: true, signature_url: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { code: 404, message: 'User not found' } });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};
