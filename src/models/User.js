// src/models/User.js

const mongoose = require('mongoose');
// Catatan: Anda perlu menginstal bcryptjs: npm install bcryptjs
const bcrypt = require('bcryptjs'); 

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Cashier'], // Sesuai Use Case Diagram
        default: 'Cashier',
        required: true
    },
    isActive: { // Untuk fitur Deactivate User
        type: Boolean,
        default: true 
    }
}, {
    timestamps: true
});

// Middleware Mongoose: Hash password sebelum disimpan
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Metode untuk membandingkan password saat login
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;