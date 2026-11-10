const {
    app, request, registerAdmin, createSubAccount, auth,
    createResident, createMeeting, createProposal, vote,
} = require('../helpers');
const { generateVoteQRCode } = require('../../src/services/qrService');

// Ballot QR codes are only exposed to clients as images, so tests sign them through the same service.
async function ballot(proposalId, residentId, result) {
    return (await generateVoteQRCode({ proposalId, residentId, result })).token;
}

const proposalResult = async (token, proposalId) =>
    (await request(app).get(`/api/proposal/${proposalId}`).set(auth(token))).body.data;

describe('Voting — QR ballots', () => {
    let owner, assistant, meeting, residents;

    beforeAll(async () => {
        owner = await registerAdmin();
        assistant = await createSubAccount(owner.token, 'meeting_assistant');
        residents = [];
        for (const sqm of [10, 20, 30, 40]) {
            residents.push(await createResident(owner.token, sqm));
        }
        meeting = await createMeeting(owner.token);
    });

    test('scanning a ballot records the vote and the supervising staff member', async () => {
        const proposal = await createProposal(owner.token, meeting.id);
        const res = await vote(assistant.token, await ballot(proposal.id, residents[0].id, 'agree'));
        expect(res.status).toBe(201);
        expect(res.body.data).toMatchObject({
            proposalId: proposal.id, residentId: residents[0].id, residentCode: residents[0].code, result: 'agree',
        });
        expect(await proposalResult(owner.token, proposal.id)).toMatchObject({ agreeCount: 1, totalCount: 1 });
    });

    test('a resident cannot vote twice on one proposal, even with the opposite ballot → 409 ALREADY_VOTED', async () => {
        const proposal = await createProposal(owner.token, meeting.id);
        await vote(assistant.token, await ballot(proposal.id, residents[0].id, 'agree'));
        const again = await vote(assistant.token, await ballot(proposal.id, residents[0].id, 'disagree'));
        expect(again.status).toBe(409);
        expect(again.body.code).toBe('ALREADY_VOTED');
        expect(await proposalResult(owner.token, proposal.id)).toMatchObject({ agreeCount: 1, disagreeCount: 0 });
    });

    test('concurrent scans of both ballots for one resident record exactly one vote', async () => {
        const proposal = await createProposal(owner.token, meeting.id);
        const agree = await ballot(proposal.id, residents[1].id, 'agree');
        const disagree = await ballot(proposal.id, residents[1].id, 'disagree');
        const attempts = await Promise.all(
            Array.from({ length: 12 }, (_, i) => vote(assistant.token, i % 2 ? agree : disagree)),
        );

        expect(attempts.filter((r) => r.status === 201)).toHaveLength(1);
        expect(attempts.filter((r) => r.body.code === 'ALREADY_VOTED')).toHaveLength(11);
        expect((await proposalResult(owner.token, proposal.id)).totalCount).toBe(1);
    });

    test('a tampered ballot → QRCODE_INVALID', async () => {
        const proposal = await createProposal(owner.token, meeting.id);
        const token = await ballot(proposal.id, residents[0].id, 'agree');
        const res = await vote(assistant.token, `${token.slice(0, -2)}xx`);
        expect(res.body.code).toBe('QRCODE_INVALID');
    });

    test("another community's staff cannot record this community's ballot → PROPOSAL_NOT_FOUND", async () => {
        const proposal = await createProposal(owner.token, meeting.id);
        const outsider = await registerAdmin();
        const res = await vote(outsider.token, await ballot(proposal.id, residents[0].id, 'agree'));
        expect(res.body.code).toBe('PROPOSAL_NOT_FOUND');
        expect((await proposalResult(owner.token, proposal.id)).totalCount).toBe(0);
    });
});

describe('Proposal result — agree votes against headcount and floor-area thresholds', () => {
    // Four units totalling 100 sqm, so agreeing sqm equals the agreeing percentage.
    let owner, meeting, residents;

    beforeAll(async () => {
        owner = await registerAdmin();
        residents = [];
        for (const sqm of [10, 20, 30, 40]) {
            residents.push(await createResident(owner.token, sqm));
        }
        meeting = await createMeeting(owner.token);
    });

    async function resultAfter(votes) {
        const proposal = await createProposal(owner.token, meeting.id, { residentThreshold: 2, sqmThreshold: 50 });
        for (const [index, result] of votes) {
            await vote(owner.token, await ballot(proposal.id, residents[index].id, result));
        }
        return proposalResult(owner.token, proposal.id);
    }

    test('agree votes reach both thresholds → passed', async () => {
        expect(await resultAfter([[1, 'agree'], [2, 'agree'], [0, 'disagree']])).toMatchObject({
            agreeCount: 2, disagreeCount: 1, voidCount: 0, totalCount: 3,
            agreeSqm: 50, disagreeSqm: 10, agreeSqmPercent: 50,
            reachedResidentThreshold: true, reachedSqmThreshold: true, passed: true,
        });
    });

    test('enough agreeing units but too little floor area → not passed', async () => {
        expect(await resultAfter([[0, 'agree'], [1, 'agree']])).toMatchObject({
            agreeCount: 2, agreeSqmPercent: 30,
            reachedResidentThreshold: true, reachedSqmThreshold: false, passed: false,
        });
    });

    test('enough agreeing floor area but too few units → not passed', async () => {
        const proposal = await createProposal(owner.token, meeting.id, { residentThreshold: 3, sqmThreshold: 50 });
        await vote(owner.token, await ballot(proposal.id, residents[2].id, 'agree'));
        await vote(owner.token, await ballot(proposal.id, residents[3].id, 'agree'));
        expect(await proposalResult(owner.token, proposal.id)).toMatchObject({
            agreeCount: 2, agreeSqmPercent: 70,
            reachedResidentThreshold: false, reachedSqmThreshold: true, passed: false,
        });
    });

    test('disagree and void votes never count toward passing', async () => {
        expect(await resultAfter([[2, 'disagree'], [3, 'void'], [0, 'agree']])).toMatchObject({
            agreeCount: 1, disagreeCount: 1, voidCount: 1,
            agreeSqm: 10, disagreeSqm: 30, passed: false,
        });
    });
});
