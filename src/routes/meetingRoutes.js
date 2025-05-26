// src/routes/reportRoutes.js
const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    handleCheckin, handleGetAttendanceSummary, handleGenerateQRCodes
} = require('../controllers/meetingController');

router.post('/checkin', authMiddleware, handleCheckin);
router.get('/summary/:meetingId', authMiddleware, handleGetAttendanceSummary);
router.post('/generate-qr-codes', authMiddleware, handleGenerateQRCodes);

module.exports = router;
