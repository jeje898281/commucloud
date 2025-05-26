const { checkin, getAttendanceSummary } = require('../services/meetingService');
const { generateBatchQRCodes } = require('../services/qrService');

async function handleCheckin(req, res) {
    try {
        const userId = req.user.userId;
        const { qrCode, meetingId, residentId } = req.body;
        const checkInRecord = await checkin({ qrCode, meetingId, residentId, userId });
        return res.status(201).json({ success: true, data: checkInRecord });
    } catch (err) {
        if (err.code === 'ALREADY_CHECKED_IN') {
            return res.status(409).json({ success: false, error: err.message });
        }
        console.error(err);
        return res.status(err.status || 400).json({ success: false, error: err.message });
    }
}

async function handleGetAttendanceSummary(req, res) {
    try {
        const meetingId = parseInt(req.params.meetingId, 10);
        const summary = await getAttendanceSummary(meetingId);
        res.status(200).json({
            success: true, data: summary
        });
    } catch (err) {
        res
            .status(err.status || 500)
            .json({ success: false, error: err.message });
    }
}

async function handleGenerateQRCodes(req, res) {
    try {
        const { meetingId, residentIds } = req.body;
        const data = await generateBatchQRCodes({ meetingId, residentIds });
        return res.json({
            success: true,
            data: data.map(item => ({
                residentId: item.residentId,
                qrDataURL: item.qrDataURL,
                token: item.token
            }))
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
}


module.exports = { handleCheckin, handleGetAttendanceSummary, handleGenerateQRCodes };
