// src/services/reportService.js
const { existsLog, createLog, getAttendanceStats } = require('../models/attendanceLogModel');
const { verifyToken } = require('../utils/jwt');
const { getMeetingById, getMeetingsByCommunityId, updateMeeting, createMeetingModel, findResidentByCode } = require('../models/meetingModel');
const { findById: findAdminById } = require('../models/adminUserModel');
const { MeetingNotFoundError, AlreadyCheckedInError, UserNotFoundError,
    MeetingSqmThresholdInvalidError, MeetingResidentThresholdInvalidError,
    MeetingDateInvalidError, MeetingStatusInvalidError, NoUpdateFieldsError, ResidentNotFoundError,
    MissingRequiredFieldsError, QRCodeInvalidError
} = require('../errors');

async function checkinByManual(meetingId, residentCode, communityId, userId) {
    const checkinMeetingId = meetingId;
    const resident = await findResidentByCode(residentCode, communityId);
    if (!resident) {
        throw new ResidentNotFoundError();
    }
    const checkinResidentId = resident.id;
    const manualFlag = true;

    const already = await existsLog(checkinMeetingId, checkinResidentId);
    if (already) {
        throw new AlreadyCheckedInError();
    }
    const checkInRecord = await createLog(checkinMeetingId, checkinResidentId, userId, manualFlag);
    return checkInRecord;
}

async function checkinByQRCode(qrCode, userId) {
    let payload;
    try {
        payload = await verifyToken(qrCode);
    } catch (err) {
        throw new QRCodeInvalidError();
    }
    if (!payload || !payload.meetingId || !payload.residentId) {
        throw new QRCodeInvalidError();
    }
    const checkinMeetingId = payload.meetingId;
    const checkinResidentId = payload.residentId;
    const manualFlag = false;
    const already = await existsLog(checkinMeetingId, checkinResidentId);
    if (already) {
        throw new AlreadyCheckedInError();
    }
    const checkInRecord = await createLog(checkinMeetingId, checkinResidentId, userId, manualFlag);
    return checkInRecord;
}

async function getAttendanceSummary(meetingId) {
    const meeting = await getMeetingById(meetingId);
    if (!meeting) {
        throw new MeetingNotFoundError();
    }

    const { residentAttendanceCount, totalAttendanceSqm } = await getAttendanceStats(meetingId);
    const reachedResidentThreshold = residentAttendanceCount >= meeting.residentThreshold;
    const reachedSqmThreshold = totalAttendanceSqm >= meeting.sqmThreshold;

    return {
        residentAttendanceCount,
        totalAttendanceSqm,
        residentThreshold: meeting.residentThreshold,
        sqmThreshold: meeting.sqmThreshold,
        reachedResidentThreshold,
        reachedSqmThreshold,
    };
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
        if (typeof filteredData.sqmThreshold !== 'number' || filteredData.sqmThreshold < 0) {
            throw new MeetingSqmThresholdInvalidError();
        }
    }

    if (filteredData.residentThreshold !== undefined) {
        if (typeof filteredData.residentThreshold !== 'number' || filteredData.residentThreshold < 0) {
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
    if (Number.isNaN(sqm) || sqm < 0) throw new MeetingSqmThresholdInvalidError();
    if (Number.isNaN(residents) || residents < 0) throw new MeetingResidentThresholdInvalidError();

    return createMeetingModel(adminUserId, communityId, {
        name,
        status: finalStatus,
        date: parsedDate,
        sqmThreshold: sqm,
        residentThreshold: residents,
    });
}

module.exports = {
    checkinByManual,
    checkinByQRCode,
    getAttendanceSummary,
    listMeetingsByAdminUser,
    getMeetingDetail,
    updateMeetingDetail,
    createMeeting
};
