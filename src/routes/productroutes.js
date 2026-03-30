import express from 'express';
const router = express.Router();

// Import semua fungsi controller produk
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/productController.js'; 

// Import Middleware Autentikasi - PERBAIKAN: Menggunakan Named Import langsung
import { 
    verifyToken, 
    isAdmin 
} from '../middlewares/authMiddleware.js';


// ===============================================
// ROUTE UTAMA PRODUK DENGAN MIDDLEWARE
// ===============================================

// 1. GET /api/products - Mengambil semua produk (Akses: Publik/Semua)
router.get('/', getAllProducts);

// 2. GET /api/products/:id - Mengambil produk berdasarkan ID (Akses: Publik/Semua)
router.get('/:id', getProductById);

// 3. POST /api/products - Membuat produk baru (Akses: Admin)
// Memerlukan verifikasi token dan izin Admin
router.post('/', verifyToken, isAdmin, createProduct);

// 4. PUT /api/products/:id - Memperbarui produk (Akses: Admin)
// Memerlukan verifikasi token dan izin Admin
router.put('/:id', verifyToken, isAdmin, updateProduct);

// 5. DELETE /api/products/:id - Menghapus produk (Akses: Admin)
// Memerlukan verifikasi token dan izin Admin
router.delete('/:id', verifyToken, isAdmin, deleteProduct);


// EKSPOR ROUTER
export default router;