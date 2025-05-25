// src/routes/reportRoutes.js
const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { handleCheckin } = require('../controllers/meetingController');

router.post('/checkin', authMiddleware, handleCheckin);

module.exports = router;
