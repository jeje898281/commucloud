// src/middleware/rateLimiters.js
const rateLimit = require('express-rate-limit');

// Limit auth endpoints (login + register) to slow down brute-force / spam.
// 10 requests per 15 minutes per IP. Disabled under NODE_ENV=test.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    message: { code: 'RATE_LIMITED', message: 'Too many attempts, please try again later.' },
});

module.exports = { authLimiter };
