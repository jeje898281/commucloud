// src/middleware/authMiddleware.js
const { verifyToken } = require('../utils/jwt');

async function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No token' });
    const token = header.replace('Bearer ', '');
    try {
        const payload = await verifyToken(token);
        req.user = payload;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

module.exports = authMiddleware;
