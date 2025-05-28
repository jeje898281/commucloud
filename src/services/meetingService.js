// src/services/reportService.js
const { existsLog, createLog, getAttendanceStats } = require('../models/attendanceLogModel');
const { verifyToken } = require('../utils/jwt');
const { getMeetingById, getMeetingsByCommunityId } = require('../models/meetingModel');
const { findById: findAdminById } = require('../models/adminUserModel');

/**
 * 檢查某會議與住戶是否已有報到紀錄
 * @param {Object} params
 * @param {number} params.meetingId
 * @param {number} params.residentId
 * @param {number} params.userId
 * @param {boolean} params.isManual
 * @returns {Promise<MeetingAttendanceLog>}
 */
async function checkin({ qrCode, meetingId, residentId, userId }) {
    try {
        let checkinMeetingId, checkinResidentId, manualFlag;

        if (qrCode) {
            const payload = await verifyToken(qrCode);
            checkinMeetingId = payload.meetingId;
            checkinResidentId = payload.residentId;
            manualFlag = false;
        } else {
            checkinMeetingId = meetingId;
            checkinResidentId = residentId;
            manualFlag = true;
        }
        const already = await existsLog(checkinMeetingId, checkinResidentId);
        if (already) {
            const error = new Error('Already checked in');
            error.code = 'ALREADY_CHECKED_IN';
            throw error;
        }
        const checkInRecord = await createLog(checkinMeetingId, checkinResidentId, userId, manualFlag);
        return checkInRecord;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function getAttendanceSummary(meetingId) {
    const meeting = await getMeetingById(meetingId);
    if (!meeting) {
        const err = new Error('Meeting not found');
        err.status = 404;
        throw err;
    }

    const { residentAttendanceCount, totalAttendanceSqm } = await getAttendanceStats(meetingId);
    const reachedResidentThreshold = residentAttendanceCount >= meeting.residentThreshold;
    const reachedSqmThreshold = totalAttendanceSqm >= meeting.sqmThreshold;

    return {
        residentAttendanceCount,
        totalAttendanceSqm,
        residentThreshold: meeting.residentThreshold,
        sqmThreshold: meeting.sqmThreshold,
        reachedResidentThreshold,
        reachedSqmThreshold,
    };
}

async function listMeetingsByAdminUser(adminUserId) {
    const admin = await findAdminById(adminUserId);
    if (!admin) throw new Error('Admin user not found');

    const meetings = await getMeetingsByCommunityId(admin.communityId);
    return meetings;
}

async function getMeetingDetail(adminUserId, meetingId) {
    const admin = await findAdminById(adminUserId);
    if (!admin) throw new Error('Admin user not found');

    const meeting = await getMeetingById(meetingId);
    if (!meeting || meeting.communityId !== admin.communityId) {
        throw new Error('Meeting not found or no permission');
    }
    return meeting;
}


module.exports = { checkin, getAttendanceSummary, listMeetingsByAdminUser, getMeetingDetail };
