// src/models/meetingModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 取出會議門檻設定
 * @param {number} meetingId
 * @returns {Promise<Meeting|null>}
 */
function getMeetingById(meetingId) {
    return prisma.meeting.findUnique({
        where: { id: meetingId },
        select: {
            id: true,
            communityId: true,
            name: true,
            date: true,
            residentThreshold: true,
            sqmThreshold: true
        }
    });
}


module.exports = { getMeetingById };
