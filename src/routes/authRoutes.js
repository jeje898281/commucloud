// src/routes/authRoutes.js
const router = require('express').Router();
const { handleLogin } = require('../controllers/authController');

router.post('/login', handleLogin);

module.exports = router;
