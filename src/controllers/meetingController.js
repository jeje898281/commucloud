const { checkin, getAttendanceSummary, listMeetingsByAdminUser, getMeetingDetail, updateMeetingDetail } = require('../services/meetingService');
const { generateBatchQRCodes, getResidentIdsByMeetingId } = require('../services/qrService');

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

async function handleListMeetings(req, res) {
    try {
        const adminUserId = req.user.userId;
        const meetings = await listMeetingsByAdminUser(adminUserId);
        res.json({ success: true, data: meetings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
}

async function handleGetMeeting(req, res) {
    try {
        const meeting = await getMeetingDetail(req.user.userId, + req.params.id);
        res.json({ success: true, data: meeting });
    } catch (err) {
        const code = /not found/i.test(err.message) ? 404 : 403;
        res.status(code).json({ success: false, error: err.message });
    }
}

async function handleUpdateMeeting(req, res) {
    try {
        const { id: meetingId, ...updateData } = req.body;

        if (!meetingId || isNaN(parseInt(meetingId))) {
            return res.status(400).json({
                success: false,
                message: '請提供有效的會議ID'
            });
        }

        const updatedMeeting = await updateMeetingDetail(req.user.userId, parseInt(meetingId), updateData);

        res.status(200).json({
            success: true,
            data: updatedMeeting
        });
    } catch (err) {
        console.error('handleUpdateMeeting error:', err);

        if (err.message.includes('not found') || err.message.includes('no permission')) {
            return res.status(404).json({
                success: false,
                message: '會議不存在或無權限修改'
            });
        }

        if (err.message.includes('門檻') || err.message.includes('格式') || err.message.includes('狀態') || err.message.includes('欄位')) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        return res.status(500).json({
            success: false,
            message: '伺服器內部錯誤，請稍後再試'
        });
    }
}

async function handleGenerateQRCodes(req, res) {
    try {
        const { meetingId } = req.body;
        if (!meetingId) {
            res.status(400).json({ success: false, error: 'Meeting ID is required' });
        }
        const residentIds = await getResidentIdsByMeetingId(meetingId);
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

module.exports = {
    handleCheckin,
    handleGetAttendanceSummary,
    handleGenerateQRCodes,
    handleListMeetings,
    handleGetMeeting,
    handleUpdateMeeting
};
