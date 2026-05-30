// src/services/reportService.js
const { existsLog, createLog } = require('../models/attendanceLogModel');

/**
 * 檢查某會議與住戶是否已有報到紀錄
 * @param {Object} params
 * @param {number} params.meetingId
 * @param {number} params.residentId
 * @param {number} params.userId
 * @param {boolean} params.isManual
 * @returns {Promise<MeetingAttendanceLog>}
 */
async function checkin({ meetingId, residentId, userId, isManual }) {
    const already = await existsLog(meetingId, residentId);
    if (already) {
        const error = new Error('Already checked in');
        error.code = 'ALREADY_CHECKED_IN';
        throw error;
    }
    return createLog({ meetingId, residentId, userId, isManual });
}


module.exports = { checkin };
