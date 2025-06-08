// src/models/communityModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function findById(id) {
    return prisma.community.findUnique({
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

function updateCommunity(id, data) {
    return prisma.community.update({
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
}

module.exports = {
    findById,
    getCommunityStats,
    updateCommunity
}; 