import express from 'express';
const router = express.Router();

// Import Controller yang menangani semua fungsi Autentikasi
import { 
    login, 
    // ✨ PERBAIKAN 1: Menambahkan 'register' ke dalam import
    register, 
    refreshToken, 
    logout 
} from '../controllers/authController.js'; 

// Import Middleware autentikasi
import { 
    verifyToken 
} from '../middlewares/authMiddleware.js'; 


// ===============================================
// ROUTE AUTENTIKASI
// ===============================================

// 1. POST /auth/login - Autentikasi dan mendapatkan token (Publik)
router.post('/login', login);

// 2. POST /auth/register - Membuat user baru (Publik)
// ✨ PERBAIKAN 2: Menambahkan route untuk Register
router.post('/register', register); 

// 3. POST /auth/refresh-token - Mendapatkan access token baru menggunakan refresh token (Publik/Khusus)
router.post('/refresh-token', refreshToken); 

// 4. POST /auth/logout - Menghapus token (Memerlukan token yang aktif)
router.post('/logout', verifyToken, logout);


// EKSPOR ROUTER
export default router;