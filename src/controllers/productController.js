import dbPool from '../config/pool.js'; // Asumsi path ini benar

// ===============================================
// 1. GET ALL PRODUCTS (GET /products) - Skenario 5 & 31
// ===============================================
// AKSES: Publik (semua bisa melihat daftar produk)
export const getAllProducts = async (req, res) => {
    try {
        // PERBAIKAN: Mengganti 'name' menjadi 'product_name'
        const sql = `
            SELECT 
                product_id, 
                product_name, 
                description, 
                price, 
                stock, 
                category_id,
                created_at,
                updated_at 
            FROM product 
            ORDER BY product_id DESC
        `;
        const result = await dbPool.query(sql);

        return res.status(200).json({
            message: "Daftar semua produk berhasil diambil.",
            total: result.rows.length,
            products: result.rows
        });
    } catch (error) {
        console.error('Error saat mengambil semua produk:', error);
        return res.status(500).json({ 
            message: 'Kesalahan server saat mengambil produk.', 
            error: error.message 
        });
    }
};

// ===============================================
// 2. GET PRODUCT BY ID (GET /products/:id) - Skenario 19
// ===============================================
// AKSES: Publik (semua bisa melihat detail produk)
export const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        // PERBAIKAN: Mengganti 'name' menjadi 'product_name'
        const sql = `
            SELECT 
                product_id, 
                product_name, 
                description, 
                price, 
                stock, 
                category_id,
                created_at,
                updated_at 
            FROM product 
            WHERE product_id = $1
        `;
        const result = await dbPool.query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan.' });
        }

        return res.status(200).json({
            message: "Detail produk berhasil diambil.",
            product: result.rows[0]
        });
    } catch (error) {
        console.error('Error saat mengambil produk berdasarkan ID:', error);
        return res.status(500).json({ 
            message: 'Kesalahan server saat mengambil detail produk.', 
            error: error.message 
        });
    }
};

// ===============================================
// 3. CREATE PRODUCT (POST /products) - Skenario 17
// ===============================================
// AKSES: Admin (hanya Admin yang bisa membuat produk)
export const createProduct = async (req, res) => {
    // PERBAIKAN: Mengganti 'name' menjadi 'product_name'
    const { product_name, description, price, stock, category_id } = req.body;

    // Validasi dasar
    if (!product_name || !price || price <= 0 || stock === undefined || stock < 0 || !category_id) {
        return res.status(400).json({ message: "Nama produk, harga (>0), stok (>=0), dan ID kategori wajib diisi." });
    }

    try {
        // Query untuk INSERT data produk
        // PERBAIKAN: Mengganti 'name' menjadi 'product_name' dan menambahkan created_at/updated_at
        const sql = `
            INSERT INTO product (product_name, description, price, stock, category_id, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
            RETURNING product_id, product_name, description, price, stock, category_id, created_at
        `;
        const result = await dbPool.query(sql, [product_name, description || null, price, stock, category_id]);

        return res.status(201).json({ 
            message: "Produk berhasil dibuat.", 
            product: result.rows[0] 
        });

    } catch (error) {
        console.error('Error saat membuat produk:', error);
        // Tangani jika category_id tidak ditemukan (Foreign Key Constraint)
        if (error.code === '23503') { // PostgreSQL Foreign Key Error Code
             return res.status(400).json({ 
                 message: 'Gagal membuat produk. Kategori tidak valid atau tidak ditemukan.',
                 error: error.message
             });
        }
        return res.status(500).json({ 
            message: 'Kesalahan server saat membuat produk.', 
            error: error.message 
        });
    }
};

// ===============================================
// 4. UPDATE PRODUCT (PUT /products/:id) - Skenario 18
// ===============================================
// AKSES: Admin (hanya Admin yang bisa memperbarui produk)
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    // PERBAIKAN: Mengganti 'name' menjadi 'product_name'
    const { product_name, description, price, stock, category_id } = req.body;

    // Validasi dasar minimal
    if (!product_name && !description && !price && stock === undefined && !category_id) {
        return res.status(400).json({ message: "Setidaknya satu field harus diisi untuk pembaruan." });
    }
    if (price !== undefined && price <= 0) {
        return res.status(400).json({ message: "Harga harus lebih besar dari 0." });
    }
    if (stock !== undefined && stock < 0) {
        return res.status(400).json({ message: "Stok tidak boleh kurang dari 0." });
    }

    try {
        // PERBAIKAN: Mengganti 'name' menjadi 'product_name' dan menambahkan updated_at
        const result = await dbPool.query(
            `UPDATE product 
             SET 
                product_name = COALESCE($1, product_name), 
                description = COALESCE($2, description), 
                price = COALESCE($3, price), 
                stock = COALESCE($4, stock), 
                category_id = COALESCE($5, category_id),
                updated_at = NOW()
             WHERE product_id = $6 
             RETURNING *`,
            [product_name, description, price, stock, category_id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan.' });
        }

        return res.status(200).json({
            message: "Produk berhasil diperbarui.",
            product: result.rows[0]
        });
    } catch (error) {
        console.error('Error saat memperbarui produk:', error);
        // Tangani Foreign Key Constraint (Category ID tidak valid)
        if (error.code === '23503') {
             return res.status(400).json({ 
                 message: 'Gagal memperbarui produk. Kategori tidak valid atau tidak ditemukan.',
                 error: error.message
             });
        }
        return res.status(500).json({ message: 'Kesalahan server saat memperbarui produk.', error: error.message });
    }
};

// ===============================================
// 5. DELETE PRODUCT (DELETE /products/:id) - Skenario 6 & 27
// ===============================================
// AKSES: Admin (hanya Admin yang bisa menghapus produk)
export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await dbPool.query('DELETE FROM product WHERE product_id = $1 RETURNING product_id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan.' });
        }
        
        return res.status(200).json({
            message: `Produk dengan ID ${id} berhasil dihapus.`,
            deletedId: id
        });

    } catch (error) {
        console.error('Error saat menghapus produk:', error);
        // Tangani Foreign Key Constraint (Skenario 27) - misal: terikat pada transaksi
        if (error.code === '23503') { // PostgreSQL Foreign Key Error Code
             return res.status(400).json({ 
                 message: 'Gagal menghapus produk. Produk ini masih terikat pada transaksi atau data lain.',
                 error: error.message
             });
        }
        return res.status(500).json({ message: 'Kesalahan server saat menghapus produk.', error: error.message });
    }
};