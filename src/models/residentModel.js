// src/models/residentModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getAllWithCommunity() {
    return prisma.resident.findMany({ include: { community: true } });
}

module.exports = { getAllWithCommunity };
