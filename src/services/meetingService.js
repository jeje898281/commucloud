// src/services/reportService.js
const { existsLog, createLog, getAttendanceStats } = require('../models/attendanceLogModel');
const { verifyToken } = require('../utils/jwt');
const { getMeetingById } = require('../models/meetingModel');

/**
 * 檢查某會議與住戶是否已有報到紀錄
 * @param {Object} params
 * @param {number} params.meetingId
 * @param {number} params.residentId
 * @param {number} params.userId
 * @param {boolean} params.isManual
 * @returns {Promise<MeetingAttendanceLog>}
 */
async function checkin(qrCode, meetingId, residentId, userId) {
    try {
        let mId, rId, manualFlag;

        if (qrCode) {
            const payload = await verifyToken(qrCode);
            mId = payload.meetingId;
            rId = payload.residentId;
            manualFlag = false;
        } else {
            mId = meetingId;
            rId = residentId;
            manualFlag = true;
            console.log('manualFlag', manualFlag);
            console.log('mId', mId);
            console.log('rId', rId);
            console.log('userId', userId);
        }
        const already = await existsLog(mId, rId);
        if (already) {
            const error = new Error('Already checked in');
            error.code = 'ALREADY_CHECKED_IN';
            throw error;
        }
        const checkInRecord = await createLog(mId, rId, userId, manualFlag);
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


module.exports = { checkin, getAttendanceSummary };
