// src/routes/notificationRoutes.js
const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { handleNotifyMeeting } = require('../controllers/notificationController');

// 管理者觸發：POST /api/meetings/:meetingId/notify
router.post(
    '/meetings/:meetingId/notify',
    authMiddleware,
    handleNotifyMeeting
);

module.exports = router;
