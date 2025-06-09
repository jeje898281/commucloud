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

function findResidentByCode(residentCode, communityId) {
    return prisma.resident.findFirst({
        where: { code: residentCode, communityId },
        select: { id: true }
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

async function createMeetingModel(createAdminUserId, communityId, { name, status, date, sqmThreshold, residentThreshold }) {
    const newMeeting = await prisma.meeting.create({
        data: { name, status, date, sqmThreshold, residentThreshold, createAdminUserId, communityId }
    });
    return newMeeting;
}

module.exports = { getMeetingById, getMeetingsByCommunityId, updateMeeting, createMeetingModel, findResidentByCode };
