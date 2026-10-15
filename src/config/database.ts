import mysql, { type Pool } from 'mysql2/promise';
import { ENV } from './env';
import { hashPassword } from '../utils/password';

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

export const initDatabase = async (): Promise<void> => {
  // 1. First ensure database exists
  const initialConnection = await mysql.createConnection({
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    user: ENV.DB_USER,
    password: ENV.DB_PASSWORD
  });

  await initialConnection.query(
    `CREATE DATABASE IF NOT EXISTS \`${ENV.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await initialConnection.end();

  // 2. Initialize connection pool to the database
  const db = getPool();

  // 3. Create users table
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(60) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 4. Create products table
  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(60) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(15, 2) NOT NULL,
      category VARCHAR(100) NOT NULL,
      image_url VARCHAR(500) NULL,
      user_id VARCHAR(60) NOT NULL,
      author_name VARCHAR(100) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_user_id (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 5. Check and seed default accounts if empty
  const [users]: any = await db.query('SELECT COUNT(*) as count FROM users');
  if (users[0].count === 0) {
    const adminPassword = await hashPassword('admin123');
    const userPassword = await hashPassword('user123');

    await db.query(
      `INSERT INTO users (id, name, email, password, role) VALUES 
       (?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?)`,
      [
        'usr_admin_1',
        'Administrator',
        'admin@example.com',
        adminPassword,
        'admin',
        'usr_user_1',
        'Budi Santoso',
        'user@example.com',
        userPassword,
        'user'
      ]
    );
  }

  // 6. Check and seed default products if empty
  const [products]: any = await db.query('SELECT COUNT(*) as count FROM products');
  if (products[0].count === 0) {
    await db.query(
      `INSERT INTO products (id, name, description, price, category, image_url, user_id, author_name) VALUES 
       (?, ?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'prod_1',
        'Kamera Mirrorless Pro',
        'Kamera mirrorless sensor full-frame 24MP dengan perekaman video 4K 60fps.',
        15500000,
        'Elektronik',
        null,
        'usr_admin_1',
        'Administrator',
        'prod_2',
        'Headphone Wireless Noise Cancelling',
        'Headphone bluetooth dengan audio Hi-Res dan peredam bising aktif hingga 30 jam.',
        2400000,
        'Audio',
        null,
        'usr_user_1',
        'Budi Santoso'
      ]
    );
  }
};
