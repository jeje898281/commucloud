// src/services/notificationService.js
const notificationQueue = require('../queue/notificationQueue');
const { getMeetingById } = require('../models/meetingModel');
const { findByCommunityWithEmail } = require('../models/residentModel');


async function sendMeetingNotifications(meetingId) {

    const meeting = await getMeetingById(meetingId);
    if (!meeting) {
        const err = new Error('Meeting not found');
        err.status = 404;
        throw err;
    }
    const communityId = meeting.communityId;

    const recipients = await findByCommunityWithEmail(communityId);
    if (recipients.length === 0) {
        return { queued: 0 };
    }
    const notifyMessage = `親愛的住戶，您好！提醒您 ${meeting.name} 將於 ${meeting.date.toISOString()} 舉行，請準時報到。`;
    const notifySubject = `【社區】${meeting.name} 開會提醒`;

    for (const resident of recipients) {
        await notificationQueue.add(
            `meeting-${meetingId}-notify`,
            {
                to: resident.email,
                subject: notifySubject,
                text: notifyMessage,
            }
        );
    }

    return { queued: recipients.length };
}

module.exports = { sendMeetingNotifications };
