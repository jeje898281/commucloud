// src/models/attendanceLogModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 檢查特定會議與住戶是否已有報到紀錄
 * @param {number} meetingId 
 * @param {number} residentId 
 * @returns {Promise<MeetingAttendanceLog|null>}
 */
function existsLog(meetingId, residentId) {
    return prisma.meetingAttendanceLog.findFirst({
        where: { meetingId, residentId },
    });
}

/**
 * 新增一筆報到紀錄
 * @param {Object} data
 * @param {number} data.meetingId
 * @param {number} data.residentId
 * @param {number} data.userId
 * @param {boolean} data.isManual
 * @returns {Promise<MeetingAttendanceLog>}
 */
function createLog({ meetingId, residentId, userId, isManual }) {
    return prisma.meetingAttendanceLog.create({
        data: {
            meetingId,
            residentId,
            createAdminUserId: userId,
            isManual,
        },
    });
}

module.exports = { existsLog, createLog };
