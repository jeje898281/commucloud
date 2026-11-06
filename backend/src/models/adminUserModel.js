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

async function findByEmail(email) {
    return prisma.adminUser.findUnique({ where: { email } });
}

async function createAdminAndCommunity({ username, email, passwordHash, displayName, communityName, communityDescription, logoUrl }) {
    return prisma.$transaction(async (tx) => {
        const community = await tx.community.create({
            data: {
                name: communityName,
                description: communityDescription,
                logoUrl: logoUrl || ''
            }
        });
        const admin = await tx.adminUser.create({
            data: {
                username,
                email,
                password: passwordHash,
                displayName,
                role: 'admin',
                isActive: true,
                communityId: community.id
            },
            include: { community: true }
        });
        return admin;
    });
}

async function listByCommunity(communityId) {
    return prisma.adminUser.findMany({
        where: { communityId },
        select: {
            id: true, username: true, email: true, displayName: true,
            role: true, isActive: true, createdAt: true, updatedAt: true
        },
        orderBy: { id: 'asc' }
    });
}

async function createSubAccount({ communityId, username, passwordHash, displayName, role }) {
    return prisma.adminUser.create({
        data: { communityId, username, password: passwordHash, displayName, role, isActive: true },
        select: {
            id: true, username: true, displayName: true, role: true, isActive: true,
            createdAt: true, updatedAt: true, communityId: true
        }
    });
}

async function updateAdminUser(id, data) {
    return prisma.adminUser.update({
        where: { id },
        data,
        select: {
            id: true, username: true, displayName: true, role: true, isActive: true,
            createdAt: true, updatedAt: true, communityId: true
        }
    });
}

async function countActiveAdmins(communityId) {
    return prisma.adminUser.count({
        where: { communityId, role: 'admin', isActive: true }
    });
}

module.exports = { findByUsername, findById, getProfile, updateProfile, findByEmail, createAdminAndCommunity, listByCommunity, createSubAccount, updateAdminUser, countActiveAdmins };
