// src/models/communityModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findById(id) {
    const community = await prisma.community.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            description: true,
            logoUrl: true,
            createdAt: true,
            updatedAt: true
        }
    });
    return community;
}

async function getCommunityStats(id) {
    const [residentCount, activeMeetingCount] = await Promise.all([
        prisma.resident.count({
            where: { communityId: id }
        }),
        prisma.meeting.count({
            where: {
                communityId: id,
                status: { in: ['pending', 'ongoing'] }
            }
        })
    ]);

    return {
        totalResidents: residentCount,
        activeMeetings: activeMeetingCount
    };
}

async function updateCommunity(id, data) {
    const community = await prisma.community.update({
        where: { id },
        data: data,
        select: {
            id: true,
            name: true,
            description: true,
            logoUrl: true,
            updatedAt: true
        }
    });
    return community;
}

module.exports = {
    findById,
    getCommunityStats,
    updateCommunity
}; 