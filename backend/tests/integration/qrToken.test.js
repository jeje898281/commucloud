const {
    app, request, registerAdmin, auth,
    createResident, createMeeting, createProposal, getCheckinTokens, checkin, vote,
} = require('../helpers');
const { generateVoteQRCode } = require('../../src/services/qrService');

describe('QR tokens are not login tokens', () => {
    let owner, meeting, checkinToken, voteToken;

    beforeAll(async () => {
        owner = await registerAdmin();
        const resident = await createResident(owner.token, 30);
        meeting = await createMeeting(owner.token);
        const proposal = await createProposal(owner.token, meeting.id);
        checkinToken = (await getCheckinTokens(owner.token, meeting.id))[resident.id];
        voteToken = (await generateVoteQRCode({ proposalId: proposal.id, residentId: resident.id, result: 'agree' })).token;
    });

    test.each([
        ['GET', '/api/meeting'],
        ['GET', '/api/resident'],
        ['GET', '/api/profile'],
    ])('a check-in QR code cannot authenticate %s %s → 401', async (_method, path) => {
        const res = await request(app).get(path).set(auth(checkinToken));
        expect(res.status).toBe(401);
        expect(res.body.code).toBe('UNAUTHORIZED');
    });

    test('a check-in QR code cannot read the meeting it belongs to → 401', async () => {
        const res = await request(app).get(`/api/meeting/summary/${meeting.id}`).set(auth(checkinToken));
        expect(res.status).toBe(401);
    });

    test('a ballot QR code cannot authenticate API requests → 401', async () => {
        const res = await request(app).get(`/api/meeting/summary/${meeting.id}`).set(auth(voteToken));
        expect(res.status).toBe(401);
    });

    test('a login token is not accepted as a check-in or ballot QR code → QRCODE_INVALID', async () => {
        expect((await checkin(owner.token, { qrCode: owner.token })).body.code).toBe('QRCODE_INVALID');
        expect((await vote(owner.token, owner.token)).body.code).toBe('QRCODE_INVALID');
    });

    test('check-in and ballot QR codes are not interchangeable → QRCODE_INVALID', async () => {
        expect((await checkin(owner.token, { qrCode: voteToken })).body.code).toBe('QRCODE_INVALID');
        expect((await vote(owner.token, checkinToken)).body.code).toBe('QRCODE_INVALID');
    });

    test('both QR codes still work for their own purpose', async () => {
        expect((await checkin(owner.token, { qrCode: checkinToken })).status).toBe(201);
        expect((await vote(owner.token, voteToken)).status).toBe(201);
    });
});
