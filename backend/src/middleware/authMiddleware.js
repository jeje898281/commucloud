// src/middleware/authMiddleware.js
const { verifyToken } = require('../utils/jwt');
const { UnauthorizedError, TokenNotFoundError } = require('../errors');

async function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header) throw new TokenNotFoundError();
    const token = header.replace('Bearer ', '');
    let payload;
    try {
        payload = await verifyToken(token);
    } catch (err) {
        throw new UnauthorizedError();
    }
    // Handlers scope every query by these claims, so a token without them is rejected
    // here rather than reaching a query with an undefined community filter.
    if (!Number.isInteger(payload.userId) || !Number.isInteger(payload.communityId) || !payload.role) {
        throw new UnauthorizedError();
    }
    req.user = payload;
    return next();
}

module.exports = authMiddleware;
