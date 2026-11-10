const {
    app, request, registerAdmin, createSubAccount, auth,
    createResident, createMeeting, getCheckinTokens, checkin,
} = require('../helpers');

const summary = (token, meetingId) => request(app).get(`/api/meeting/summary/${meetingId}`).set(auth(token));
const records = (token, meetingId) => request(app).get(`/api/meeting/records/${meetingId}`).set(auth(token));

describe('Check-in — QR and manual', () => {
    let owner, assistant, meeting, residents, tokens;

    beforeAll(async () => {
        owner = await registerAdmin();
        assistant = await createSubAccount(owner.token, 'meeting_assistant');
        residents = [
            await createResident(owner.token, 10),
            await createResident(owner.token, 20),
            await createResident(owner.token, 30),
        ];
        meeting = await createMeeting(owner.token);
        tokens = await getCheckinTokens(owner.token, meeting.id);
    });

    test('scanning a QR code records attendance → 201', async () => {
        const res = await checkin(assistant.token, { qrCode: tokens[residents[0].id] });
        expect(res.status).toBe(201);
        expect(res.body.data).toMatchObject({ meetingId: meeting.id, residentId: residents[0].id, isManual: false });
    });

    test('scanning the same QR code again → 409 ALREADY_CHECKED_IN', async () => {
        const res = await checkin(assistant.token, { qrCode: tokens[residents[0].id] });
        expect(res.status).toBe(409);
        expect(res.body.code).toBe('ALREADY_CHECKED_IN');
    });

    test('manual check-in by unit code → 201 flagged as manual', async () => {
        const res = await checkin(assistant.token, { meetingId: meeting.id, residentCode: residents[1].code });
        expect(res.status).toBe(201);
        expect(res.body.data).toMatchObject({ residentId: residents[1].id, isManual: true });
    });

    test('manual check-in after a QR check-in → 409 ALREADY_CHECKED_IN', async () => {
        const res = await checkin(assistant.token, { meetingId: meeting.id, residentCode: residents[0].code });
        expect(res.body.code).toBe('ALREADY_CHECKED_IN');
    });

    test('manual check-in with an unknown unit code → RESIDENT_NOT_FOUND', async () => {
        const res = await checkin(assistant.token, { meetingId: meeting.id, residentCode: 'no-such-unit' });
        expect(res.body.code).toBe('RESIDENT_NOT_FOUND');
    });

    test('concurrent scans and manual entries for one resident record exactly one attendance', async () => {
        const qrCode = tokens[residents[2].id];
        const attempts = await Promise.all([
            ...Array.from({ length: 6 }, () => checkin(assistant.token, { qrCode })),
            ...Array.from({ length: 6 }, () => checkin(owner.token, { meetingId: meeting.id, residentCode: residents[2].code })),
        ]);

        expect(attempts.filter((r) => r.status === 201)).toHaveLength(1);
        expect(attempts.filter((r) => r.body.code === 'ALREADY_CHECKED_IN')).toHaveLength(11);

        const list = await records(owner.token, meeting.id);
        expect(list.body.data.filter((r) => r.residentCode === residents[2].code)).toHaveLength(1);
    });

    test('check-in to a deleted meeting → MEETING_NOT_FOUND', async () => {
        const deleted = await createMeeting(owner.token, { status: 'deleted' });
        const deletedTokens = await getCheckinTokens(owner.token, deleted.id);
        const byQr = await checkin(assistant.token, { qrCode: Object.values(deletedTokens)[0] });
        expect(byQr.body.code).toBe('MEETING_NOT_FOUND');
        const manual = await checkin(assistant.token, { meetingId: deleted.id, residentCode: residents[0].code });
        expect(manual.body.code).toBe('MEETING_NOT_FOUND');
    });
});

