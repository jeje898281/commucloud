const { app, request, registerAdmin, auth } = require('../helpers');

describe('Tenant isolation — residents scoped to community', () => {
    let ownerA, ownerB;
    let aResidentId;

    beforeAll(async () => {
        const a = await registerAdmin();
        const b = await registerAdmin();
        ownerA = { token: a.token, communityId: a.communityId };
        ownerB = { token: b.token, communityId: b.communityId };

        // owner A creates a resident
        const created = await request(app).post('/api/resident').set(auth(ownerA.token))
            .send({ code: `T_${Date.now()}`, residentSqm: 33, email: null });
        aResidentId = created.body.data.id;
    });

    test('owner A sees their resident in list', async () => {
        const res = await request(app).get('/api/resident').set(auth(ownerA.token));
        expect(res.status).toBe(200);
        const ids = res.body.data.map(r => r.id);
        expect(ids).toContain(aResidentId);
    });

    test('owner B does NOT see owner A residents', async () => {
        const res = await request(app).get('/api/resident').set(auth(ownerB.token));
        expect(res.status).toBe(200);
        const ids = res.body.data.map(r => r.id);
        expect(ids).not.toContain(aResidentId);
    });

    test('owner B cannot delete owner A resident → TARGET_USER_NOT_IN_COMMUNITY', async () => {
        const res = await request(app).delete('/api/resident').set(auth(ownerB.token))
            .send({ id: aResidentId });
        expect(res.body.code).toBe('TARGET_USER_NOT_IN_COMMUNITY');
    });

    test('owner B cannot update owner A resident → TARGET_USER_NOT_IN_COMMUNITY', async () => {
        const res = await request(app).patch('/api/resident').set(auth(ownerB.token))
            .send({ id: aResidentId, residentSqm: 99 });
        expect(res.body.code).toBe('TARGET_USER_NOT_IN_COMMUNITY');
    });
});
