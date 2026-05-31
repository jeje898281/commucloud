// src/services/qrService.js
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const { findResidentIdsByMeetingId } = require('../models/residentModel');
const SECRET = process.env.JWT_SECRET;

async function generateQRCodeForResident({ meetingId, residentId }) {
    const payload = { meetingId, residentId };

    const token = jwt.sign(
        payload,
        SECRET,
        { noTimestamp: true }
    );

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
    const token = jwt.sign({ proposalId, residentId, result }, SECRET, { noTimestamp: true });
    const qrDataURL = await QRCode.toDataURL(token);
    return { token, qrDataURL };
}

module.exports = { generateBatchQRCodes, getResidentIdsByMeetingId, generateVoteQRCode };
