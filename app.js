// app.js

// ===========================================
// 1. MUAT VARIABEL LINGKUNGAN (Wajib Paling Atas)
// ===========================================
import 'dotenv/config'; // Cara import dotenv di ES Modules

// ===========================================
// 2. IMPORT MODUL INTI
// ===========================================
import express from 'express';
import cors from 'cors'; 
// Modul SwaggerJsdoc dan SwaggerUi telah dihapus.

const app = express();
const PORT = process.env.PORT || 3000;

// Import database pool
import dbPool from './src/config/pool.js'; 

// Import routes
import authRoutes from './src/routes/authroutes.js'; 
import userRoutes from './src/routes/userroutes.js';
import categoryRoutes from './src/routes/categoryroutes.js';
import productRoutes from './src/routes/productroutes.js'; 
import transactionRoutes from './src/routes/transactionroutes.js';


// ===========================================
// 3. KONFIGURASI SWAGGER (DIHAPUS)
// ===========================================
// Semua konfigurasi SwaggerJsdoc telah dihapus dari sini.


// ===========================================
// 4. MIDDLEWARE UTAMA
// ===========================================
app.use(cors());
app.use(express.json()); // Menggantikan bodyParser
app.use(express.urlencoded({ extended: true }));


// ===========================================
// 5. DAFTARKAN ROUTES
// ===========================================

app.get('/', (req, res) => {
    // Pesan sambutan diubah karena dokumentasi Swagger dihapus.
    res.send('Welcome to the Simple POS API!'); 
});

// Pendaftaran Swagger UI (Endpoint Dokumentasi) telah dihapus

// Pendaftaran Routes spesifik
app.use('/auth', authRoutes); 
app.use('/users', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/transactions', transactionRoutes);


// ===========================================
// 6. TEST KONEKSI DATABASE
// ===========================================
// Menghindari koneksi database jika testing (opsional)
if (process.env.NODE_ENV !== 'test') {
    dbPool.query('SELECT 1+1 AS result')
        .then(results => {
            console.log('✅ Berhasil terhubung ke PostgreSQL!');
        })
        .catch(err => {
            console.error('❌ Koneksi Database Gagal:', err);
        });
}


// ===========================================
// 7. START SERVER
// ===========================================
app.listen(PORT, () => {
    console.log(`Server berjalan pada http://localhost:${PORT}`);
});