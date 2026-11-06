// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

function signToken(payload, options = {}) {
    return jwt.sign(payload, SECRET, { expiresIn: '7d', ...options });
}

function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, SECRET, (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded);
        });
    });
}

module.exports = { signToken, verifyToken };
