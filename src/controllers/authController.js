// src/controllers/authController.js
const { login, register } = require('../services/authService');

async function handleLogin(req, res, next) {
    try {
        const result = await login(req.body);
        return res.status(200).json(result);
    } catch (err) {
        return next(err);
    }
}

async function handleRegister(req, res, next) {
    try {
        const result = await register(req.body || {});
        return res.status(201).json(result);
    } catch (err) {
        return next(err);
    }
}

module.exports = { handleLogin, handleRegister };
