# 🛒 API Toko (Sistem Manajemen Kasir)

Proyek ini adalah pengembangan **API Server** menggunakan **Express.js** untuk mendukung operasional toko secara digital, mulai dari manajemen pengguna hingga pencatatan transaksi penjualan secara real-time.

---

## 🎯 Tujuan Proyek
* **Digitalisasi Operasional:** Menggantikan pencatatan manual menjadi sistem database yang terpusat.
* **Efisiensi Kasir:** Mempercepat proses transaksi dan manajemen stok produk.
* **Keamanan Data:** Memastikan akses data hanya bisa dilakukan oleh pihak berwenang (Admin/Kasir) menggunakan sistem token.
* **Skalabilitas:** Membangun fondasi sistem yang mudah dikembangkan di masa depan (seperti integrasi ke aplikasi Mobile atau Web).

---

## 🛠️ Persyaratan Sistem (Prerequisites)
Untuk menjalankan proyek ini, Anda membutuhkan:
* **Node.js** (Versi 14 atau terbaru)
* **NPM** (Node Package Manager)
* **Database MySQL/PostgreSQL** (Sesuai konfigurasi `db.js`)
* **Text Editor** (Sangat disarankan menggunakan VS Code)
* **Postman** atau **Insomnia** (Untuk pengujian API)

---

## 📊 Status Implementasi Modul
| Modul | Status | Catatan |
| :--- | :--- | :--- |
| **Koneksi Database** | ✅ Selesai | Logika koneksi saat ini dinonaktifkan di Controller. |
| **Routing & Struktur** | ✅ Selesai | Semua jalur API sudah didefinisikan. |
| **Controller Logic** | ⚠️ Placeholder | Status 501 (Not Implemented). |
| **Middleware Auth** | ✅ Fungsional | Terimplementasi JWT, `isAdmin`, dan `isCashierOrAdmin`. |

---

## 🗄️ Desain Database
Sistem ini menggunakan 5 tabel utama yang saling berelasi:
1.  **USERS**: Data kredensial Admin dan Kasir.
2.  **CATEGORIES**: Master data kategori produk.
3.  **PRODUCTS**: Data master produk, harga, dan stok (Relasi: *Categories*).
4.  **TRANSACTIONS**: Header transaksi penjualan (Relasi: *Users*).
5.  **TRANSACTION_ITEMS**: Detail item per transaksi (Relasi: *Transactions* & *Products*).

---

## 🚀 Dokumentasi Endpoint API (Base URL: `/api`)

### A. Autentikasi (`/api/auth`)
| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| POST | `/login` | Publik | Otentikasi user & generate token. |
| POST | `/refresh-token` | Publik | Memperbarui Access Token. |
| POST | `/logout` | Authenticated | Mengakhiri sesi user. |

### B. Manajemen User (`/api/users`)
| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Admin | Mendaftarkan user baru. |
| PUT | `/deactivate-user/:id` | Admin | Menonaktifkan status user. |
| GET | `/profile` | Authenticated | Mengambil profil user login. |

### C. Manajemen Kategori & Produk
| Modul | Method | Endpoint | Akses |
| :--- | :--- | :--- | :--- |
| **Category** | GET | `/categories` | Publik |
| **Category** | POST/PUT/DEL | `/categories/:id` | Admin |
| **Product** | GET | `/products` | Publik |
| **Product** | POST/PUT/DEL | `/products/:id` | Admin |

### D. Transaksi (`/api/transactions`)
| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| POST | `/` | Kasir/Admin | Membuat transaksi baru. |
| GET | `/` | Admin | Melihat semua riwayat transaksi. |
| GET | `/:id` | Kasir/Admin | Melihat detail transaksi spesifik. |
| PUT/DEL | `/:id` | Admin | Update/Hapus data transaksi. |

---
