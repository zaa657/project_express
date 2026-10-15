# Panduan Pengujian API Express (MySQL + JWT + Cloudinary)

Aplikasi Backend REST API sederhana untuk pengujian di **Postman** atau **Thunder Client**.

---

## 🚀 1. Cara Menjalankan

Buka terminal di folder proyek, lalu ketik:
```bash
npm run dev
```
Server akan aktif di: `http://localhost:3000`

---

## 🔑 2. Akun Demo di Database MySQL

| Role | Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` | Akses penuh (bisa edit/hapus semua produk & lihat semua user) |
| **User** | `user@example.com` | `user123` | Hanya bisa edit & hapus produk miliknya sendiri |

---

## 📡 3. Daftar Endpoint API

### A. Autentikasi (`/api/auth`)

* **Login**: `POST http://localhost:3000/api/auth/login`
  * Body (JSON):
    ```json
    { "email": "admin@example.com", "password": "admin123" }
    ```
  * *Salin nilai `token` dari response untuk dipakai di request berikutnya.*

* **Cek Profil**: `GET http://localhost:3000/api/auth/me`
  * Header: `Authorization: Bearer <TOKEN>`

* **Register User Baru**: `POST http://localhost:3000/api/auth/register`
  * Body (JSON):
    ```json
    { "name": "Budi", "email": "budi@mail.com", "password": "password123", "role": "user" }
    ```

---

### B. Otorisasi Role (`/api/admin`)

* **Lihat Semua User**: `GET http://localhost:3000/api/admin/users`
  * Header: `Authorization: Bearer <TOKEN>`
  * *Jika pakai token **User Biasa** $\rightarrow$ Hasil: `403 Forbidden`.*
  * *Jika pakai token **Admin** $\rightarrow$ Hasil: `200 OK`.*

---

### C. CRUD Produk & Upload Foto (`/api/products`)

* **1. Tambah Produk + Foto (Create)**: `POST http://localhost:3000/api/products`
  * Header: `Authorization: Bearer <TOKEN>`
  * Body di Postman: Pilih tab **`form-data`**:
    * `name` (Text): `Mouse Gaming`
    * `description` (Text): `Mouse RGB responsif`
    * `price` (Text): `250  000`
    * `category` (Text): `Elektronik`
    * `image` (**File**): *(Pilih file foto JPG/PNG)*

* **2. Lihat Semua Produk (Read All)**: `GET http://localhost:3000/api/products`
  * *(Opsional cari)*: `http://localhost:3000/api/products?search=Mouse`

* **3. Lihat Detail Produk (Read One)**: `GET http://localhost:3000/api/products/<ID_PRODUK>`

* **4. Edit Produk (Update)**: `PUT http://localhost:3000/api/products/<ID_PRODUK>`
  * Header: `Authorization: Bearer <TOKEN>`
  * Body: Tab **`form-data`** (isi data yang ingin diubah).

* **5. Hapus Produk (Delete)**: `DELETE http://localhost:3000/api/products/<ID_PRODUK>`
  * Header: `Authorization: Bearer <TOKEN>`

---

## ☁️ 4. Pengaturan Cloudinary (`.env`)

Buka file [`.env`](file:///.env) jika ingin foto langsung masuk ke Cloudinary:
```env
CLOUDINARY_CLOUD_NAME=nama_cloud
CLOUDINARY_API_KEY=api_key
CLOUDINARY_API_SECRET=api_secret
```
*(Jika dikosongkan, foto otomatis tersimpan di folder lokal `public/uploads`).*

---

## 🌐 5. Tampilan Frontend Web (HTML + Tailwind)

Buka browser (Chrome / Edge / Firefox):
- **Katalog Produk Utama**: `http://localhost:3000/` (Daftar produk, pencarian realtime, filter kategori, switch Dark/Light mode)
- **Halaman Masuk (Login)**: `http://localhost:3000/login.html`
- **Halaman Daftar (Register)**: `http://localhost:3000/register.html`
- **Halaman Tambah Produk**: `http://localhost:3000/tambah-produk.html` (Form produk + preview & upload foto ke Cloudinary)
