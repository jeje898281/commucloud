// src/routes/reportRoutes.js
const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { handleCheckin, handleGetAttendanceSummary } = require('../controllers/meetingController');

router.post('/checkin', authMiddleware, handleCheckin);
router.get('/summary/:meetingId', authMiddleware, handleGetAttendanceSummary);

module.exports = router;
