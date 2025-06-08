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

function updateProfile(id, data) {
    return prisma.adminUser.update({
        where: { id },
        data: data,
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

module.exports = { findByUsername, findById, getProfile, updateProfile };
