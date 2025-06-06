// src/models/adminUserModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function findByUsername(username) {
    return prisma.adminUser.findUnique({
        where: { username },
        include: { community: true }
    });
}

function findById(id) {
    return prisma.adminUser.findUnique({ where: { id } });
}

/**
 * 獲取用戶詳細資料（不包含社區資訊）
 * @param {number} id 用戶ID
 * @returns {Promise<AdminUser|null>}
 */
function getProfile(id) {
    return prisma.adminUser.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            displayName: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    });
}

/**
 * 更新用戶資料
 * @param {number} id 用戶ID
 * @param {Object} data 要更新的資料
 * @returns {Promise<AdminUser>}
 */
function updateProfile(id, data) {
    return prisma.adminUser.update({
        where: { id },
        data: data,
        select: {
            id: true,
            username: true,
            displayName: true,
            role: true,
            updatedAt: true
        }
    });
}

module.exports = { findByUsername, findById, getProfile, updateProfile };
