// src/models/residentModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ResidentCodeAlreadyExistsError } = require('../errors');

async function getAllWithCommunity() {
    const residents = await prisma.resident.findMany({
        include: {
            community: true,
        },
    });
    return residents;
}


async function findById(id) {
    const resident = await prisma.resident.findUnique({
        where: { id },
        select: {
            id: true,
            code: true,
            residentSqm: true,
            username: true,
            email: true,
            community: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return resident;
}

async function updateResident(id, data) {
    const resident = await prisma.resident.update({
        where: { id },
        data: {
            ...data,
        },
    });
    return resident;
}

async function findByCommunityWithEmail(communityId) {
    const residents = await prisma.resident.findMany({
        where: {
            communityId,
            email: { not: null },
        },
    });
    return residents;
}

async function findResidentIdsByMeetingId(meetingId) {
    const result = await prisma.$queryRaw`
      SELECT r.id
      FROM resident r
      JOIN meeting m ON r.community_id = m.community_id
      WHERE m.id = ${meetingId};
    `;
    return result.map(item => item.id);
}

async function createResidentModel(code, residentSqm, email, communityId) {
    try {
        const resident = await prisma.resident.create({
            data: { code, residentSqm, email, communityId },
        });
        return resident;
    } catch (error) {
        if (error.code === 'P2002' && Array.isArray(error.meta?.target) && error.meta.target.includes('code')) {
            throw new ResidentCodeAlreadyExistsError();
        }
        throw error;
    }
}


async function bulkCreateResidents(residentsData) {
    try {
        const result = await prisma.resident.createMany({
            data: residentsData,
        });

        return {
            success: true,
            count: result.count
        };
    } catch (error) {
        if (error.code === 'P2002') {
            const conflictedCodes = [];
            const successfulResidents = [];

            await Promise.all(residentsData.map(async (resident) => {
                try {
                    await prisma.resident.create({
                        data: resident
                    });
                    successfulResidents.push(resident);
                } catch (individualError) {
                    if (individualError.code === 'P2002') {
                        conflictedCodes.push(resident.code);
                    } else {
                        throw individualError;
                    }
                }
            }));

            return {
                success: false,
                count: successfulResidents.length,
                successfulResidents,
                conflictedCodes,
                error: 'DUPLICATE_CODES'
            };
        }
        throw error;
    }
}

async function updateResidentModel(id, data) {
    const updatedResidentResult = await prisma.resident.update({
        where: { id },
        data,
    });
    return updatedResidentResult;
}

async function deleteResidentModel(id) {
    const deletedResidentResult = await prisma.resident.delete({
        where: { id },
    });
    return deletedResidentResult;
}

module.exports = {
    getAllWithCommunity,
    findById,
    updateResident,
    findByCommunityWithEmail,
    findResidentIdsByMeetingId,
    createResidentModel,
    bulkCreateResidents,
    updateResidentModel,
    deleteResidentModel,
};
