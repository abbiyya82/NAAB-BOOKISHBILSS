import express from 'express';
const router = express.Router();

// Import semua fungsi controller kategori - Named Import
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/categoryController.js'; 

// Import Middleware Autentikasi - PERBAIKAN: Menggunakan Named Import langsung
import { 
    verifyToken, 
    isAdmin 
} from '../middlewares/authMiddleware.js';


// ===============================================
// ROUTE UTAMA KATEGORI DENGAN MIDDLEWARE
// ===============================================

// 1. GET /api/categories - Mengambil semua kategori (Akses: Publik/Semua)
router.get('/', getAllCategories);

// 2. GET /api/categories/:id - Mengambil kategori berdasarkan ID (Akses: Publik/Semua)
router.get('/:id', getCategoryById);

// 3. POST /api/categories - Membuat kategori baru (Akses: Admin)
// Memerlukan verifikasi token dan izin Admin
router.post('/', verifyToken, isAdmin, createCategory);

// 4. PUT /api/categories/:id - Memperbarui kategori (Akses: Admin)
// Memerlukan verifikasi token dan izin Admin
router.put('/:id', verifyToken, isAdmin, updateCategory);

// 5. DELETE /api/categories/:id - Menghapus kategori (Akses: Admin)
// Memerlukan verifikasi token dan izin Admin
router.delete('/:id', verifyToken, isAdmin, deleteCategory);


// EKSPOR ROUTER
export default router;