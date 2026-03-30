const express = require("express");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const pool = require("./db");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
app.use(cors()); 
app.use(express.json());

// --- 1. LOGIN ---
app.post("/auth/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const userQuery = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        
        if (userQuery.rows.length === 0) {
            return res.status(401).json({ message: "User tidak ditemukan" });
        }

        const user = userQuery.rows[0];
        // Note: Disini kita bandingkan langsung. Jika kedepan pakai bcrypt, gunakan bcrypt.compare
        if (password === user.password_hash) { 
            const token = jwt.sign(
                { id: user.user_id, username: user.username, role: user.role },
                process.env.JWT_SECRET || "rahasia_ilahi", 
                { expiresIn: "24h" }
            );
            
            res.json({
                message: "Login Berhasil!",
                token,
                user: { 
                    username: user.username,
                    role: user.role // Ini kunci agar tombol Dashboard muncul
                }
            });
        } else {
            res.status(401).json({ message: "Password salah!" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
});

// --- 2. REGISTER ---
app.post("/auth/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        const userExist = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ message: "Username sudah terdaftar!" });
        }

        const query = `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)`;
        await pool.query(query, [username, password, 'staf']); // Default sebagai staf

        res.json({ message: "Registrasi berhasil! Silakan login." });
    } catch (err) {
        res.status(500).json({ message: "Gagal registrasi: " + err.message });
    }
});

// --- 3. AMBIL DATA BUKU ---
app.get("/api/data", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT kode_buku, judul, kategori, harga_jual, stok_saat_ini, image_url, isbn_unnik FROM judul_buku ORDER BY kode_buku ASC"
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Gagal mengambil data" });
    }
});

// --- 4. TAMBAH BUKU (Hanya 1 Fungsi Lengkap) ---
app.post("/api/tambah", async (req, res) => {
    const { judul, kategori, harga_jual, stok_saat_ini, image_url, isbn_unnik } = req.body;
    try {
        const query = `
            INSERT INTO judul_buku (judul, kategori, harga_jual, stok_saat_ini, image_url, isbn_unnik, id_penulis) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        const values = [judul, kategori, Number(harga_jual), Number(stok_saat_ini), image_url, isbn_unnik, 1];
        await pool.query(query, values);
        res.json({ message: "Buku berhasil ditambahkan!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 5. UPDATE BUKU (Hanya 1 Fungsi Lengkap) ---
app.put('/api/update/:id', async (req, res) => {
    const { id } = req.params; 
    const { judul, kategori, harga_jual, stok_saat_ini, image_url, isbn_unnik } = req.body;
    try {
        const query = `
            UPDATE judul_buku 
            SET judul = $1, kategori = $2, harga_jual = $3, stok_saat_ini = $4, image_url = $5, isbn_unnik = $6
            WHERE kode_buku = $7
        `;
        await pool.query(query, [judul, kategori, harga_jual, stok_saat_ini, image_url, isbn_unnik, id]);
        res.json({ message: "Update berhasil!" });
    } catch (err) {
        res.status(500).json({ message: "Gagal update database" });
    }
});

// --- 6. HAPUS BUKU ---
app.delete('/api/hapus/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM judul_buku WHERE kode_buku = $1", [id]);
        res.json({ message: "Buku berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ message: "Gagal menghapus data" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server Backend jalan di: http://localhost:${PORT}`);
});