// src/services/qrService.js
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
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

async function generateBatchQRCodes({ meetingId, residentIds, expiresIn }) {
    const tasks = residentIds.map(id =>
        generateQRCodeForResident({ meetingId, residentId: id, expiresIn })
    );
    return Promise.all(tasks);
}

module.exports = { generateBatchQRCodes };
