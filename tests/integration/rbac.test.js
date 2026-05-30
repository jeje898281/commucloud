const { app, request, registerAdmin, createSubAccount, auth } = require('../helpers');

describe('RBAC — write endpoints gated by role', () => {
    let admin, manager, secretary;

    beforeAll(async () => {
        const ownerRes = await registerAdmin();
        admin = { token: ownerRes.token, username: ownerRes.username };
        manager = await createSubAccount(admin.token, 'manager');
        secretary = await createSubAccount(admin.token, 'meeting_assistant');
    });

    const meetingPayload = {
        name: 'Test Meeting',
        date: '2026-06-01T10:00:00Z',
        sqmThreshold: 50,
        residentThreshold: 50,
    };

    test('secretary cannot create meeting → FORBIDDEN', async () => {
        const res = await request(app).post('/api/meeting').set(auth(secretary.token)).send(meetingPayload);
        expect(res.body.code).toBe('FORBIDDEN');
    });

    test('manager can create meeting → 201', async () => {
        const res = await request(app).post('/api/meeting').set(auth(manager.token)).send(meetingPayload);
        expect(res.status).toBe(201);
        expect(res.body.data.status).toBe('pending');
    });

    test('admin can create meeting → 201', async () => {
        const res = await request(app).post('/api/meeting').set(auth(admin.token)).send(meetingPayload);
        expect(res.status).toBe(201);
    });

    test('secretary can list meetings (read open to all)', async () => {
        const res = await request(app).get('/api/meeting').set(auth(secretary.token));
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('manager cannot list admin users → FORBIDDEN', async () => {
        const res = await request(app).get('/api/admin/users').set(auth(manager.token));
        expect(res.body.code).toBe('FORBIDDEN');
    });

    test('secretary cannot list admin users → FORBIDDEN', async () => {
        const res = await request(app).get('/api/admin/users').set(auth(secretary.token));
        expect(res.body.code).toBe('FORBIDDEN');
    });

    test('admin can list admin users → 200', async () => {
        const res = await request(app).get('/api/admin/users').set(auth(admin.token));
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('secretary cannot create resident → FORBIDDEN', async () => {
        const res = await request(app).post('/api/resident').set(auth(secretary.token))
            .send({ code: 'X999', residentSqm: 30 });
        expect(res.body.code).toBe('FORBIDDEN');
    });

    test('secretary cannot trigger notify → FORBIDDEN', async () => {
        const res = await request(app).post('/api/meetings/1/notify').set(auth(secretary.token)).send({});
        expect(res.body.code).toBe('FORBIDDEN');
    });

    test('unauthenticated requests → 401', async () => {
        const res = await request(app).get('/api/meeting');
        expect(res.status).toBe(401);
    });

    test('checkin endpoint open to all roles (returns business error not FORBIDDEN)', async () => {
        const res = await request(app).post('/api/meeting/checkin').set(auth(secretary.token))
            .send({ qrCode: 'invalid-qr' });
        expect(res.body.code).not.toBe('FORBIDDEN');
        expect(res.body.code).toBe('QRCODE_INVALID');
    });
});
