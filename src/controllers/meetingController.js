const { checkin } = require('../services/meetingService');

async function handleCheckin(req, res) {
    try {
        const { meetingId, residentId, isManual = false } = req.body;
        const userId = req.user.userId;

        const record = await checkin({ meetingId, residentId, userId, isManual });

        res.status(201).json({
            success: true,
            data: record
        });
    } catch (err) {
        if (err.code === 'ALREADY_CHECKED_IN') {
            return res.status(409).json({ success: false, error: err.message });
        }
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
}

module.exports = { handleCheckin };
