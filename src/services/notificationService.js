// src/services/notificationService.js
const notificationQueue = require('../queue/notificationQueue');
const { getMeetingById } = require('../models/meetingModel');
const { findByCommunityWithEmail } = require('../models/residentModel');


/**
 * 依會議 ID 發送通知任務：
 * 1. 驗證會議存在
 * 2. 撈出該社區所有有 email 的住戶
 * 3. 逐一 enqueue 寄信工作
 * @param {number} meetingId
 */
async function sendMeetingNotifications(meetingId) {
    // 1. 確認會議
    const meeting = await getMeetingById(meetingId);
    if (!meeting) {
        const err = new Error('Meeting not found');
        err.status = 404;
        throw err;
    }
    const communityId = meeting.communityId;

    // 2. 撈有 email 的住戶
    const recipients = await findByCommunityWithEmail(communityId);
    if (recipients.length === 0) {
        return { queued: 0 };
    }

    // 3. Enqueue：工作名稱可以帶會議 ID
    for (const resident of recipients) {
        await notificationQueue.add(
            `meeting-${meetingId}-notify`,
            {
                to: resident.email,
                subject: `【社區】${meeting.name} 開會提醒`,
                text: `親愛的住戶，您好！提醒您 ${meeting.name} 將於 ${meeting.date.toISOString()} 舉行，請準時報到。`,
            }
        );
    }

    return { queued: recipients.length };
}

module.exports = { sendMeetingNotifications };
