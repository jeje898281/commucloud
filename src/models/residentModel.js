// src/models/residentModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 撈所有住戶，並包含社區與 email 欄位
 */
function getAllWithCommunity() {
    return prisma.resident.findMany({
        include: {
            community: true,
        },
        // Prisma 會自動包含所有 scalar 欄位（如 id、code、email…）
    });
}

/**
 * 根據 ID 找住戶
 * @param {number} id
 */
function findById(id) {
    return prisma.resident.findUnique({
        where: { id },
        select: {
            id: true,
            code: true,
            residentSqm: true,
            username: true,
            email: true,         // 確保 email 被選出
            community: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

/**
 * 更新住戶資料（包含 email）
 * @param {number} id
 * @param {Object} data
 */
function updateResident(id, data) {
    return prisma.resident.update({
        where: { id },
        data: {
            ...data,           // 其中可含 email
        },
    });
}

/**
 * 根據 communityId 撈出所有有 email 的住戶
 * @param {number} communityId
 * @returns {Promise<Resident[]>}
 */
function findByCommunityWithEmail(communityId) {
    return prisma.resident.findMany({
        where: {
            communityId,
            email: { not: null },
        },
    });
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
    const resident = await prisma.resident.create({
        data: { code, residentSqm, email, communityId },
    });
    return resident;
}

module.exports = {
    getAllWithCommunity,
    findById,
    updateResident,
    findByCommunityWithEmail,
    findResidentIdsByMeetingId,
    createResidentModel,
};
