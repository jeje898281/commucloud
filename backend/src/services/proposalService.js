// src/services/proposalService.js
const { findById: findAdminById } = require('../models/adminUserModel');
const { getMeetingById } = require('../models/meetingModel');
const { getResidentsByCommunity, getCommunityTotalSqm, findResidentById } = require('../models/residentModel');
const proposalModel = require('../models/proposalModel');
const { generateVoteQRCode } = require('./qrService');
const { verifyToken } = require('../utils/jwt');
const {
    UserNotFoundError, MeetingNotFoundError, MissingRequiredFieldsError,
    ProposalNotFoundError, ProposalTitleInvalidError, ProposalContentInvalidError,
    ProposalSqmThresholdInvalidError, ProposalResidentThresholdInvalidError,
    AlreadyVotedError, VoteResultInvalidError, QRCodeInvalidError, ResidentNotFoundError,
} = require('../errors');

const VOTE_RESULTS = ['agree', 'disagree', 'void'];

async function assertAdminMeeting(adminUserId, meetingId) {
    const admin = await findAdminById(adminUserId);
    if (!admin) throw new UserNotFoundError();
    const meeting = await getMeetingById(meetingId);
    if (!meeting || meeting.communityId !== admin.communityId) throw new MeetingNotFoundError();
    return { admin, meeting };
}

async function assertAdminProposal(adminUserId, proposalId) {
    const admin = await findAdminById(adminUserId);
    if (!admin) throw new UserNotFoundError();
    const proposal = await proposalModel.getProposalById(proposalId);
    if (!proposal || proposal.meeting.communityId !== admin.communityId) throw new ProposalNotFoundError();
    return { admin, proposal };
}

function validateThresholds(sqmThreshold, residentThreshold) {
    const sqm = Number(sqmThreshold);
    const residents = Number(residentThreshold);
    if (Number.isNaN(sqm) || sqm < 0 || sqm > 100) throw new ProposalSqmThresholdInvalidError();
    if (!Number.isInteger(residents) || residents < 0) throw new ProposalResidentThresholdInvalidError();
    return { sqm, residents };
}

async function createProposal(adminUserId, { meetingId, title, content, sqmThreshold, residentThreshold }) {
    if (!meetingId) throw new MissingRequiredFieldsError();
    const { meeting } = await assertAdminMeeting(adminUserId, Number(meetingId));
    if (!title || !title.trim()) throw new ProposalTitleInvalidError();
    if (!content || !content.trim()) throw new ProposalContentInvalidError();

    // 未指定門檻時沿用會議門檻
    const sqmInput = sqmThreshold === undefined || sqmThreshold === '' ? meeting.sqmThreshold : sqmThreshold;
    const residentInput = residentThreshold === undefined || residentThreshold === '' ? meeting.residentThreshold : residentThreshold;
    const { sqm, residents } = validateThresholds(sqmInput, residentInput);

    return proposalModel.createProposal({
        meetingId: meeting.id,
        title: title.trim(),
        content: content.trim(),
        sqmThreshold: sqm,
        residentThreshold: residents,
        createAdminUserId: adminUserId,
    });
}

async function buildProposalResult(proposal, totalCommunitySqm) {
    const stats = await proposalModel.getVoteStats(proposal.id);
    const agreeSqmPercent = totalCommunitySqm > 0 ? (stats.agreeSqm / totalCommunitySqm) * 100 : 0;
    const reachedResidentThreshold = stats.agreeCount >= proposal.residentThreshold;
    const reachedSqmThreshold = agreeSqmPercent >= proposal.sqmThreshold;
    return {
        ...proposal,
        ...stats,
        agreeSqmPercent,
        totalCommunitySqm,
        reachedResidentThreshold,
        reachedSqmThreshold,
        passed: reachedResidentThreshold && reachedSqmThreshold,
    };
}

async function listProposals(adminUserId, meetingId) {
    const { meeting } = await assertAdminMeeting(adminUserId, Number(meetingId));
    const totalCommunitySqm = await getCommunityTotalSqm(meeting.communityId);
    const proposals = await proposalModel.listProposalsByMeeting(meeting.id);
    return Promise.all(proposals.map((p) => buildProposalResult(p, totalCommunitySqm)));
}

async function getProposalDetail(adminUserId, proposalId) {
    const { admin, proposal } = await assertAdminProposal(adminUserId, Number(proposalId));
    const totalCommunitySqm = await getCommunityTotalSqm(admin.communityId);
    const { meeting, ...rest } = proposal;
    const result = await buildProposalResult(rest, totalCommunitySqm);
    return { ...result, meeting };
}

