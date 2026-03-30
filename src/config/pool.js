import pg from 'pg';
import 'dotenv/config'; 

const { Pool } = pg;

// Ambil variabel lingkungan dari .env
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
};

// Buat pool koneksi
const dbPool = new Pool(dbConfig);

// Ekspor pool untuk digunakan di semua Controller
export default dbPool;