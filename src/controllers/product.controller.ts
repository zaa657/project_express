import type { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { StorageService } from '../services/storage.service';
import { sendSuccess, sendError } from '../utils/response';

export class ProductController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;

      const products = await ProductService.getAll(search, category);
      sendSuccess(res, 'Daftar produk berhasil dimuat dari MySQL', products);
    } catch (err: any) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const product = await ProductService.getById(id);
      sendSuccess(res, 'Detail produk berhasil dimuat dari MySQL', product);
    } catch (err: any) {
      if (err.statusCode === 404) {
        sendError(res, err.message, null, 404);
        return;
      }
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Autentikasi diperlukan', null, 401);
        return;
      }

      // Check if image file was uploaded
      let imageUrl: string | null = null;
      let uploadProvider: string | null = null;

      if (req.file) {
        // Upload to Cloudinary (or local fallback)
        const uploadResult = await StorageService.uploadImage(req.file);
        imageUrl = uploadResult.url;
        uploadProvider = uploadResult.provider;
      }

      const newProduct = await ProductService.create(req.body, imageUrl, req.user);
      
      const successMessage = uploadProvider === 'cloudinary'
        ? 'Produk berhasil ditambahkan & foto di-upload ke Cloudinary'
        : 'Produk berhasil ditambahkan';

      sendSuccess(res, successMessage, { ...newProduct, uploadProvider }, 201);
    } catch (err: any) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Autentikasi diperlukan', null, 401);
        return;
      }

      const id = String(req.params.id);

      // Check if new image file was uploaded
      let newImageUrl: string | null = null;
      let uploadProvider: string | null = null;

      if (req.file) {
        const uploadResult = await StorageService.uploadImage(req.file);
        newImageUrl = uploadResult.url;
        uploadProvider = uploadResult.provider;
      }

      const updated = await ProductService.update(
        id,
        req.body,
        newImageUrl,
        req.user
      );

      const successMessage = uploadProvider === 'cloudinary'
        ? 'Produk berhasil diperbarui & foto baru di-upload ke Cloudinary'
        : 'Produk berhasil diperbarui';

      sendSuccess(res, successMessage, { ...updated, uploadProvider });
    } catch (err: any) {
      if (err.statusCode) {
        sendError(res, err.message, null, err.statusCode);
        return;
      }
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Autentikasi diperlukan', null, 401);
        return;
      }

      const id = String(req.params.id);
      const deleted = await ProductService.delete(id, req.user);
      sendSuccess(res, 'Produk berhasil dihapus dari database MySQL', deleted);
    } catch (err: any) {
      if (err.statusCode) {
        sendError(res, err.message, null, err.statusCode);
        return;
      }
      next(err);
    }
  }
}
