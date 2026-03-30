// auth.js

import jwt from 'jsonwebtoken'; // Ubah require menjadi import (jika mode ES Module)
import dbPool from '../config/pool.js'; // Ubah require menjadi import

// Fungsi authorize: Memverifikasi token, mengambil data user dari DB, dan cek peran
const authorize = (allowedRoles = []) => {
    // 1. Ubah peran yang diizinkan menjadi huruf kecil untuk perbandingan
    const lowerCaseAllowedRoles = allowedRoles.map(role => role.toLowerCase());

    return async (req, res, next) => {
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Akses ditolak. Token tidak disediakan atau format salah.' });
        }
        
        const token = authHeader.split(' ')[1];

        try {
            // A. Verifikasi Token dan Ekstrak Payload
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id; 

            // B. Ambil Data User TERBARU dari Database
            const userQuery = 'SELECT user_id, username, role, is_active FROM users WHERE user_id = $1';
            const result = await dbPool.query(userQuery, [userId]);
            
            const user = result.rows[0];
            
            // ... (Kode debugging dan pengecekan lainnya)

            if (!user) {
                return res.status(401).json({ message: 'Akses ditolak. Pengguna di token tidak ditemukan di database.' });
            }

            // C. Cek Status Keaktifan
            if (!user.is_active) {
                 return res.status(403).json({ message: 'Akses ditolak. Akun Anda telah dinonaktifkan.' });
            }

            // D. Sisipkan Data User Terbaru ke Request
            req.user = {
                id: user.user_id,
                username: user.username,
                role: user.role 
            }; 

            // E. Cek Otorisasi Peran (Role)
            const userRoleLowerCase = user.role.toLowerCase();

            if (lowerCaseAllowedRoles.length > 0) {
                if (!lowerCaseAllowedRoles.includes(userRoleLowerCase)) {
                    return res.status(403).json({ 
                        message: `Akses ditolak. Hanya user dengan role ${allowedRoles.join(', ')} yang diizinkan.` 
                    });
                }
            }

            next(); // Lanjutkan
        } catch (err) {
            console.error('Verifikasi Otorisasi Gagal:', err);
            return res.status(401).json({ message: 'Akses ditolak. Token tidak valid atau kedaluwarsa.' });
        }
    };
};


// 🚨 PERBAIKAN KRITIS: Ganti sintaks export ke ES Module agar sesuai dengan import di userRoutes.js
export {
    authorize
};