const { Pool } = require("pg");
const path = require("path");
// Mencari file .env dua tingkat di atas folder ini
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD || ""), // Proteksi agar tidak undefined
    port: process.env.DB_PORT,
});

// Cek koneksi saat server nyala
pool.connect((err) => {
    if (err) {
        console.error("Gagal koneksi ke Database:", err.message);
    } else {
        console.log("Koneksi Database Berhasil!");
    }
});

module.exports = pool;