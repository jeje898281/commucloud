// src/models/meetingModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getMeetingById(meetingId) {
    return prisma.meeting.findUnique({
        where: { id: meetingId },
        select: {
            id: true,
            communityId: true,
            name: true,
            date: true,
            status: true,
            residentThreshold: true,
            sqmThreshold: true
        }
    });
}

function getMeetingsByCommunityId(communityId) {
    return prisma.meeting.findMany({
        where: { communityId, status: { not: 'deleted' } },
        orderBy: { date: 'desc' },
        select: {
            id: true,
            name: true,
            date: true,
            status: true,
            sqmThreshold: true,
            residentThreshold: true
        }
    });
}

function updateMeeting(meetingId, updateData) {
    return prisma.meeting.update({
        where: { id: meetingId },
        data: updateData,
        select: {
            id: true,
            name: true,
            date: true,
            status: true,
            sqmThreshold: true,
            residentThreshold: true,
            communityId: true
        }
    });
}

module.exports = { getMeetingById, getMeetingsByCommunityId, updateMeeting };
