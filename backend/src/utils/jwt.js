// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

// Every token is signed for one audience and verified against that audience only.
// A QR code printed for a resident therefore cannot be replayed as a staff login
// token, and a check-in code cannot be scanned as a ballot or the other way round.
const AUDIENCE = {
    access: 'access',
    checkin: 'checkin',
    vote: 'vote',
};

function verify(token, audience) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, SECRET, { audience, algorithms: ['HS256'] }, (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded);
        });
    });
}

// Staff login token.
function signToken(payload) {
    return jwt.sign(payload, SECRET, { expiresIn: '7d', audience: AUDIENCE.access });
}

function verifyToken(token) {
    return verify(token, AUDIENCE.access);
}

// QR tokens are printed ahead of the meeting, so they carry no expiry and no
// timestamp (which also keeps the QR code small). What they allow is decided
// when they are scanned, against the meeting or proposal they name.
function signCheckinToken({ meetingId, residentId }) {
    return jwt.sign({ meetingId, residentId }, SECRET, { noTimestamp: true, audience: AUDIENCE.checkin });
}

function verifyCheckinToken(token) {
    return verify(token, AUDIENCE.checkin);
}

function signVoteToken({ proposalId, residentId, result }) {
    return jwt.sign({ proposalId, residentId, result }, SECRET, { noTimestamp: true, audience: AUDIENCE.vote });
}

function verifyVoteToken(token) {
    return verify(token, AUDIENCE.vote);
}

module.exports = {
    signToken, verifyToken,
    signCheckinToken, verifyCheckinToken,
    signVoteToken, verifyVoteToken,
};
