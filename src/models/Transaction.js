// src/models/Transaction.js

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    // --- Detail Item yang Dibeli ---
    items: [
        {
            bookId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Book', // Harus merujuk ke nama model Buku Anda
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            priceAtTimeOfSale: { // Harga saat transaksi terjadi (penting untuk histori)
                type: Number,
                required: true
            }
        }
    ],

    // --- Detail Transaksi ---
    totalAmount: { // Jumlah total yang dibayar
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Credit Card', 'E-Wallet'],
        required: true
    },
    cashierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Harus merujuk ke nama model User/Karyawan
        required: true
    },
    
    // --- Timestamp ---
    transactionDate: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true // Otomatis menambahkan createdAt dan updatedAt
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;