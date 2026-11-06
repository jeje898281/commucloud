// src/routes/authRoutes.js
const router = require('express').Router();
const { handleLogin, handleRegister, handleDemoLogin } = require('../controllers/authController');

router.post('/login', handleLogin);
router.post('/register', handleRegister);
router.get('/demo-login', handleDemoLogin);

module.exports = router;
