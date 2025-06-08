// src/routes/notificationRoutes.js
const router = require('express').Router();
const { handleNotifyMeeting } = require('../controllers/notificationController');

router.post('/meetings/:meetingId/notify', handleNotifyMeeting);

module.exports = router;
