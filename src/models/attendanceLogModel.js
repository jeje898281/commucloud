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
function createLog(meetingId, residentId, userId, isManual) {
    return prisma.meetingAttendanceLog.create({
        data: {
            meetingId,
            residentId,
            createAdminUserId: userId,
            isManual,
        },
    });
}

/**
 * 統計指定會議的報到人數與坪數
 * @param {number} meetingId
 * @returns {Promise<{residentCount: number, totalSqm: number}>}
 */
async function getAttendanceStats(meetingId) {
    // 使用 Raw SQL 簡潔撈出結果
    const [result] = await prisma.$queryRaw`
      SELECT 
        COUNT(*)::int AS "residentAttendanceCount",
        COALESCE(SUM(r.resident_sqm), 0)::double precision AS "totalAttendanceSqm"
      FROM meeting_attendance_log log
      JOIN resident r ON log.resident_id = r.id
      WHERE log.meeting_id = ${meetingId};
    `;
    return {
        residentAttendanceCount: result.residentAttendanceCount,
        totalAttendanceSqm: parseFloat(result.totalAttendanceSqm),
    };
}

module.exports = { existsLog, createLog, getAttendanceStats };