async function updateProposal(adminUserId, proposalId, updateData) {
    const { proposal } = await assertAdminProposal(adminUserId, Number(proposalId));

    const data = {};
    if (updateData.title !== undefined) {
        if (!updateData.title.trim()) throw new ProposalTitleInvalidError();
        data.title = updateData.title.trim();
    }
    if (updateData.content !== undefined) {
        if (!updateData.content.trim()) throw new ProposalContentInvalidError();
        data.content = updateData.content.trim();
    }
    if (updateData.sqmThreshold !== undefined || updateData.residentThreshold !== undefined) {
        const sqmInput = updateData.sqmThreshold !== undefined ? updateData.sqmThreshold : proposal.sqmThreshold;
        const residentInput = updateData.residentThreshold !== undefined ? updateData.residentThreshold : proposal.residentThreshold;
        const { sqm, residents } = validateThresholds(sqmInput, residentInput);
        data.sqmThreshold = sqm;
        data.residentThreshold = residents;
    }
    if (Object.keys(data).length === 0) throw new MissingRequiredFieldsError();
    return proposalModel.updateProposal(proposal.id, data);
}

async function deleteProposal(adminUserId, proposalId) {
    const { proposal } = await assertAdminProposal(adminUserId, Number(proposalId));
    await proposalModel.deleteProposal(proposal.id);
    return { id: proposal.id };
}

// 產生整場會議的投票單資料：每位住戶 × 每個提案 × {同意 QR, 不同意 QR}
async function generateMeetingBallots(adminUserId, meetingId) {
    const { meeting } = await assertAdminMeeting(adminUserId, Number(meetingId));
    const [residents, proposals] = await Promise.all([
        getResidentsByCommunity(meeting.communityId),
        proposalModel.listProposalsByMeeting(meeting.id),
    ]);

    const ballots = await Promise.all(residents.map(async (resident) => {
        const proposalBallots = await Promise.all(proposals.map(async (p) => {
            const [agree, disagree] = await Promise.all([
                generateVoteQRCode({ proposalId: p.id, residentId: resident.id, result: 'agree' }),
                generateVoteQRCode({ proposalId: p.id, residentId: resident.id, result: 'disagree' }),
            ]);
            return {
                proposalId: p.id,
                title: p.title,
                content: p.content,
                agreeQrDataURL: agree.qrDataURL,
                disagreeQrDataURL: disagree.qrDataURL,
            };
        }));
        return {
            residentId: resident.id,
            code: resident.code,
            residentSqm: resident.residentSqm,
            proposals: proposalBallots,
        };
    }));

    return {
        meeting: { id: meeting.id, name: meeting.name, date: meeting.date },
        proposalCount: proposals.length,
        residentCount: residents.length,
        ballots,
    };
}

// 掃碼記票：token 內含 proposalId / residentId / result，掃描即記票
async function voteByQRCode(adminUserId, qrCode) {
    let payload;
    try {
        payload = await verifyToken(qrCode);
    } catch (err) {
        throw new QRCodeInvalidError();
    }
    if (!payload || !payload.proposalId || !payload.residentId || !payload.result) {
        throw new QRCodeInvalidError();
    }
    if (!VOTE_RESULTS.includes(payload.result)) {
        throw new VoteResultInvalidError();
    }

    const admin = await findAdminById(adminUserId);
    if (!admin) throw new UserNotFoundError();

    const proposal = await proposalModel.getProposalById(payload.proposalId);
    if (!proposal || proposal.meeting.communityId !== admin.communityId) throw new ProposalNotFoundError();

    const resident = await findResidentById(payload.residentId);
    if (!resident || resident.communityId !== admin.communityId) throw new ResidentNotFoundError();

    const existing = await proposalModel.existsVote(payload.proposalId, payload.residentId);
    if (existing) throw new AlreadyVotedError();

    const vote = await proposalModel.createVote({
        proposalId: payload.proposalId,
        residentId: payload.residentId,
        result: payload.result,
        createAdminUserId: adminUserId,
    });

    return {
        voteId: vote.id,
        proposalId: payload.proposalId,
        proposalTitle: proposal.title,
        residentId: payload.residentId,
        residentCode: resident.code,
        result: payload.result,
    };
}

module.exports = {
    createProposal,
    listProposals,
    getProposalDetail,
    updateProposal,
    deleteProposal,
    generateMeetingBallots,
    voteByQRCode,
};
