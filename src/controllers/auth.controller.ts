import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      sendSuccess(res, 'Registrasi berhasil', result, 201);
    } catch (err: any) {
      sendError(res, err.message || 'Registrasi gagal', null, 400);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      sendSuccess(res, 'Login berhasil', result, 200);
    } catch (err: any) {
      sendError(res, err.message || 'Login gagal', null, 401);
    }
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Pengguna belum terautentikasi', null, 401);
        return;
      }

      const profile = await AuthService.getProfile(req.user.id);
      sendSuccess(res, 'Profil berhasil dimuat', profile);
    } catch (err: any) {
      sendError(res, err.message || 'Gagal memuat profil', null, 404);
    }
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('token');
    sendSuccess(res, 'Logout berhasil');
  }
}
