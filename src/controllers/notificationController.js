// src/controllers/notificationController.js
const { sendMeetingNotifications } = require('../services/notificationService');

async function handleNotifyMeeting(req, res) {
    try {
        const meetingId = parseInt(req.params.meetingId, 10);
        const result = await sendMeetingNotifications(meetingId);
        res.json({ success: true, queued: result.queued });
    } catch (err) {
        res
            .status(err.status || 500)
            .json({ success: false, error: err.message });
    }
}

module.exports = { handleNotifyMeeting };
