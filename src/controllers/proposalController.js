// src/controllers/proposalController.js
const {
    createProposal, listProposals, getProposalDetail,
    updateProposal, deleteProposal, generateMeetingBallots, voteByQRCode,
} = require('../services/proposalService');
const { MissingRequiredFieldsError } = require('../errors');

async function handleCreateProposal(req, res) {
    const { meetingId, title, content, sqmThreshold, residentThreshold } = req.body;
    const proposal = await createProposal(req.user.userId, { meetingId, title, content, sqmThreshold, residentThreshold });
    res.status(201).json({ data: proposal });
}

async function handleListProposals(req, res) {
    const meetingId = parseInt(req.params.meetingId, 10);
    const proposals = await listProposals(req.user.userId, meetingId);
    res.status(200).json({ data: proposals });
}

async function handleGetProposal(req, res) {
    const proposalId = parseInt(req.params.id, 10);
    const proposal = await getProposalDetail(req.user.userId, proposalId);
    res.status(200).json({ data: proposal });
}

async function handleUpdateProposal(req, res) {
    const proposalId = parseInt(req.params.id, 10);
    const proposal = await updateProposal(req.user.userId, proposalId, req.body);
    res.status(200).json({ data: proposal });
}

async function handleDeleteProposal(req, res) {
    const proposalId = parseInt(req.params.id, 10);
    const result = await deleteProposal(req.user.userId, proposalId);
    res.status(200).json({ data: result });
}

async function handleGenerateBallots(req, res) {
    const meetingId = parseInt(req.params.meetingId, 10);
    const data = await generateMeetingBallots(req.user.userId, meetingId);
    res.status(200).json({ data });
}

async function handleVote(req, res) {
    const { qrCode } = req.body;
    if (!qrCode) throw new MissingRequiredFieldsError();
    const result = await voteByQRCode(req.user.userId, qrCode);
    res.status(201).json({ data: result });
}

module.exports = {
    handleCreateProposal,
    handleListProposals,
    handleGetProposal,
    handleUpdateProposal,
    handleDeleteProposal,
    handleGenerateBallots,
    handleVote,
};
