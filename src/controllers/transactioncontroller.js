import dbPool from '../config/pool.js';
import moment from 'moment-timezone';

// Konfigurasi Timezone untuk Jakarta
moment.tz.setDefault('Asia/Jakarta');

// Fungsi untuk menangani error spesifik PostgreSQL (Foreign Key)
const handlePostgresError = (error, res, action) => {
    console.error(`Error in ${action}:`, error);
    
    // Kode '23503' adalah Foreign Key Violation
    if (error.code === '23503') { 
        return res.status(400).json({ 
            msg: `Gagal: Terdapat ID yang tidak valid atau tidak ditemukan dalam tabel referensi (Foreign Key Violation).`,
            detail: error.detail || `Pastikan user_id, customer_id, atau product_id yang Anda gunakan sudah terdaftar.`
        });
    }
    
    // Kode '22P02' adalah Invalid Text Representation (misalnya, mencoba memasukkan string ke kolom INT)
    if (error.code === '22P02') { 
        return res.status(400).json({ 
            msg: `Gagal: Kesalahan format data. Pastikan semua ID dan jumlah (amount/quantity) adalah angka yang valid.`,
            detail: error.detail || `Kesalahan representasi teks/data.`
        });
    }

    // Error kustom yang dilempar dari logic (misalnya, stok habis)
    if (error.message && (error.message.includes('not found') || error.message.includes('Insufficient stock'))) {
        return res.status(400).json({ msg: error.message });
    }
    
    // Error 500 generik untuk kasus lain
    res.status(500).json({ msg: 'Internal Server Error', error: error.message });
};


// ===============================================
// 1. GET ALL TRANSACTIONS
// ===============================================
export const getTransactions = async (req, res) => {
    try {
        const query = 'SELECT * FROM transactions ORDER BY created_at DESC';
        const result = await dbPool.query(query);
        
        // Format tanggal agar lebih mudah dibaca
        const transactions = result.rows.map(t => ({
            ...t,
            created_at: moment(t.created_at).format('YYYY-MM-DD HH:mm:ss')
        }));

        res.status(200).json({
            message: "Daftar semua transaksi berhasil diambil.",
            total: transactions.length,
            transactions: transactions
        });
    } catch (error) {
        handlePostgresError(error, res, 'getTransactions');
    }
};

// ===============================================
// 2. GET TRANSACTION BY ID
// ===============================================
export const getTransactionById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT * FROM transactions WHERE transaction_id = $1';
        const result = await dbPool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Transaction not found' });
        }

        const transaction = result.rows[0];
        
        // Format tanggal
        transaction.created_at = moment(transaction.created_at).format('YYYY-MM-DD HH:mm:ss');
        
        res.status(200).json({
            message: "Detail transaksi berhasil diambil.",
            transaction: transaction
        });
    } catch (error) {
        handlePostgresError(error, res, 'getTransactionById');
    }
};

