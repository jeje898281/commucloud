// src/services/reportService.js
const { existsLog, createLog, getAttendanceStats } = require('../models/attendanceLogModel');
const { verifyToken } = require('../utils/jwt');
const { getMeetingById, getMeetingsByCommunityId, updateMeeting } = require('../models/meetingModel');
const { findById: findAdminById } = require('../models/adminUserModel');

/**
 * 檢查某會議與住戶是否已有報到紀錄
 * @param {Object} params
 * @param {number} params.meetingId
 * @param {number} params.residentId
 * @param {number} params.userId
 * @param {boolean} params.isManual
 * @returns {Promise<MeetingAttendanceLog>}
 */
async function checkin({ qrCode, meetingId, residentId, userId }) {
    try {
        let checkinMeetingId, checkinResidentId, manualFlag;

        if (qrCode) {
            const payload = await verifyToken(qrCode);
            checkinMeetingId = payload.meetingId;
            checkinResidentId = payload.residentId;
            manualFlag = false;
        } else {
            checkinMeetingId = meetingId;
            checkinResidentId = residentId;
            manualFlag = true;
        }
        const already = await existsLog(checkinMeetingId, checkinResidentId);
        if (already) {
            const error = new Error('Already checked in');
            error.code = 'ALREADY_CHECKED_IN';
            throw error;
        }
        const checkInRecord = await createLog(checkinMeetingId, checkinResidentId, userId, manualFlag);
        return checkInRecord;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function getAttendanceSummary(meetingId) {
    const meeting = await getMeetingById(meetingId);
    if (!meeting) {
        const err = new Error('Meeting not found');
        err.status = 404;
        throw err;
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
    if (!admin) throw new Error('Admin user not found');

    const meetings = await getMeetingsByCommunityId(admin.communityId);
    return meetings;
}

async function getMeetingDetail(adminUserId, meetingId) {
    const admin = await findAdminById(adminUserId);
    if (!admin) throw new Error('Admin user not found');

    const meeting = await getMeetingById(meetingId);
    if (!meeting || meeting.communityId !== admin.communityId) {
        throw new Error('Meeting not found or no permission');
    }
    return meeting;
}

async function updateMeetingDetail(adminUserId, meetingId, updateData) {
    const admin = await findAdminById(adminUserId);
    if (!admin) throw new Error('Admin user not found');

    // 檢查會議是否存在且屬於該管理員的社區
    const meeting = await getMeetingById(meetingId);
    if (!meeting || meeting.communityId !== admin.communityId) {
        throw new Error('Meeting not found or no permission');
    }

    // 驗證更新數據
    const allowedFields = ['name', 'date', 'status', 'sqmThreshold', 'residentThreshold'];
    const filteredData = {};

    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            filteredData[field] = updateData[field];
        }
    }

    // 特殊驗證
    if (filteredData.sqmThreshold !== undefined) {
        if (typeof filteredData.sqmThreshold !== 'number' || filteredData.sqmThreshold < 0) {
            throw new Error('坪數門檻必須是非負數');
        }
    }

    if (filteredData.residentThreshold !== undefined) {
        if (typeof filteredData.residentThreshold !== 'number' || filteredData.residentThreshold < 0) {
            throw new Error('戶數門檻必須是非負數');
        }
    }

    if (filteredData.date !== undefined) {
        const date = new Date(filteredData.date);
        if (isNaN(date.getTime())) {
            throw new Error('無效的日期格式');
        }
        filteredData.date = date;
    }

    if (filteredData.status !== undefined) {
        const validStatuses = ['pending', 'ongoing', 'completed', 'deleted', 'cancelled'];
        if (!validStatuses.includes(filteredData.status)) {
            throw new Error('無效的會議狀態');
        }
    }

    // 如果沒有要更新的欄位
    if (Object.keys(filteredData).length === 0) {
        throw new Error('沒有要更新的欄位');
    }

    const updatedMeeting = await updateMeeting(meetingId, filteredData);
    return updatedMeeting;
}

module.exports = {
    checkin,
    getAttendanceSummary,
    listMeetingsByAdminUser,
    getMeetingDetail,
    updateMeetingDetail
};
