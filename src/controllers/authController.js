// src/controllers/authController.js
const { login } = require('../services/authService');

async function handleLogin(req, res) {
    const { token, username, displayName, community, role } = await login(req.body);
    res.status(200).json({ token, username, displayName, community, role });
}

module.exports = { handleLogin };
