// src/controllers/authController.js
const { login } = require('../services/authService');

async function handleLogin(req, res) {
    try {
        const { token, username, displayName, community, role } = await login(req.body);
        res.json({ token, username, displayName, community, role });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
}

module.exports = { handleLogin };
