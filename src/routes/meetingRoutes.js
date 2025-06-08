// src/routes/reportRoutes.js
const router = require('express').Router();
const {
    handleCheckin, handleGetAttendanceSummary, handleGenerateQRCodes,
    handleListMeetings, handleGetMeeting, handleUpdateMeeting, handleCreateMeeting
} = require('../controllers/meetingController');

router.post('/checkin', handleCheckin);
router.get('/summary/:meetingId', handleGetAttendanceSummary);
router.post('/generate-qr-codes', handleGenerateQRCodes);
router.get('/', handleListMeetings);
router.get('/:id', handleGetMeeting);
router.patch('/', handleUpdateMeeting);
router.post('/', handleCreateMeeting);

module.exports = router;
