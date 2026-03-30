import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dbPool from '../config/pool.js'; 
import { generateAccessToken, generateRefreshToken } from '../config/jwt.js'; 

// =========================================================================
// CONTROLLER UTAMA: LOGIN, REGISTER, REFRESH TOKEN, LOGOUT
// =========================================================================

/**
 * Fungsi untuk menangani proses login user.
 * 1. Menerima username dan password.
 * 2. Mencari user di database (tabel users) berdasarkan username.
 * 3. Membandingkan password (bcrypt).
 * 4. Jika cocok, generate JWT (Access Token & Refresh Token).
 */
export const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password wajib diisi.' });
    }

    try {
        // ✨ PERBAIKAN: Hanya SELECT kolom yang ada di DB Anda (user_id, username, password_hash, role)
        const result = await dbPool.query(
            'SELECT user_id, username, password_hash, role FROM users WHERE username = $1',
            [username]
        );

        const user = result.rows[0];

        // Cek apakah user ada
        if (!user) {
            return res.status(401).json({ message: 'Username atau password tidak valid.' });
        }
        
        // Bandingkan password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Username atau password tidak valid.' });
        }

        // Generate Tokens
        const userPayload = {
            // ✨ PERBAIKAN: Gunakan user.user_id untuk ID di payload
            id: user.user_id, 
            username: user.username,
            role: user.role
        };

        const accessToken = generateAccessToken(userPayload);
        const refreshToken = generateRefreshToken(userPayload);
        
        // Kirim token ke client
        return res.status(200).json({
            message: 'Login berhasil!',
            accessToken,
            refreshToken,
            user: {
                // ✨ PERBAIKAN: Gunakan user.user_id saat mengirim respons ke klien
                id: user.user_id, 
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error saat login:', error);
        return res.status(500).json({ 
            message: 'Terjadi kesalahan server saat proses login.', 
            error: error.message 
        });
    }
};

// --------------------------------------------------------------------------------------

/**
 * Fungsi untuk menangani pendaftaran (registrasi) user baru.
 * 1. Menerima username, password, dan role.
 * 2. Hash password menggunakan bcrypt.
 * 3. Menyimpan user baru ke database.
 */
export const register = async (req, res) => {
    const { username, password, role } = req.body;
    
    // Validasi input dasar
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Username, password, dan role wajib diisi.' });
    }

    // Validasi role (opsional, tergantung kebutuhan)
    const validRoles = ['admin', 'staff', 'cashier'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Role tidak valid.' });
    }

    try {
        // 1. Cek duplikasi username
        const checkUser = await dbPool.query('SELECT user_id FROM users WHERE username = $1', [username]);
        if (checkUser.rows.length > 0) {
            return res.status(409).json({ message: 'Username sudah digunakan.' });
        }

        // 2. Hash Password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 3. Simpan user baru ke database
        // Kolom di DB Anda: user_id (serial), username, password_hash, role, created_at
        const newUser = await dbPool.query(
            'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id, username, role, created_at',
            [username, hashedPassword, role]
        );

        return res.status(201).json({
            message: 'Registrasi berhasil!',
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error('Error saat registrasi:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan server saat proses registrasi.',
            error: error.message
        });
    }
};

// --------------------------------------------------------------------------------------

/**
 * Fungsi untuk memperbarui Access Token menggunakan Refresh Token.
 */
export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    const REFRESH_TOKEN_SECRET = process.env.JWT_SECRET; // Asumsi Anda menggunakan JWT_SECRET untuk Refresh Token

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh Token wajib disertakan.' });
    }

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        
        const userPayload = {
            id: decoded.id,
            username: decoded.username,
        };

        // ✨ PERBAIKAN: Menggunakan kolom 'user_id' untuk pencarian di DB
        const result = await dbPool.query('SELECT role FROM users WHERE user_id = $1', [userPayload.id]);
        const user = result.rows[0];

        if (!user) {
             return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        userPayload.role = user.role;
        
        // Generate Access Token baru
        const newAccessToken = generateAccessToken(userPayload);
        
        return res.status(200).json({
            message: 'Access Token baru berhasil dibuat.',
            accessToken: newAccessToken
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Refresh Token kedaluwarsa.' });
        }
        console.error('Error saat refresh token:', error);
        return res.status(401).json({ 
            message: 'Refresh Token tidak valid atau ada kesalahan.',
            error: error.message
        });
    }
};

// --------------------------------------------------------------------------------------

/**
 * Fungsi untuk menangani proses logout user.
 */
export const logout = (req, res) => {
    // Middleware verifyToken mengisi req.user jika token valid
    if (req.user) {
        return res.status(200).json({ 
            message: `Logout user ${req.user.username} (ID: ${req.user.id}) berhasil. Access Token tidak berlaku lagi.`
        });
    }

    return res.status(200).json({ 
        message: 'Logout berhasil. Token telah dihapus di sisi client.' 
    });
};

// --------------------------------------------------------------------------------------