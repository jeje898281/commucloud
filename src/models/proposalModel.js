// src/models/proposalModel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PROPOSAL_SELECT = {
    id: true,
    meetingId: true,
    title: true,
    content: true,
    sqmThreshold: true,
    residentThreshold: true,
    createAdminUserId: true,
    createdAt: true,
    updatedAt: true,
};

async function createProposal({ meetingId, title, content, sqmThreshold, residentThreshold, createAdminUserId }) {
    return prisma.proposal.create({
        data: { meetingId, title, content, sqmThreshold, residentThreshold, createAdminUserId },
        select: PROPOSAL_SELECT,
    });
}

async function getProposalById(id) {
    return prisma.proposal.findUnique({
        where: { id },
        select: {
            ...PROPOSAL_SELECT,
            meeting: { select: { id: true, name: true, communityId: true } },
        },
    });
}

async function listProposalsByMeeting(meetingId) {
    return prisma.proposal.findMany({
        where: { meetingId },
        orderBy: { id: 'asc' },
        select: PROPOSAL_SELECT,
    });
}

async function updateProposal(id, data) {
    return prisma.proposal.update({
        where: { id },
        data,
        select: PROPOSAL_SELECT,
    });
}

async function deleteProposal(id) {
    await prisma.voteLog.deleteMany({ where: { proposalId: id } });
    return prisma.proposal.delete({ where: { id } });
}

// 回傳該提案的票數統計：同意/不同意/廢票 之「戶數」與「坪數」
async function getVoteStats(proposalId) {
    const [row] = await prisma.$queryRaw`
      SELECT
        COUNT(*) FILTER (WHERE v.vote_result = 'agree')::int    AS "agreeCount",
        COUNT(*) FILTER (WHERE v.vote_result = 'disagree')::int AS "disagreeCount",
        COUNT(*) FILTER (WHERE v.vote_result = 'void')::int     AS "voidCount",
        COALESCE(SUM(r.resident_sqm) FILTER (WHERE v.vote_result = 'agree'), 0)::double precision    AS "agreeSqm",
        COALESCE(SUM(r.resident_sqm) FILTER (WHERE v.vote_result = 'disagree'), 0)::double precision AS "disagreeSqm"
      FROM vote_log v
      JOIN resident r ON v.resident_id = r.id
      WHERE v.proposal_id = ${proposalId};
    `;
    return {
        agreeCount: row.agreeCount,
        disagreeCount: row.disagreeCount,
        voidCount: row.voidCount,
        totalCount: row.agreeCount + row.disagreeCount + row.voidCount,
        agreeSqm: parseFloat(row.agreeSqm),
        disagreeSqm: parseFloat(row.disagreeSqm),
    };
}

async function existsVote(proposalId, residentId) {
    return prisma.voteLog.findFirst({ where: { proposalId, residentId } });
}

async function createVote({ proposalId, residentId, result, createAdminUserId }) {
    return prisma.voteLog.create({
        data: { proposalId, residentId, result, createAdminUserId },
    });
}

module.exports = {
    createProposal,
    getProposalById,
    listProposalsByMeeting,
    updateProposal,
    deleteProposal,
    getVoteStats,
    existsVote,
    createVote,
};
