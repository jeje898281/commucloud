// src/models/adminUserModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function findByUsername(username) {
    return prisma.adminUser.findUnique({
        where: { username },
        include: { community: true }
    });
}

module.exports = { findByUsername };
