import jwt from 'jsonwebtoken';

// Dapatkan secret key dari variabel lingkungan
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_default_access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_default_refresh_secret';

// Waktu kedaluwarsa
const ACCESS_TOKEN_EXPIRY = '168h'; // 15 Menit
const REFRESH_TOKEN_EXPIRY = '30d';  // 7 Hari

/**
 * Membuat Access Token JWT.
 * @param {object} user - Objek user yang mengandung id, username, dan role.
 * @returns {string} Access Token.
 */
export const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

/**
 * Membuat Refresh Token JWT.
 * @param {object} user - Objek user yang mengandung id dan username.
 * @returns {string} Refresh Token.
 */
export const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
};