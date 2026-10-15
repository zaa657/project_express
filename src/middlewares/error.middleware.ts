import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { sendError } from '../utils/response';

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route tidak ditemukan: [${req.method}] ${req.originalUrl}`, null, 404);
};

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Unhandled Server Error:', err);

  // Handle Multer upload limits & errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      sendError(res, 'Ukuran file terlalu besar! Maksimal ukuran file adalah 5MB.', null, 400);
      return;
    }
    sendError(res, `Gagal upload file: ${err.message}`, null, 400);
    return;
  }

  // Handle custom file filter error
  if (err && err.message && err.message.includes('Format file tidak didukung')) {
    sendError(res, err.message, null, 400);
    return;
  }

  // Generic internal server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan pada internal server';
  sendError(res, message, null, statusCode);
};
