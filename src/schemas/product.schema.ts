import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string({ message: 'Nama produk wajib diisi' })
    .min(1, { message: 'Nama produk tidak boleh kosong' })
    .max(100, { message: 'Nama produk maksimal 100 karakter' }),
  description: z
    .string()
    .optional()
    .default('-'),
  price: z.coerce
    .number({ message: 'Harga harus berupa angka valid' })
    .positive({ message: 'Harga harus lebih besar dari 0' }),
  category: z
    .string({ message: 'Kategori wajib diisi' })
    .min(1, { message: 'Kategori tidak boleh kosong' })
    .max(50, { message: 'Kategori maksimal 50 karakter' })
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Nama produk minimal 1 karakter' })
    .max(100, { message: 'Nama produk maksimal 100 karakter' })
    .optional(),
  description: z
    .string()
    .max(1000, { message: 'Deskripsi maksimal 1000 karakter' })
    .optional(),
  price: z.coerce
    .number({ message: 'Harga harus berupa angka valid' })
    .positive({ message: 'Harga harus lebih besar dari 0' })
    .optional(),
  category: z
    .string()
    .min(1, { message: 'Kategori minimal 1 karakter' })
    .max(50, { message: 'Kategori maksimal 50 karakter' })
    .optional()
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
