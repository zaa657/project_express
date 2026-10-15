import { UserModel } from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema';
import type { IUser } from '../types/auth';

export class AuthService {
  static async register(input: RegisterInput) {
    // Check if user email already exists in MySQL
    const existing = await UserModel.findByEmail(input.email);
    if (existing) {
      throw new Error('Email sudah terdaftar. Silakan gunakan email lain atau login.');
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    const userName = input.name || input.email.split('@')[0];

    // Create user in MySQL
    const newUser = await UserModel.create({
      name: userName,
      email: input.email,
      password: hashedPassword,
      role: input.role || 'user'
    });

    // Generate JWT token with optional custom expiration
    const token = signToken(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      },
      input.expiresIn
    );

    const sanitizedUser: Omit<IUser, 'password'> = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt
    };

    return { user: sanitizedUser, token, expiresIn: input.expiresIn || 'default' };
  }

  static async login(input: LoginInput) {
    const user = await UserModel.findByEmail(input.email);
    if (!user || !user.password) {
      throw new Error('Email atau password salah');
    }

    const isMatch = await comparePassword(input.password, user.password);
    if (!isMatch) {
      throw new Error('Email atau password salah');
    }

    // Generate JWT token with optional custom expiration
    const token = signToken(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      input.expiresIn
    );

    const sanitizedUser: Omit<IUser, 'password'> = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    return { user: sanitizedUser, token, expiresIn: input.expiresIn || 'default' };
  }

  static async getProfile(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('Pengguna tidak ditemukan di database');
    }

    const sanitizedUser: Omit<IUser, 'password'> = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    return sanitizedUser;
  }
}
