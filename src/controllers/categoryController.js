import dbPool from '../config/pool.js'; 

// ===============================================
// FUNGSI CONTROLLER KATEGORI
// ===============================================

/**
 * @route GET /categories
 * @desc Mengambil semua data kategori (Akses: Publik/Semua)
 */
export const getAllCategories = async (req, res) => {
    // Logika ini AMAN dan TIDAK BERUBAH.
    const client = await dbPool.connect();
    try {
        const sql = 'SELECT * FROM categories ORDER BY category_id ASC'; 
        const result = await client.query(sql);

        res.status(200).json({
            message: 'Successfully retrieved all categories.',
            total: result.rowCount,
            data: result.rows 
        });

    } catch (error) {
        console.error("Error in getAllCategories:", error.message);
        res.status(500).json({
            message: "Internal Server Error during fetching categories.",
            error: error.message
        });
    } finally {
        client.release();
    }
};

/**
 * @route GET /categories/:id
 * @desc Mengambil kategori berdasarkan ID (Akses: Publik/Semua)
 */
export const getCategoryById = async (req, res) => {
    // --- LOGIKA IMPLEMENTASI getCategoryById ---
    const { id } = req.params; // Ambil ID dari URL parameter
    const client = await dbPool.connect();

    // Validasi dasar untuk memastikan ID adalah angka, meskipun Postgres akan menangani konversi.
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: 'Invalid category ID format.' });
    }

    try {
        // SQL menggunakan parameterized query untuk mencegah SQL Injection
        const sql = 'SELECT * FROM categories WHERE category_id = $1';
        const result = await client.query(sql, [id]);

        if (result.rowCount === 0) {
            // Jika ID tidak ditemukan, kembalikan 404 Not Found
            return res.status(404).json({ message: 'Category not found.' });
        }

        // Kembalikan data kategori 200 OK
        res.status(200).json({
            message: `Successfully retrieved category with ID ${id}.`,
            data: result.rows[0]
        });

    } catch (error) {
        console.error(`Error in getCategoryById for ID ${id}:`, error.message);
        res.status(500).json({
            message: "Internal Server Error during fetching category by ID.",
            error: error.message
        });
    } finally {
        client.release();
    }
    // --- AKHIR LOGIKA IMPLEMENTASI ---
};

/**
 * @route POST /categories
 * @desc Membuat kategori baru (Akses: Admin)
 */