describe('Quorum — headcount and floor-area thresholds', () => {
    // Four units totalling 100 sqm, so attended sqm equals the attended percentage.
    let owner, residents;

    beforeAll(async () => {
        owner = await registerAdmin();
        residents = [];
        for (const sqm of [10, 20, 30, 40]) {
            residents.push(await createResident(owner.token, sqm));
        }
    });

    async function meetingWithAttendance(attendeeIndexes) {
        const meeting = await createMeeting(owner.token, { residentThreshold: 2, sqmThreshold: 50 });
        for (const i of attendeeIndexes) {
            await checkin(owner.token, { meetingId: meeting.id, residentCode: residents[i].code });
        }
        return (await summary(owner.token, meeting.id)).body.data;
    }

    test('no attendance → neither threshold reached', async () => {
        expect(await meetingWithAttendance([])).toMatchObject({
            residentAttendanceCount: 0,
            totalAttendanceSqm: 0,
            totalCommunitySqm: 100,
            sqmPercent: 0,
            reachedResidentThreshold: false,
            reachedSqmThreshold: false,
        });
    });

    test('headcount reached but floor area short → only headcount threshold reached', async () => {
        expect(await meetingWithAttendance([0, 1])).toMatchObject({
            residentAttendanceCount: 2,
            sqmPercent: 30,
            reachedResidentThreshold: true,
            reachedSqmThreshold: false,
        });
    });

    test('floor area reached but headcount short → only floor-area threshold reached', async () => {
        const meeting = await createMeeting(owner.token, { residentThreshold: 3, sqmThreshold: 50 });
        await checkin(owner.token, { meetingId: meeting.id, residentCode: residents[2].code });
        await checkin(owner.token, { meetingId: meeting.id, residentCode: residents[3].code });
        expect((await summary(owner.token, meeting.id)).body.data).toMatchObject({
            residentAttendanceCount: 2,
            sqmPercent: 70,
            reachedResidentThreshold: false,
            reachedSqmThreshold: true,
        });
    });

    test('attendance exactly at both thresholds counts as reached', async () => {
        expect(await meetingWithAttendance([0, 3])).toMatchObject({
            residentAttendanceCount: 2,
            sqmPercent: 50,
            reachedResidentThreshold: true,
            reachedSqmThreshold: true,
        });
    });
});

describe('Tenant isolation — meetings and check-in', () => {
    let ownerA, ownerB, meetingA, residentA, residentB, tokensA;

    beforeAll(async () => {
        ownerA = await registerAdmin();
        ownerB = await registerAdmin();
        residentA = await createResident(ownerA.token, 25);
        residentB = await createResident(ownerB.token, 25);
        meetingA = await createMeeting(ownerA.token);
        tokensA = await getCheckinTokens(ownerA.token, meetingA.id);
    });

    test("another community's staff cannot check in with this community's QR code", async () => {
        const res = await checkin(ownerB.token, { qrCode: tokensA[residentA.id] });
        expect(res.body.code).toBe('MEETING_NOT_FOUND');
    });

    test("another community's staff cannot check their own resident into this meeting", async () => {
        const res = await checkin(ownerB.token, { meetingId: meetingA.id, residentCode: residentB.code });
        expect(res.body.code).toBe('MEETING_NOT_FOUND');
    });

    test('rejected cross-community attempts leave the attendance untouched', async () => {
        const res = await summary(ownerA.token, meetingA.id);
        expect(res.body.data.residentAttendanceCount).toBe(0);
    });

    test("another community cannot read this meeting's summary or attendance records", async () => {
        expect((await summary(ownerB.token, meetingA.id)).body.code).toBe('MEETING_NOT_FOUND');
        expect((await records(ownerB.token, meetingA.id)).body.code).toBe('MEETING_NOT_FOUND');
    });

    test('another community cannot generate QR codes for this meeting', async () => {
        const res = await request(app).post('/api/meeting/generate-qr-codes').set(auth(ownerB.token))
            .send({ meetingId: meetingA.id });
        expect(res.body.code).toBe('MEETING_NOT_FOUND');
    });
});
