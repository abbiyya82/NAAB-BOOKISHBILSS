import express from 'express';
const router = express.Router();

// Import semua fungsi controller transaksi
import {
    getTransactions, 
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
} from '../controllers/transactioncontroller.js'; 

// Import Middleware Autentikasi - PERBAIKAN: Named Import langsung
import { 
    verifyToken, 
    isAdmin, 
    isCashierOrAdmin 
} from '../middlewares/authMiddleware.js'; 

// ===============================================
// ROUTE UTAMA TRANSAKSI DENGAN MIDDLEWARE
// ===============================================

// 1. POST /transactions - CREATE NEW TRANSACTION (Akses: Admin, Kasir)
// Memerlukan verifikasi token dan izin Kasir atau Admin
router.post('/', verifyToken, isCashierOrAdmin, createTransaction); 

// 2. GET /transactions - GET ALL TRANSACTIONS (Akses: Admin)
// Memerlukan verifikasi token dan izin Admin
router.get('/', verifyToken, isAdmin, getTransactions); 

// 3. GET /transactions/:id - GET TRANSACTION BY ID (Akses: Admin, Kasir)
// Memerlukan verifikasi token dan izin Kasir atau Admin
router.get('/:id', verifyToken, isCashierOrAdmin, getTransactionById);

// 4. PUT /transactions/:id - UPDATE TRANSACTION BY ID (Akses: Admin)
// Memerlukan verifikasi token dan izin Admin
router.put('/:id', verifyToken, isAdmin, updateTransaction);

// 5. DELETE /transactions/:id - DELETE TRANSACTION BY ID (Akses: Admin)
// Memerlukan verifikasi token dan izin Admin
router.delete('/:id', verifyToken, isAdmin, deleteTransaction);


// EKSPOR ROUTER
export default router;