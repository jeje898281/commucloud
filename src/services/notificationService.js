// src/services/notificationService.js
const notificationQueue = require('../queue/notificationQueue');
const { getMeetingById } = require('../models/meetingModel');
const { findByCommunityWithEmail } = require('../models/residentModel');


async function buildMeetingNotificationPreview(meetingId) {
    const meeting = await getMeetingById(meetingId);
    if (!meeting) {
        const err = new Error('Meeting not found');
        err.status = 404;
        throw err;
    }

    const recipients = await findByCommunityWithEmail(meeting.communityId);
    const subject = `【社區】${meeting.name} 開會提醒`;
    const text = `親愛的住戶，您好！提醒您 ${meeting.name} 將於 ${meeting.date.toISOString()} 舉行，請準時報到。`;

    return {
        subject,
        text,
        recipients: recipients.map(r => ({ id: r.id, code: r.code, email: r.email })),
    };
}

async function sendMeetingNotifications(meetingId, overrides = {}) {
    const preview = await buildMeetingNotificationPreview(meetingId);

    const subject = overrides.subject ?? preview.subject;
    const text = overrides.text ?? preview.text;

    let recipients = preview.recipients;
    if (Array.isArray(overrides.recipientIds)) {
        const allow = new Set(overrides.recipientIds);
        recipients = recipients.filter(r => allow.has(r.id));
    }

    if (recipients.length === 0) {
        return { queued: 0 };
    }

    for (const resident of recipients) {
        await notificationQueue.add(
            `meeting-${meetingId}-notify`,
            { to: resident.email, subject, text }
        );
    }

    return { queued: recipients.length };
}

module.exports = { sendMeetingNotifications, buildMeetingNotificationPreview };
