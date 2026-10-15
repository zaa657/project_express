import { ProductModel, type IProduct } from '../models/product.model';
import { StorageService } from './storage.service';
import type { CreateProductInput, UpdateProductInput } from '../schemas/product.schema';
import type { JWTPayload } from '../types/auth';

export class ProductService {
  static async getAll(search?: string, category?: string): Promise<IProduct[]> {
    return await ProductModel.getAll(search, category);
  }

  static async getById(id: string): Promise<IProduct> {
    const product = await ProductModel.findById(id);
    if (!product) {
      const err: any = new Error(`Produk dengan ID '${id}' tidak ditemukan`);
      err.statusCode = 404;
      throw err;
    }
    return product;
  }

  static async create(
    data: CreateProductInput,
    imageUrl: string | null,
    user: JWTPayload
  ): Promise<IProduct> {
    return await ProductModel.create({
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      imageUrl,
      userId: user.id,
      authorName: user.name
    });
  }

  static async update(
    id: string,
    data: UpdateProductInput,
    newImageUrl: string | null,
    user: JWTPayload
  ): Promise<IProduct> {
    const product = await this.getById(id);

    // Authorization check: Only product owner or admin can update
    const isOwner = product.userId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      const err: any = new Error(
        'Akses ditolak. Anda hanya dapat mengubah produk yang Anda buat sendiri.'
      );
      err.statusCode = 403;
      throw err;
    }

    // If new image is uploaded, remove previous image (ImageKit or local)
    let finalImageUrl = product.imageUrl;
    if (newImageUrl) {
      if (product.imageUrl) {
        await StorageService.deleteImage(product.imageUrl);
      }
      finalImageUrl = newImageUrl;
    }

    const updated = await ProductModel.update(id, {
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.category && { category: data.category }),
      ...(newImageUrl && { imageUrl: finalImageUrl })
    });

    if (!updated) {
      const err: any = new Error('Gagal memperbarui produk di database');
      err.statusCode = 500;
      throw err;
    }

    return updated;
  }

  static async delete(id: string, user: JWTPayload): Promise<IProduct> {
    const product = await this.getById(id);

    // Authorization check: Only product owner or admin can delete
    const isOwner = product.userId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      const err: any = new Error(
        'Akses ditolak. Anda hanya dapat menghapus produk yang Anda buat sendiri.'
      );
      err.statusCode = 403;
      throw err;
    }

    // Delete image if exists
    if (product.imageUrl) {
      await StorageService.deleteImage(product.imageUrl);
    }

    const deleted = await ProductModel.delete(id);
    if (!deleted) {
      const err: any = new Error('Gagal menghapus produk dari database');
      err.statusCode = 500;
      throw err;
    }

    return product;
  }
}
