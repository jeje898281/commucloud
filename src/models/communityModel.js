const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 根據ID獲取社區詳細資訊
 * @param {number} id 社區ID
 * @returns {Promise<Community|null>}
 */
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

/**
 * 獲取社區統計資訊
 * @param {number} id 社區ID
 * @returns {Promise<Object>}
 */
async function getCommunityStats(id) {
    const [residentCount, activeMeetingCount] = await Promise.all([
        // 住戶總數
        prisma.resident.count({
            where: { communityId: id }
        }),
        // 進行中的會議數量
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

/**
 * 更新社區資訊
 * @param {number} id 社區ID
 * @param {Object} data 要更新的資料
 * @returns {Promise<Community>}
 */
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