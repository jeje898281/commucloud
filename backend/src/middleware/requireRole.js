// src/middleware/requireRole.js
const { ForbiddenError } = require('../errors');

function requireRole(...allowedRoles) {
    return (req, _res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return next(new ForbiddenError());
        }
        return next();
    };
}

module.exports = requireRole;
