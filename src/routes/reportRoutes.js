// src/routes/reportRoutes.js
const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { handleCheckin } = require('../controllers/reportController');

// 只要呼叫 /api/checkin，一律要先通過 JWT 驗證
router.post('/checkin', authMiddleware, handleCheckin);

module.exports = router;
