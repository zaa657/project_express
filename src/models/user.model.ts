import { getPool } from '../config/database';
import type { IUser, UserRole } from '../types/auth';

export class UserModel {
  static async getAll(): Promise<IUser[]> {
    const db = getPool();
    const [rows]: any = await db.query(
      'SELECT id, name, email, role, created_at as createdAt FROM users ORDER BY created_at DESC'
    );
    return rows as IUser[];
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    const db = getPool();
    const [rows]: any = await db.query(
      'SELECT id, name, email, password, role, created_at as createdAt FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
      [email]
    );

    if (rows.length === 0) return null;
    return rows[0] as IUser;
  }

  static async findById(id: string): Promise<IUser | null> {
    const db = getPool();
    const [rows]: any = await db.query(
      'SELECT id, name, email, password, role, created_at as createdAt FROM users WHERE id = ? LIMIT 1',
      [id]
    );

    if (rows.length === 0) return null;
    return rows[0] as IUser;
  }

  static async create(userData: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<IUser> {
    const db = getPool();
    const id = 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const role: UserRole = userData.role || 'user';
    const email = userData.email.toLowerCase();

    await db.query(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [id, userData.name, email, userData.password, role]
    );

    return {
      id,
      name: userData.name,
      email,
      role,
      createdAt: new Date().toISOString()
    };
  }
}
