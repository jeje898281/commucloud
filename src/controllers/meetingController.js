// src/controllers/meetingController.js
const {
    checkinByQRCode, checkinByManual, getAttendanceSummary,
    listMeetingsByAdminUser, getMeetingDetail, updateMeetingDetail, createMeeting
} = require('../services/meetingService');
const { generateBatchQRCodes, getResidentIdsByMeetingId } = require('../services/qrService');
const { MeetingIdInvalidError, MissingRequiredFieldsError } = require('../errors');

async function handleCheckin(req, res) {
    const userId = req.user.userId;
    const communityId = req.user.communityId;
    const { qrCode, meetingId, residentCode } = req.body;
    if (!qrCode && !(meetingId && residentCode)) {
        throw new MissingRequiredFieldsError();
    }
    let checkInRecord;
    if (qrCode) {
        checkInRecord = await checkinByQRCode(qrCode, userId);
    } else {
        console.log('checkinByManual', meetingId, residentCode, communityId, userId);
        checkInRecord = await checkinByManual(meetingId, residentCode, communityId, userId);
    }
    res.status(201).json({ data: checkInRecord });
}

async function handleGetAttendanceSummary(req, res) {
    const meetingId = parseInt(req.params.meetingId, 10);
    const summary = await getAttendanceSummary(meetingId);
    res.status(200).json({ data: summary });
}

async function handleListMeetings(req, res) {
    const adminUserId = req.user.userId;
    const meetings = await listMeetingsByAdminUser(adminUserId);
    res.status(200).json({ data: meetings });
}

async function handleGetMeeting(req, res) {
    const meeting = await getMeetingDetail(req.user.userId, + req.params.id);
    res.status(200).json({ data: meeting });
}

async function handleUpdateMeeting(req, res) {
    const { id: meetingId, ...updateData } = req.body;
    if (!meetingId || isNaN(parseInt(meetingId))) {
        throw new MeetingIdInvalidError();
    }

    const updatedMeeting = await updateMeetingDetail(req.user.userId, parseInt(meetingId), updateData);

    res.status(200).json({ data: updatedMeeting });
}

async function handleGenerateQRCodes(req, res) {
    const { meetingId } = req.body;
    if (!meetingId) {
        throw new MeetingIdInvalidError();
    }
    const residentIds = await getResidentIdsByMeetingId(meetingId);
    const data = await generateBatchQRCodes({ meetingId, residentIds });
    res.status(200).json({
        data: data.map(item => ({
            residentId: item.residentId,
            qrDataURL: item.qrDataURL,
            token: item.token
        }))
    });

}

async function handleCreateMeeting(req, res) {
    const adminUserId = req.user.userId;
    const communityId = req.user.communityId;
    const { name, status, date, sqmThreshold, residentThreshold } = req.body;
    const meeting = await createMeeting(adminUserId, communityId, { name, status, date, sqmThreshold, residentThreshold });
    res.status(201).json({ data: meeting });
}

module.exports = {
    handleCheckin,
    handleGetAttendanceSummary,
    handleGenerateQRCodes,
    handleListMeetings,
    handleGetMeeting,
    handleUpdateMeeting,
    handleCreateMeeting
};