export const createCategory = async (req, res) => {
    // --- LOGIKA IMPLEMENTASI createCategory ---
    const { category_name } = req.body; // Asumsikan kita hanya menerima category_name
    const client = await dbPool.connect();

    // 1. Validasi Input
    if (!category_name || category_name.trim() === '') {
        return res.status(400).json({ message: 'Category name is required.' });
    }

    try {
        // 2. Cek apakah kategori sudah ada (Pencegahan duplikasi)
        const checkSql = 'SELECT * FROM categories WHERE category_name = $1';
        const checkResult = await client.query(checkSql, [category_name]);

        if (checkResult.rowCount > 0) {
            return res.status(409).json({ message: 'Category name already exists.' }); // 409 Conflict
        }
        
        // 3. Masukkan data baru ke database
        const insertSql = `
            INSERT INTO categories (category_name, created_at, updated_at) 
            VALUES ($1, NOW(), NOW()) 
            RETURNING *;`; // RETURNING * untuk mendapatkan data yang baru dibuat
            
        const result = await client.query(insertSql, [category_name]);

        // 4. Kirim respons sukses 201 Created
        res.status(201).json({
            message: 'Category successfully created.',
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Error in createCategory:", error.message);
        res.status(500).json({
            message: "Internal Server Error during category creation.",
            error: error.message
        });
    } finally {
        client.release();
    }
    // --- AKHIR LOGIKA IMPLEMENTASI ---
};

/**
 * @route PUT /categories/:id
 * @desc Memperbarui kategori (Akses: Admin)
 */
export const updateCategory = async (req, res) => {
    // --- LOGIKA IMPLEMENTASI updateCategory ---
    const { id } = req.params;
    const { category_name } = req.body; 
    const client = await dbPool.connect();

    // 1. Validasi Input
    if (!category_name || category_name.trim() === '') {
        return res.status(400).json({ message: 'Category name is required for update.' });
    }
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: 'Invalid category ID format.' });
    }

    try {
        // 2. Cek apakah ID kategori ada
        const checkExistSql = 'SELECT category_id FROM categories WHERE category_id = $1';
        const checkExistResult = await client.query(checkExistSql, [id]);

        if (checkExistResult.rowCount === 0) {
            return res.status(404).json({ message: 'Category not found for update.' });
        }
        
        // 3. Cek apakah nama kategori baru sudah ada di kategori lain
        const checkDuplicateSql = 'SELECT category_id FROM categories WHERE category_name = $1 AND category_id != $2';
        const checkDuplicateResult = await client.query(checkDuplicateSql, [category_name, id]);
        
        if (checkDuplicateResult.rowCount > 0) {
            return res.status(409).json({ message: 'Category name already exists in another category.' });
        }

        // 4. Lakukan pembaruan data
        const updateSql = `
            UPDATE categories 
            SET category_name = $1, updated_at = NOW() 
            WHERE category_id = $2
            RETURNING *;`; 
            
        const result = await client.query(updateSql, [category_name, id]);

        // 5. Kirim respons sukses 200 OK
        res.status(200).json({
            message: `Category with ID ${id} successfully updated.`,
            data: result.rows[0]
        });

    } catch (error) {
        console.error(`Error in updateCategory for ID ${id}:`, error.message);
        res.status(500).json({
            message: "Internal Server Error during category update.",
            error: error.message
        });
    } finally {
        client.release();
    }
    // --- AKHIR LOGIKA IMPLEMENTASI ---
};

/**
 * @route DELETE /categories/:id
 * @desc Menghapus kategori (Akses: Admin)
 */
export const deleteCategory = async (req, res) => {
    // --- LOGIKA IMPLEMENTASI deleteCategory ---
    const { id } = req.params;
    const client = await dbPool.connect();

    // 1. Validasi ID
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: 'Invalid category ID format.' });
    }

    try {
        // Catatan: Jika ada product yang merujuk category_id ini,
        // PostgreSQL akan mengembalikan error Foreign Key Constraint Violation.
        // Penanganan error ini (misalnya: 409 Conflict) dapat ditambahkan di sini.

        // 2. Lakukan penghapusan
        const deleteSql = 'DELETE FROM categories WHERE category_id = $1 RETURNING *;';
        const result = await client.query(deleteSql, [id]);

        // 3. Cek apakah ada baris yang terpengaruh (dihapus)
        if (result.rowCount === 0) {
            // Jika tidak ada baris yang dihapus, berarti kategori tidak ditemukan
            return res.status(404).json({ message: 'Category not found for deletion.' });
        }

        // 4. Kirim respons sukses 200 OK (biasanya 204 No Content untuk DELETE, tapi 200 juga sering digunakan)
        // Kita kirim 200 dengan data kategori yang baru saja dihapus
        res.status(200).json({
            message: `Category with ID ${id} successfully deleted.`,
            data: result.rows[0] // Mengembalikan data yang dihapus (dari RETURNING *)
        });

    } catch (error) {
        if (error.code === '23503') { // PostgreSQL error code for Foreign Key Violation
             return res.status(409).json({
                message: "Cannot delete category. Products are still associated with this category.",
                error: error.message
            });
        }
        
        console.error(`Error in deleteCategory for ID ${id}:`, error.message);
        res.status(500).json({
            message: "Internal Server Error during category deletion.",
            error: error.message
        });
    } finally {
        client.release();
    }
    // --- AKHIR LOGIKA IMPLEMENTASI ---
};

// Tidak perlu default export karena semua fungsi di-export sebagai named exports