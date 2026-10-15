import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_super_secret_jwt_key_12345',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // MySQL Database Configuration
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'project_express',

  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  // Upload Directory for Local Storage Fallback
  UPLOAD_DIR: path.resolve(process.cwd(), 'public', 'uploads')
};
