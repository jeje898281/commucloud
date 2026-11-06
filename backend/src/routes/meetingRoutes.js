// src/routes/reportRoutes.js
const router = require('express').Router();
const {
    handleCheckin, handleGetAttendanceSummary, handleGetAttendanceRecords, handleGenerateQRCodes,
    handleListMeetings, handleGetMeeting, handleUpdateMeeting, handleCreateMeeting
} = require('../controllers/meetingController');
const requireRole = require('../middleware/requireRole');

router.post('/checkin', handleCheckin);
router.get('/summary/:meetingId', handleGetAttendanceSummary);
router.get('/records/:meetingId', handleGetAttendanceRecords);
router.post('/generate-qr-codes', requireRole('admin', 'manager'), handleGenerateQRCodes);
router.get('/', handleListMeetings);
router.get('/:id', handleGetMeeting);
router.patch('/', requireRole('admin', 'manager'), handleUpdateMeeting);
router.post('/', requireRole('admin', 'manager'), handleCreateMeeting);

module.exports = router;
