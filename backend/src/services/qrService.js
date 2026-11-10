// src/services/qrService.js
const QRCode = require('qrcode');
const { findResidentIdsByMeetingId } = require('../models/residentModel');
const { signCheckinToken, signVoteToken } = require('../utils/jwt');

async function generateQRCodeForResident({ meetingId, residentId }) {
    const token = signCheckinToken({ meetingId, residentId });

    const qrDataURL = await QRCode.toDataURL(token);

    return { residentId, token, qrDataURL };
}

async function generateBatchQRCodes({ meetingId, residentIds }) {
    const tasks = residentIds.map(id =>
        generateQRCodeForResident({ meetingId, residentId: id })
    );
    return Promise.all(tasks);
}

async function getResidentIdsByMeetingId(meetingId) {
    const residents = await findResidentIdsByMeetingId(meetingId);
    return residents;
}

// 投票 QR：每張票的「同意 / 不同意」各自編碼成一個 token，秘書掃描即記票
async function generateVoteQRCode({ proposalId, residentId, result }) {
    const token = signVoteToken({ proposalId, residentId, result });
    const qrDataURL = await QRCode.toDataURL(token);
    return { token, qrDataURL };
}

module.exports = { generateBatchQRCodes, getResidentIdsByMeetingId, generateVoteQRCode };
