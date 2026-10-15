import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';
import { sendError } from '../utils/response';

type TargetLocation = 'body' | 'query' | 'params';

export const validate = (schema: ZodTypeAny, target: TargetLocation = 'body') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Sanitize keys: trim trailing/leading spaces and handle common Indonesian aliases
      if (req[target] && typeof req[target] === 'object' && !Array.isArray(req[target])) {
        const sanitized: Record<string, any> = {};
        for (const [key, value] of Object.entries(req[target])) {
          sanitized[key.trim()] = typeof value === 'string' ? value.trim() : value;
        }

        // Support Indonesian field name aliases automatically
        if (!sanitized.description && sanitized.deskripsi) sanitized.description = sanitized.deskripsi;
        if (!sanitized.description && sanitized.desc) sanitized.description = sanitized.desc;
        if (sanitized.price === undefined && sanitized.harga !== undefined) sanitized.price = sanitized.harga;
        if (!sanitized.category && sanitized.kategori) sanitized.category = sanitized.kategori;
        if (!sanitized.name && sanitized.nama) sanitized.name = sanitized.nama;

        req[target] = sanitized;
      }

      // 2. Validate with Zod
      const parsed = await schema.safeParseAsync(req[target]);

      if (!parsed.success) {
        const issues = (parsed as any).error?.issues || [];
        const formattedErrors = issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message
        }));

        sendError(res, 'Validasi input gagal', formattedErrors, 400);
        return;
      }

      // Replace target data with parsed & coerced data
      req[target] = parsed.data;
      next();
    } catch (err: any) {
      sendError(res, 'Terjadi kesalahan saat validasi data', err.message, 400);
    }
  };
};
