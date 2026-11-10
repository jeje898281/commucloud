// src/services/reportService.js
const { createLog, getAttendanceStats, getAttendanceList } = require('../models/attendanceLogModel');
const { getCommunityTotalSqm, findResidentById } = require('../models/residentModel');
const { verifyCheckinToken } = require('../utils/jwt');
const { getMeetingById, getMeetingsByCommunityId, updateMeeting, createMeetingModel, findResidentByCode } = require('../models/meetingModel');
const { findById: findAdminById } = require('../models/adminUserModel');
const { MeetingNotFoundError, UserNotFoundError,
    MeetingSqmThresholdInvalidError, MeetingResidentThresholdInvalidError,
    MeetingDateInvalidError, MeetingStatusInvalidError, NoUpdateFieldsError, ResidentNotFoundError,
    MissingRequiredFieldsError, QRCodeInvalidError, MeetingIdInvalidError
} = require('../errors');

// A meeting of another community is reported as not found, the same as a missing one.
async function getCommunityMeeting(meetingId, communityId) {
    const id = Number(meetingId);
    if (!Number.isInteger(id)) {
        throw new MeetingIdInvalidError();
    }
    const meeting = await getMeetingById(id);
    if (!meeting || meeting.communityId !== communityId) {
        throw new MeetingNotFoundError();
    }
    return meeting;
}

async function getCheckinMeeting(meetingId, communityId) {
    const meeting = await getCommunityMeeting(meetingId, communityId);
    if (meeting.status === 'deleted') {
        throw new MeetingNotFoundError();
    }
    return meeting;
}

// Duplicate check-ins are rejected by the unique index behind createLog.
async function checkinByManual(meetingId, residentCode, communityId, userId) {
    const meeting = await getCheckinMeeting(meetingId, communityId);
    const resident = await findResidentByCode(residentCode, communityId);
    if (!resident) {
        throw new ResidentNotFoundError();
    }
    return createLog(meeting.id, resident.id, userId, true);
}

async function checkinByQRCode(qrCode, communityId, userId) {
    let payload;
    try {
        payload = await verifyCheckinToken(qrCode);
    } catch (err) {
        throw new QRCodeInvalidError();
    }
    if (!Number.isInteger(payload.meetingId) || !Number.isInteger(payload.residentId)) {
        throw new QRCodeInvalidError();
    }
    const meeting = await getCheckinMeeting(payload.meetingId, communityId);
    const resident = await findResidentById(payload.residentId);
    if (!resident || resident.communityId !== communityId) {
        throw new ResidentNotFoundError();
    }
    return createLog(meeting.id, resident.id, userId, false);
}

async function getAttendanceSummary(meetingId, communityId) {
    const meeting = await getCommunityMeeting(meetingId, communityId);

    const { residentAttendanceCount, totalAttendanceSqm } = await getAttendanceStats(meeting.id);
    const totalCommunitySqm = await getCommunityTotalSqm(meeting.communityId);

    // 戶數門檻為「絕對戶數」，坪數門檻為「占社區總坪數的百分比」
    const sqmPercent = totalCommunitySqm > 0 ? (totalAttendanceSqm / totalCommunitySqm) * 100 : 0;
    const reachedResidentThreshold = residentAttendanceCount >= meeting.residentThreshold;
    const reachedSqmThreshold = sqmPercent >= meeting.sqmThreshold;

    return {
        residentAttendanceCount,
        totalAttendanceSqm,
        totalCommunitySqm,
        sqmPercent,
        residentThreshold: meeting.residentThreshold,
        sqmThreshold: meeting.sqmThreshold,
        reachedResidentThreshold,
        reachedSqmThreshold,
    };
}

async function getAttendanceRecords(meetingId, communityId) {
    const meeting = await getCommunityMeeting(meetingId, communityId);
    return getAttendanceList(meeting.id);
}

async function listMeetingsByAdminUser(adminUserId) {
    const admin = await findAdminById(adminUserId);
    if (!admin) throw new UserNotFoundError();

    const meetings = await getMeetingsByCommunityId(admin.communityId);
    return meetings;
}

async function getMeetingDetail(adminUserId, meetingId) {
    const admin = await findAdminById(adminUserId);
    if (!admin) throw new UserNotFoundError();

    const meeting = await getMeetingById(meetingId);
    if (!meeting || meeting.communityId !== admin.communityId) {
        throw new MeetingNotFoundError();
    }
    return meeting;
}

async function updateMeetingDetail(adminUserId, meetingId, updateData) {
    const admin = await findAdminById(adminUserId);
    if (!admin) throw new UserNotFoundError();

    const meeting = await getMeetingById(meetingId);
    if (!meeting || meeting.communityId !== admin.communityId) {
        throw new MeetingNotFoundError();
    }

    const allowedFields = ['name', 'date', 'status', 'sqmThreshold', 'residentThreshold'];
    const filteredData = {};

    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            filteredData[field] = updateData[field];
        }
    }

    if (filteredData.sqmThreshold !== undefined) {
        if (typeof filteredData.sqmThreshold !== 'number' || filteredData.sqmThreshold < 0 || filteredData.sqmThreshold > 100) {
            throw new MeetingSqmThresholdInvalidError();
        }
    }

    if (filteredData.residentThreshold !== undefined) {
        if (!Number.isInteger(filteredData.residentThreshold) || filteredData.residentThreshold < 0) {
            throw new MeetingResidentThresholdInvalidError();
        }
    }

    if (filteredData.date !== undefined) {
        const date = new Date(filteredData.date);
        if (isNaN(date.getTime())) {
            throw new MeetingDateInvalidError();
        }
        filteredData.date = date;
    }

    if (filteredData.status !== undefined) {
        const validStatuses = ['pending', 'ongoing', 'completed', 'deleted', 'cancelled'];
        if (!validStatuses.includes(filteredData.status)) {
            throw new MeetingStatusInvalidError();
        }
    }

    if (Object.keys(filteredData).length === 0) {
        throw new NoUpdateFieldsError();
    }

    const updatedMeeting = await updateMeeting(meetingId, filteredData);
    return updatedMeeting;
}

const VALID_STATUSES = ['pending', 'ongoing', 'completed', 'cancelled', 'deleted'];

async function createMeeting(adminUserId, communityId, { name, status, date, sqmThreshold, residentThreshold }) {
    if (!name || !date || sqmThreshold === undefined || residentThreshold === undefined) {
        throw new MissingRequiredFieldsError();
    }
    const finalStatus = status || 'pending';
    if (!VALID_STATUSES.includes(finalStatus)) {
        throw new MeetingStatusInvalidError();
    }
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
        throw new MeetingDateInvalidError();
    }
    const sqm = Number(sqmThreshold);
    const residents = Number(residentThreshold);
    if (Number.isNaN(sqm) || sqm < 0 || sqm > 100) throw new MeetingSqmThresholdInvalidError();
    if (!Number.isInteger(residents) || residents < 0) throw new MeetingResidentThresholdInvalidError();

    return createMeetingModel(adminUserId, communityId, {
        name,
        status: finalStatus,
        date: parsedDate,
        sqmThreshold: sqm,
        residentThreshold: residents,
    });
}

module.exports = {
    getCommunityMeeting,
    checkinByManual,
    checkinByQRCode,
    getAttendanceSummary,
    getAttendanceRecords,
    listMeetingsByAdminUser,
    getMeetingDetail,
    updateMeetingDetail,
    createMeeting
};
