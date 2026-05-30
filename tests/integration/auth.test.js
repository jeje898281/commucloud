const { app, request, uniq, registerAdmin, login } = require('../helpers');

describe('Auth — register & login', () => {
    let owner;

    beforeAll(async () => {
        owner = await registerAdmin();
    });

    test('register returns 201 with token and admin role', () => {
        expect(owner.res.status).toBe(201);
        expect(owner.token).toBeTruthy();
        expect(owner.res.body.role).toBe('admin');
        expect(owner.res.body.community.name).toContain('Community-');
    });

    test('duplicate username → 409 USERNAME_TAKEN', async () => {
        const res = await request(app).post('/api/auth/register').send({
            username: owner.username,
            email: `other_${uniq()}@example.com`,
            password: 'password123',
            displayName: 'X',
            communityName: 'X',
        });
        expect(res.status).toBe(409);
        expect(res.body.code).toBe('USERNAME_TAKEN');
    });

    test('duplicate email → 409 EMAIL_TAKEN', async () => {
        const res = await request(app).post('/api/auth/register').send({
            username: uniq('other'),
            email: `${owner.username}@example.com`,
            password: 'password123',
            displayName: 'X',
            communityName: 'X',
        });
        expect(res.status).toBe(409);
        expect(res.body.code).toBe('EMAIL_TAKEN');
    });

    test('password shorter than 8 → 400 PASSWORD_TOO_SHORT', async () => {
        const res = await request(app).post('/api/auth/register').send({
            username: uniq('short'),
            email: `${uniq('short')}@example.com`,
            password: 'short',
            displayName: 'X',
            communityName: 'X',
        });
        expect(res.body.code).toBe('PASSWORD_TOO_SHORT');
    });

    test('missing fields → 400 MISSING_REQUIRED_FIELDS', async () => {
        const res = await request(app).post('/api/auth/register').send({
            username: uniq('missing'),
            email: `${uniq('missing')}@example.com`,
        });
        expect(res.body.code).toBe('MISSING_REQUIRED_FIELDS');
    });

    test('login with correct credentials → 200 + token', async () => {
        const res = await login(owner.username);
        expect(res.status).toBe(200);
        expect(res.body.token).toBeTruthy();
        expect(res.body.role).toBe('admin');
    });

    test('login with wrong password → 401 WRONG_PASSWORD', async () => {
        const res = await login(owner.username, 'wrong-password');
        expect(res.status).toBe(401);
        expect(res.body.code).toBe('WRONG_PASSWORD');
    });

    test('login with unknown username → 404 USER_NOT_FOUND', async () => {
        const res = await login(uniq('ghost'));
        expect(res.body.code).toBe('USER_NOT_FOUND');
    });
});
