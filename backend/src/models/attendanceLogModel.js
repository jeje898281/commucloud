// src/models/attendanceLogModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { AlreadyCheckedInError } = require('../errors');

// The unique index on (meeting_id, resident_id) decides who checked in first, so
// simultaneous scans of one QR code cannot both be recorded.
async function createLog(meetingId, residentId, userId, isManual) {
    try {
        return await prisma.meetingAttendanceLog.create({
            data: {
                meetingId,
                residentId,
                createAdminUserId: userId,
                isManual,
            },
        });
    } catch (error) {
        if (error.code === 'P2002') {
            throw new AlreadyCheckedInError();
        }
        throw error;
    }
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

async function getAttendanceList(meetingId) {
    const logs = await prisma.meetingAttendanceLog.findMany({
        where: { meetingId },
        orderBy: { checkedInAt: 'asc' },
        select: {
            id: true,
            checkedInAt: true,
            isManual: true,
            resident: { select: { code: true, residentSqm: true } },
            handledBy: { select: { displayName: true } },
        },
    });
    return logs.map((log) => ({
        id: log.id,
        residentCode: log.resident.code,
        residentSqm: log.resident.residentSqm,
        checkedInAt: log.checkedInAt,
        isManual: log.isManual,
        handledBy: log.handledBy?.displayName || null,
    }));
}

module.exports = { createLog, getAttendanceStats, getAttendanceList };