// src/controllers/notificationController.js
const {
    sendMeetingNotifications,
    buildMeetingNotificationPreview,
} = require('../services/notificationService');

async function handleNotifyMeeting(req, res) {
    try {
        const meetingId = parseInt(req.params.meetingId, 10);
        const { subject, text, recipientIds } = req.body || {};
        const result = await sendMeetingNotifications(meetingId, { subject, text, recipientIds });
        res.json({ success: true, queued: result.queued });
    } catch (err) {
        res
            .status(err.status || 500)
            .json({ success: false, error: err.message });
    }
}

async function handleNotifyMeetingPreview(req, res) {
    try {
        const meetingId = parseInt(req.params.meetingId, 10);
        const preview = await buildMeetingNotificationPreview(meetingId);
        res.json({ success: true, data: preview });
    } catch (err) {
        res
            .status(err.status || 500)
            .json({ success: false, error: err.message });
    }
}

module.exports = { handleNotifyMeeting, handleNotifyMeetingPreview };
