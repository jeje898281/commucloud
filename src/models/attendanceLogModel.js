// src/models/attendanceLogModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function existsLog(meetingId, residentId) {
    const log = await prisma.meetingAttendanceLog.findFirst({
        where: { meetingId, residentId },
    });
    return log;
}

async function createLog(meetingId, residentId, userId, isManual) {
    const log = await prisma.meetingAttendanceLog.create({
        data: {
            meetingId,
            residentId,
            createAdminUserId: userId,
            isManual,
        },
    });
    return log;
}

async function getAttendanceStats(meetingId) {
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