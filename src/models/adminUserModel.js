// src/models/adminUserModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findByUsername(username) {
    const user = await prisma.adminUser.findUnique({
        where: { username },
        include: { community: true }
    });
    return user;
}

async function findById(id) {
    const user = await prisma.adminUser.findUnique({
        where: { id },
        include: { community: true }
    });
    return user;
}

async function getProfile(id) {
    const user = await prisma.adminUser.findUnique({
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
    return user;
}

async function updateProfile(id, data) {
    const user = await prisma.adminUser.update({
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
    return user;
}

module.exports = { findByUsername, findById, getProfile, updateProfile };
