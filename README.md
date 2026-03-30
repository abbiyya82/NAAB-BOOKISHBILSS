====================================================================
RINGKASAN PROYEK:API TOKO (SISTEM MANAJEMEN KASIR)
»»———-　　———-««
Proyek ini adalah pengembangan API Server menggunakan Express.js untuk mendukung operasional toko (manajemen user, produk, kategori, dan transaksi).


✎ᝰ. 📚*STATUS IMPLEMENTASI MODUL*✎ᝰ. 📚
1.Koneksi Database (src/config/db.js): Selesai.Catatan: Logika koneksi database saat ini dinonaktifkan di Controller.
2.Routing & Struktur: Selesai.Catatan: Semua jalur API sudah didefinisikan.
3.Controller Logic (CRUD): Placeholder (501 Not Implemented).Catatan: Semua fungsi mengembalikan respons status 501.
4.Middleware Autentikasi: Fungsional.Catatan: Logika verifikasi token (JWT, isAdmin, isCashierOrAdmin) sudah terimplementasi.


💡📝💡📝*DESAIN DATABASE (5 Tabel Utama)*💡📝💡📝
1.USERS: Data Admin dan Kasir.
2.CATEGORIES: Data master kategori produk.
3.PRODUCTS: Data master produk dan stok. (Relasi: CATEGORIES)
4.TRANSACTIONS: Header transaksi penjualan. (Relasi: USERS)
5.TRANSACTION_ITEMS: Detail item transaksi. (Relasi: TRANSACTIONS, PRODUCTS)


★ ☆ ✮ ✶ ✷ ✵ ✧ ⋆ ☄︎ ⁕ ✶★ ☆ ✮ ✶ ✷ ✵ ✧ ⋆ ☄︎ ⁕ ✶★ ☆ ✮ ✶ ✷ ✵ ✧ ⋆ ☄︎ ⁕ ✶★ ☆ ✮ ✶ ✷ ✵ ✧ ⋆ ☄︎ ⁕ ✶
★ ☆ ✮ ✶ ✷ ✵ ✧ ⋆ ☄︎ ⁕ ✶     DOKUMENTASI ENDPOINT API (Base URL: /api)    ★ ☆ ✮ ✶ ✷ ✵ ✧ ⋆ ☄︎ ⁕ ✶
A. MODUL AUTENTIKASI (/api/auth)
-POST /login: Otentikasi user dan menghasilkan token. (Akses: Publik)
-POST /refresh-token: Memperbarui Access Token. (Akses: Publik)
-POST /logout: Menghapus token dan mengakhiri sesi. (Akses: User Terautentikasi)

B. MODUL MANAJEMEN USER (/api/users)
-POST /register: Mendaftarkan user baru (Admin/Kasir). (Akses: Admin)
-PUT /deactivate-user/:id: Mengubah status aktif user. (Akses: Admin)
-GET /profile: Mengambil data profil user yang sedang login. (Akses: User Terautentikasi)

C. MODUL MANAJEMEN KATEGORI (/api/categories)
-GET /: Mengambil semua kategori. (Akses: Publik)
-GET /:id: Mengambil kategori berdasarkan ID. (Akses: Publik)
-POST /: Membuat kategori baru. (Akses: Admin)PUT /:id: Memperbarui data kategori. (Akses: Admin)
-DELETE /:id: Menghapus kategori. (Akses: Admin)

D. MODUL MANAJEMEN PRODUK (/api/products)
-GET /: Mengambil semua produk. (Akses: Publik)
-GET /:id: Mengambil produk berdasarkan ID. (Akses: Publik)
-POST /: Membuat produk baru. (Akses: Admin)
-PUT /:id: Memperbarui data produk. (Akses: Admin)
-DELETE /:id: Menghapus produk. (Akses: Admin)

E. MODUL TRANSAKSI (/api/transactions)
-POST /: Membuat transaksi penjualan baru. (Akses: Kasir atau Admin)
-GET /: Mengambil semua transaksi. (Akses: Admin)
-GET /:id: Mengambil detail transaksi berdasarkan ID. (Akses: Kasir atau Admin)
-PUT /:id: Memperbarui transaksi (misal: membatalkan). (Akses: Admin)
-DELETE /:id: Menghapus transaksi. (Akses: Admin)
