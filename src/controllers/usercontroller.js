import dbPool from '../config/pool.js';
import moment from 'moment-timezone';

moment.tz.setDefault('Asia/Jakarta');

// Fungsi untuk menangani error PostgreSQL (opsional, tapi disarankan)
const handlePostgresError = (error, res, action) => {
    console.error(`Error in ${action}:`, error);
    
    if (error.code === '22P02') { 
        return res.status(400).json({ 
            msg: `Gagal: Kesalahan format data. Pastikan ID pengguna adalah angka yang valid.`,
            detail: error.detail || `Kesalahan representasi teks/data.`
        });
    }

    res.status(500).json({ msg: 'Internal Server Error', error: error.message });
};

// ===============================================
// 1. NONAKTIFKAN / AKTIFKAN PENGGUNA (Kasir / Admin)
// ===============================================
// AKSES: Admin
export const updateUserStatus = async (req, res) => {
    const { id } = req.params; // user_id
    // is_active: true (aktifkan) atau false (nonaktifkan)
    const { is_active } = req.body; 

    // Validasi input
    if (typeof is_active !== 'boolean') {
        return res.status(400).json({ msg: "Nilai 'is_active' wajib diisi dan harus boolean (true/false)." });
    }

    try {
        const updateQuery = `
            UPDATE users 
            SET is_active = $1
            WHERE user_id = $2 AND role = 'Kasir' 
            RETURNING user_id, username, role, is_active
        `;
        
        const result = await dbPool.query(updateQuery, [is_active, id]);

        if (result.rows.length === 0) {
            // Cek apakah ID tidak ditemukan atau bukan Kasir
            const checkQuery = 'SELECT user_id, role FROM users WHERE user_id = $1';
            const checkResult = await dbPool.query(checkQuery, [id]);
            
            if (checkResult.rows.length === 0) {
                 return res.status(404).json({ msg: 'Pengguna (Kasir) tidak ditemukan.' });
            }
            if (checkResult.rows[0].role !== 'Kasir') {
                return res.status(403).json({ msg: 'Hanya Kasir yang dapat dinonaktifkan melalui endpoint ini.' });
            }
        }
        
        const user = result.rows[0];
        const action = is_active ? 'diaktifkan' : 'dinonaktifkan';

        res.status(200).json({ 
            msg: `Pengguna ${user.username} (ID: ${user.user_id}) berhasil ${action}.`, 
            user
        });
    } catch (error) {
        handlePostgresError(error, res, 'updateUserStatus');
    }
};

// Tambahkan fungsi CRUD lainnya (getUsers, createUser, dll.) di sini jika diperlukan.
// Contoh:
// export const getUsers = async (req, res) => { ... }