import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UserModel } from '../models/user.model';
import { sendError } from '../utils/response';
import type { UserRole } from '../types/auth';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // 1. Check Authorization header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // 2. Check cookies
      token = req.cookies.token;
    }

    if (!token) {
      sendError(res, 'Akses ditolak. Anda belum login atau token autentikasi tidak tersedia', null, 401);
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      sendError(res, 'Token tidak valid atau telah kedaluwarsa. Silakan login kembali', null, 401);
      return;
    }

    // Verify user exists in MySQL database
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      sendError(res, 'Akun pengguna tidak ditemukan di database', null, 401);
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (err: any) {
    sendError(res, 'Gagal memverifikasi token autentikasi', err.message, 500);
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Akses ditolak. Autentikasi diperlukan', null, 401);
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Akses ditolak. Fitur ini memerlukan role [${allowedRoles.join(', ')}], sedangkan role Anda saat ini adalah [${req.user.role}]`,
        null,
        403
      );
      return;
    }

    next();
  };
};
