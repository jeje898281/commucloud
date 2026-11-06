// src/routes/notificationRoutes.js
const router = require('express').Router();
const {
    handleNotifyMeeting,
    handleNotifyMeetingPreview,
} = require('../controllers/notificationController');
const requireRole = require('../middleware/requireRole');

router.get('/meetings/:meetingId/notify/preview', requireRole('admin', 'manager'), handleNotifyMeetingPreview);
router.post('/meetings/:meetingId/notify', requireRole('admin', 'manager'), handleNotifyMeeting);

module.exports = router;
