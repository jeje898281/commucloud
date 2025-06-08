// src/services/reportService.js
const { existsLog, createLog, getAttendanceStats } = require('../models/attendanceLogModel');
const { verifyToken } = require('../utils/jwt');
const { getMeetingById, getMeetingsByCommunityId, updateMeeting, createMeetingModel } = require('../models/meetingModel');
const { findById: findAdminById } = require('../models/adminUserModel');
const { MeetingNotFoundError, AlreadyCheckedInError, UserNotFoundError,
    MeetingSqmThresholdInvalidError, MeetingResidentThresholdInvalidError,
    MeetingDateInvalidError, MeetingStatusInvalidError, NoUpdateFieldsError
} = require('../errors');

async function checkinByManual(meetingId, residentId, userId) {
    const checkinMeetingId = meetingId;
    const checkinResidentId = residentId;
    const manualFlag = true;

    const already = await existsLog(checkinMeetingId, checkinResidentId);
    if (already) {
        throw new AlreadyCheckedInError();
    }
    const checkInRecord = await createLog(checkinMeetingId, checkinResidentId, userId, manualFlag);
    return checkInRecord;
}

async function checkinByQRCode(qrCode, userId) {
    const payload = await verifyToken(qrCode);
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

async function createMeeting(adminUserId, communityId, { name, status, date, sqmThreshold, residentThreshold }) {
    const newMeeting = await createMeetingModel(adminUserId, communityId, { name, status, date, sqmThreshold, residentThreshold });
    return newMeeting;
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
