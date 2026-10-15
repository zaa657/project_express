import mysql, { type Pool } from 'mysql2/promise';
import { ENV } from './env';

let pool: Pool;

export const getPool = (): Pool => {
  if (!pool) {
    pool = mysql.createPool({
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      user: ENV.DB_USER,
      password: ENV.DB_PASSWORD,
      database: ENV.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
};

/**
 * Memeriksa koneksi ke database MySQL.
 * Seluruh pembuatan tabel dikelola secara manual di MySQL / phpMyAdmin menggunakan database.sql.
 */
export const initDatabase = async (): Promise<void> => {
  const db = getPool();
  const connection = await db.getConnection();
  console.log(`[Database] Berhasil terhubung ke database MySQL '${ENV.DB_NAME}' di ${ENV.DB_HOST}:${ENV.DB_PORT}`);
  connection.release();
};