// ===============================================
// 3. CREATE NEW TRANSACTION
// ===============================================
export const createTransaction = async (req, res) => {
    const { user_id, customer_id, details } = req.body; 
    const client = await dbPool.connect();
    
    // Validasi input
    if (!user_id || !details || details.length === 0) {
        return res.status(400).json({ msg: "User ID dan detail transaksi wajib diisi." });
    }

    try {
        await client.query('BEGIN'); 

        // Cek stok produk dan hitung total_amount dari details
        let calculatedTotal = 0;
        
        for (const item of details) {
            if (!item.product_id || !item.quantity || item.quantity <= 0) {
                 throw new Error("Detail transaksi harus menyertakan product_id dan quantity (>0).");
            }
            
            const productQuery = 'SELECT price, stock FROM product WHERE product_id = $1 FOR UPDATE';
            const productResult = await client.query(productQuery, [item.product_id]);

            if (productResult.rows.length === 0) {
                throw new Error(`Product with ID ${item.product_id} not found.`);
            }

            const product = productResult.rows[0];
            
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product ID ${item.product_id}. Available: ${product.stock}, Requested: ${item.quantity}`);
            }

            const subtotal = product.price * item.quantity;
            calculatedTotal += subtotal;
            
            const newStock = product.stock - item.quantity;
            const updateStockQuery = 'UPDATE product SET stock = $1 WHERE product_id = $2';
            await client.query(updateStockQuery, [newStock, item.product_id]);
        }
        
        // Masukkan data transaksi utama
        const insertTransactionQuery = `
            INSERT INTO transactions (user_id, customer_id, total_amount, created_at)
            VALUES ($1, $2, $3, NOW()) RETURNING transaction_id
        `;
        const transactionResult = await client.query(insertTransactionQuery, [user_id, customer_id || null, calculatedTotal]);
        const transactionId = transactionResult.rows[0].transaction_id;
        
        // Masukkan detail transaksi
        for (const item of details) {
            const productQuery = 'SELECT price FROM product WHERE product_id = $1';
            const productResult = await client.query(productQuery, [item.product_id]);
            const price = productResult.rows[0].price;

            const insertDetailQuery = `
                INSERT INTO transactions_items (transaction_id, product_id, quantity, price_at_sale)
                VALUES ($1, $2, $3, $4)
            `;
            await client.query(insertDetailQuery, [
                transactionId, 
                item.product_id, 
                item.quantity, 
                price 
            ]);
        }

        await client.query('COMMIT'); 
        res.status(201).json({ 
            msg: 'Transaction created successfully', 
            transaction_id: transactionId,
            total_amount: calculatedTotal,
            user_id: user_id
        });

    } catch (error) {
        await client.query('ROLLBACK'); 
        handlePostgresError(error, res, 'createTransaction');
    } finally {
        client.release();
    }
};

// ===============================================
// 4. UPDATE TRANSACTION (Metadata Only)
// ===============================================
export const updateTransaction = async (req, res) => {
    const { id } = req.params;
    let { user_id, customer_id, total_amount } = req.body;
    
    // 1. Validasi ID
    user_id = (user_id === 0 || user_id) ? parseInt(user_id) : null;
    customer_id = (customer_id === 0 || customer_id) ? parseInt(customer_id) : null;

    if (user_id !== null && isNaN(user_id)) {
        return res.status(400).json({ msg: "user_id harus berupa angka (integer) valid." });
    }
    if (customer_id !== null && isNaN(customer_id)) {
        return res.status(400).json({ msg: "customer_id harus berupa angka (integer) valid." });
    }

    // 2. Validasi Total Amount
    total_amount = (total_amount === 0 || total_amount) ? parseFloat(total_amount) : null;
    
    if (total_amount !== null && isNaN(total_amount)) {
        return res.status(400).json({ msg: "total_amount harus berupa angka (float) valid." });
    }
    
    try {
        const updateQuery = `
            UPDATE transactions 
            SET user_id = COALESCE($1, user_id), 
                customer_id = COALESCE($2, customer_id),
                total_amount = COALESCE($3, total_amount)
            WHERE transaction_id = $4 RETURNING *
        `;
        // HILANGKAN: , updated_at = NOW()
        const result = await dbPool.query(updateQuery, [user_id, customer_id, total_amount, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Transaction not found' });
        }

        const transaction = result.rows[0];
        // Format tanggal
        transaction.created_at = moment(transaction.created_at).format('YYYY-MM-DD HH:mm:ss');
        // HILANGKAN: transaction.updated_at
        
        res.status(200).json({ msg: 'Transaction updated successfully (Metadata)', transaction });
    } catch (error) {
        handlePostgresError(error, res, 'updateTransaction');
    }
};

// ===============================================
// 4.1. ADD ITEMS TO TRANSACTION 
// ===============================================
export const updateTransactionItems = async (req, res) => {
    const { id } = req.params; // transaction_id
    const { details_to_add } = req.body; 

    const client = await dbPool.connect();

    if (!details_to_add || details_to_add.length === 0) {
        return res.status(400).json({ msg: "Details to add are required." });
    }

    try {
        await client.query('BEGIN'); 
        
        // 1. Ambil transaksi utama dan total saat ini (FOR UPDATE)
        const transactionQuery = 'SELECT total_amount FROM transactions WHERE transaction_id = $1 FOR UPDATE';
        const transactionResult = await client.query(transactionQuery, [id]);

        if (transactionResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ msg: 'Transaction not found' });
        }
        
        let currentTotal = parseFloat(transactionResult.rows[0].total_amount);
        let itemsAdded = [];
        let newTotalAmount = currentTotal;

        // 2. Proses item yang ditambahkan
        for (const item of details_to_add) {
            const productId = parseInt(item.product_id);
            const quantity = parseInt(item.quantity);

            if (isNaN(productId) || isNaN(quantity) || quantity <= 0) {
                 throw new Error("product_id dan quantity harus berupa angka (>0) yang valid.");
            }
            
            // a. Ambil data produk (harga dan stok)
            const productQuery = 'SELECT price, stock FROM product WHERE product_id = $1 FOR UPDATE';
            const productResult = await client.query(productQuery, [productId]);

            if (productResult.rows.length === 0) {
                throw new Error(`Product with ID ${productId} not found.`);
            }

            const product = productResult.rows[0];
            
            // b. Validasi stok
            if (product.stock < quantity) {
                throw new Error(`Insufficient stock for product ID ${productId}. Available: ${product.stock}, Requested: ${quantity}`);
            }

            // c. Hitung subtotal
            const subtotal = product.price * quantity;
            newTotalAmount += subtotal;
            
            // d. Update stok (kurangi)
            const newStock = product.stock - quantity;
            const updateStockQuery = 'UPDATE product SET stock = $1 WHERE product_id = $2';
            await client.query(updateStockQuery, [newStock, productId]);
        
            // e. Masukkan detail transaksi baru
            const insertDetailQuery = `
                INSERT INTO transactions_items (transaction_id, product_id, quantity, price_at_sale)
                VALUES ($1, $2, $3, $4)
            `;
            await client.query(insertDetailQuery, [
                id, 
                productId, 
                quantity, 
                product.price 
            ]);
            
            itemsAdded.push({ product_id: productId, quantity: quantity, price_at_sale: product.price });
        }
        
        // 3. Update total_amount pada transaksi utama
        const updateTransactionQuery = `
            UPDATE transactions 
            SET total_amount = $1
            WHERE transaction_id = $2 RETURNING *
        `;
        // HILANGKAN: , updated_at = NOW()
        const updatedTransactionResult = await client.query(updateTransactionQuery, [newTotalAmount, id]);

        await client.query('COMMIT'); 

        const updatedTransaction = updatedTransactionResult.rows[0];
        // Format tanggal
        updatedTransaction.created_at = moment(updatedTransaction.created_at).format('YYYY-MM-DD HH:mm:ss');
        // HILANGKAN: updatedTransaction.updated_at
        
        res.status(200).json({ 
            msg: 'Items added and transaction updated successfully', 
            transaction: updatedTransaction,
            items_added: itemsAdded
        });

    } catch (error) {
        await client.query('ROLLBACK'); 
        handlePostgresError(error, res, 'updateTransactionItems');
    } finally {
        client.release();
    }
};

// ===============================================
// 5. DELETE TRANSACTION
// ===============================================
export const deleteTransaction = async (req, res) => {
    const { id } = req.params;
    const client = await dbPool.connect();

    try {
        await client.query('BEGIN'); 
        
        // 1. Ambil detail transaksi yang akan dihapus
        const detailsQuery = 'SELECT product_id, quantity FROM transactions_items WHERE transaction_id = $1';
        const detailsResult = await client.query(detailsQuery, [id]);
        
        if (detailsResult.rows.length === 0) {
            // Cek apakah transaksi ada
            const checkQuery = 'SELECT transaction_id FROM transactions WHERE transaction_id = $1';
            const checkResult = await client.query(checkQuery, [id]);
            if (checkResult.rows.length === 0) {
                 await client.query('ROLLBACK');
                 return res.status(404).json({ msg: 'Transaction not found' });
            }
        }
        
        // 2. Kembalikan stok produk
        for (const detail of detailsResult.rows) {
            const updateStockQuery = 'UPDATE product SET stock = stock + $1 WHERE product_id = $2';
            await client.query(updateStockQuery, [detail.quantity, detail.product_id]);
        }

        // 3. Hapus detail transaksi
        const deleteDetailsQuery = 'DELETE FROM transactions_items WHERE transaction_id = $1';
        await client.query(deleteDetailsQuery, [id]);

        // 4. Hapus transaksi utama
        const deleteTransactionQuery = 'DELETE FROM transactions WHERE transaction_id = $1 RETURNING transaction_id';
        const deleteResult = await dbPool.query(deleteTransactionQuery, [id]);

        if (deleteResult.rows.length === 0) {
            throw new Error('Transaction not found during deletion');
        }

        await client.query('COMMIT'); 
        res.status(200).json({ msg: 'Transaction deleted successfully, and stock restored.' });
    } catch (error) {
        await client.query('ROLLBACK'); 
        handlePostgresError(error, res, 'deleteTransaction');
    } finally {
        client.release();
    }
};