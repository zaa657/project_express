import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .optional(), // Opsional: jika kosong, otomatis memakai username dari email
  email: z
    .string({ message: 'Email wajib diisi' })
    .email({ message: 'Format email tidak valid' }),
  password: z
    .string({ message: 'Password wajib diisi' })
    .min(6, { message: 'Password minimal 6 karakter' }),
  role: z
    .enum(['user', 'admin'], { message: "Role harus 'user' atau 'admin'" })
    .optional()
    .default('user'),
  expiresIn: z
    .string()
    .optional()
});

export const loginSchema = z.object({
  email: z
    .string({ message: 'Email wajib diisi' })
    .email({ message: 'Format email tidak valid' }),
  password: z
    .string({ message: 'Password wajib diisi' })
    .min(1, { message: 'Password wajib diisi' }),
  expiresIn: z
    .string()
    .optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
