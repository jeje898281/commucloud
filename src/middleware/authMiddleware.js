// src/middleware/authMiddleware.js
const { verifyToken } = require('../utils/jwt');
const { UnauthorizedError, TokenNotFoundError } = require('../errors');

async function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header) throw new TokenNotFoundError();
    const token = header.replace('Bearer ', '');
    try {
        const payload = await verifyToken(token);
        req.user = payload;
        return next();
    } catch (err) {
        throw new UnauthorizedError();
    }
}

module.exports = authMiddleware;
