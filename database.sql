-- =======================================================
-- Database Schema untuk Project Express (Store Ari)
-- DBMS: MySQL / MariaDB (XAMPP / Laragon / Docker / dsb)
-- =======================================================

-- 1. Buat Database (jika belum ada)
CREATE DATABASE IF NOT EXISTS `project_express`
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `project_express`;

-- 2. Matikan Foreign Key Check sementara saat setup tabel
SET FOREIGN_KEY_CHECKS = 0;

-- 3. Hapus Tabel Lama (jika ingin reset)
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- =======================================================
-- TABEL: users
-- Menyimpan data akun pengguna dan administrator
-- =======================================================
CREATE TABLE `users` (
  `id` VARCHAR(60) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- TABEL: products
-- Menyimpan katalog produk milik seller / admin
-- =======================================================
CREATE TABLE `products` (
  `id` VARCHAR(60) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(15, 2) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `user_id` VARCHAR(60) NOT NULL,
  `author_name` VARCHAR(100) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_products_user_id` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- DATA AWAL (SEED DUMMY)
-- Password sudah di-hash menggunakan Bcrypt (aman untuk login)
-- - Akun Admin : admin@example.com / password: admin123
-- - Akun User  : user@example.com  / password: user123
-- =======================================================
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
('usr_admin_1', 'Administrator', 'admin@example.com', '$2b$10$XTUdl2Zk9YQYzGX2V/ipvOBfUch1T6Ps6n6TlPLnWyvvcu6zxLif.', 'admin'),
('usr_user_1', 'Budi Santoso', 'user@example.com', '$2b$10$5poEWKsqd.UVVEfJmZ/K1e1LuCZQ2GfJw1XN8mL11KqwN4mgUBiAG', 'user');

INSERT INTO `products` (`id`, `name`, `description`, `price`, `category`, `image_url`, `user_id`, `author_name`) VALUES
('prod_1', 'Kamera Mirrorless Pro', 'Kamera mirrorless sensor full-frame 24MP dengan perekaman video 4K 60fps.', 15500000.00, 'Elektronik', NULL, 'usr_admin_1', 'Administrator'),
('prod_2', 'Headphone Wireless Noise Cancelling', 'Headphone bluetooth dengan audio Hi-Res dan peredam bising aktif hingga 30 jam.', 2400000.00, 'Audio', NULL, 'usr_user_1', 'Budi Santoso');
