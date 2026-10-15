import { Router, type Request, type Response } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserModel } from '../models/user.model';
import { sendSuccess } from '../utils/response';

const router = Router();

// Endpoint khusus ADMIN: melihat daftar semua user yang terdaftar di database MySQL
router.get(
  '/users',
  authenticate,
  authorize('admin'),
  async (_req: Request, res: Response) => {
    const users = (await UserModel.getAll()).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    }));
    sendSuccess(res, 'Daftar semua pengguna dari MySQL (Khusus Admin)', users);
  }
);

export default router;
