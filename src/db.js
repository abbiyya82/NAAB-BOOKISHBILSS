// db.js

// 1. **BARIS PENTING INI HARUS ADA:** // Memuat variabel dari .env ke process.env
require('dotenv').config(); 

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD, // Sekarang ini seharusnya terbaca sebagai "postgres"
  port: process.env.DB_PORT,
});

// Tes koneksi (Opsional tapi bagus)
pool.connect((err, client, release) => {
    if (err) {
        // Tampilkan error jika koneksi gagal
        console.error('❌ Gagal terhubung ke database PostgreSQL!:', err.message);
        console.error('Pastikan variabel .env (DB_HOST, DB_NAME, dll.) sudah benar.');
        return; 
    }
    console.log('✅ Koneksi Database Berhasil!');
    release(); // Lepaskan client
});


module.exports = pool;