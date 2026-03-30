import jwt from 'jsonwebtoken';

// Ambil secret key dari variabel lingkungan
// Gunakan JWT_SECRET karena Anda menggunakannya untuk Refresh Token
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET; 

// ... (verifyToken tidak perlu diubah)
export const verifyToken = (req, res, next) => {
    // ... (kode verifyToken tetap sama)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
        return res.status(401).json({ 
            message: 'Akses ditolak. Token tidak ditemukan di header Authorization (Bearer Token).' 
        });
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                message: 'Akses terlarang. Token tidak valid atau kedaluwarsa.',
                error: err.name
            });
        }
        
        req.user = user;
        next();
    });
};


/**
 * Middleware untuk membatasi akses hanya untuk user dengan role 'admin'.
 */
export const isAdmin = (req, res, next) => {
    // ✨ PERBAIKAN 1: Pengecekan role menggunakan huruf kecil ('admin')
    if (req.user && req.user.role === 'admin') { 
        next(); // Lanjutkan ke controller jika role adalah admin
    } else {
        return res.status(403).json({ 
            message: 'Akses terlarang. Hanya role Admin yang diperbolehkan.' 
        });
    }
};

/**
 * Middleware untuk membatasi akses hanya untuk user dengan role 'staff', 'cashier' atau 'admin'.
 */
export const isCashierOrAdmin = (req, res, next) => {
    const role = req.user ? req.user.role : null;
    
    // ✨ PERBAIKAN 2: Pengecekan role menggunakan role yang ada di DB ('staff', 'cashier', 'admin')
    if (role && (role === 'staff' || role === 'cashier' || role === 'admin')) {
        next(); // Lanjutkan ke controller jika role adalah Kasir, Staff, atau Admin
    } else {
        return res.status(403).json({ 
            message: 'Akses terlarang. Hanya role Kasir atau Admin yang diperbolehkan.' 
        });
    }
};


// Ekspor semua middleware
export default {
    verifyToken,
    isAdmin,
    isCashierOrAdmin
};