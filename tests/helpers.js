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

module.exports = { app, request, uniq, registerAdmin, login, createSubAccount, auth };
