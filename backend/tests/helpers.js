// tests/helpers.js
const request = require('supertest');
const buildApp = require('../src/app');

const app = buildApp();

function uniq(prefix = 'u') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

async function registerAdmin(overrides = {}) {
    const u = overrides.username || uniq('admin');
    const payload = {
        username: u,
        email: `${u}@example.com`,
        password: 'password123',
        displayName: 'Owner',
        communityName: `Community-${u}`,
        communityDescription: 'test community',
        logoUrl: '',
        ...overrides,
    };
    const res = await request(app).post('/api/auth/register').send(payload);
    return { res, username: u, token: res.body.token, communityId: res.body.community?.id };
}

async function login(username, password = 'password123') {
    return request(app).post('/api/auth/login').send({ username, password });
}

async function createSubAccount(adminToken, role) {
    const u = uniq(role.slice(0, 4));
    const res = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: u, password: 'password123', displayName: role, role });
    const loginRes = await login(u);
    return { username: u, token: loginRes.body.token, id: res.body.data?.id, role };
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });

async function createResident(token, residentSqm) {
    const res = await request(app).post('/api/resident').set(auth(token))
        .send({ code: uniq('unit'), residentSqm, email: null });
    return res.body.data;
}

async function createMeeting(token, overrides = {}) {
    const res = await request(app).post('/api/meeting').set(auth(token)).send({
        name: 'Test Meeting',
        date: '2026-06-01T10:00:00Z',
        sqmThreshold: 50,
        residentThreshold: 2,
        ...overrides,
    });
    return res.body.data;
}

async function createProposal(token, meetingId, overrides = {}) {
    const res = await request(app).post('/api/proposal').set(auth(token))
        .send({ meetingId, title: 'Test Proposal', content: 'Details', ...overrides });
    return res.body.data;
}

// Check-in QR tokens for every resident of the meeting's community, keyed by resident id.
async function getCheckinTokens(token, meetingId) {
    const res = await request(app).post('/api/meeting/generate-qr-codes').set(auth(token)).send({ meetingId });
    return Object.fromEntries(res.body.data.map((item) => [item.residentId, item.token]));
}

const checkin = (token, body) => request(app).post('/api/meeting/checkin').set(auth(token)).send(body);
const vote = (token, qrCode) => request(app).post('/api/proposal/vote').set(auth(token)).send({ qrCode });

module.exports = {
    app, request, uniq, registerAdmin, login, createSubAccount, auth,
    createResident, createMeeting, createProposal, getCheckinTokens, checkin, vote,
};
