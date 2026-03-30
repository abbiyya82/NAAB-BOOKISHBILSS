import express from 'express';
import { updateUserStatus } from '../controllers/userController.js'; 

// Hapus require. Gunakan import untuk konsistensi dengan ES Module.
// Pastikan file auth.js juga mengekspor authorize dengan 'export const authorize' 
// ATAU kita akan menyesuaikan cara impornya di sini.
import { authorize } from '../middlewares/auth.js'; 

const router = express.Router();

// ===============================================
// ROUTES PENGGUNA
// ===============================================

// Contoh: Untuk menonaktifkan Kasir dengan ID 5
// Method: PUT /users/status/5
// Body: { "is_active": false }
router.put('/status/:id', authorize(['Admin']), updateUserStatus);

// Tambahkan route lain di sini, misalnya:
// router.get('/', authorize(['Admin']), getUsers);
// router.post('/', authorize(['Admin']), createUser);


export default router;