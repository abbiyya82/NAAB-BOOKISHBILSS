// src/middleware/role.js

exports.checkRole = (requiredRole) => {
    return (req, res, next) => {
        // req.user datang dari authMiddleware (berisi role user)
        if (!req.user || req.user.role !== requiredRole) {
            return res.status(403).json({ message: `Akses terlarang: Membutuhkan peran ${requiredRole}` });
        }
        next();
    };
};