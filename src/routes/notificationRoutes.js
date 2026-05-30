// src/routes/notificationRoutes.js
const router = require('express').Router();
const {
    handleNotifyMeeting,
    handleNotifyMeetingPreview,
} = require('../controllers/notificationController');

router.get('/meetings/:meetingId/notify/preview', handleNotifyMeetingPreview);
router.post('/meetings/:meetingId/notify', handleNotifyMeeting);

module.exports = router;
