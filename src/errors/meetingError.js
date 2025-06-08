// meetingErrors.js
const BaseError = require('./BaseError');

class MeetingNotFoundError extends BaseError {
    constructor() { super('Meeting not found', 'MEETING_NOT_FOUND', 404); }
}

class AlreadyCheckedInError extends BaseError {
    constructor() { super('Already checked in', 'ALREADY_CHECKED_IN', 409); }
}

class MeetingIdInvalidError extends BaseError {
    constructor() { super('Meeting ID is invalid', 'MEETING_ID_INVALID', 400); }
}

class MeetingSqmThresholdInvalidError extends BaseError {
    constructor() { super('Meeting sqm threshold is invalid', 'MEETING_SQM_THRESHOLD_INVALID', 400); }
}

class MeetingResidentThresholdInvalidError extends BaseError {
    constructor() { super('Meeting resident threshold is invalid', 'MEETING_RESIDENT_THRESHOLD_INVALID', 400); }
}

class MeetingDateInvalidError extends BaseError {
    constructor() { super('Meeting date is invalid', 'MEETING_DATE_INVALID', 400); }
}

class MeetingStatusInvalidError extends BaseError {
    constructor() { super('Meeting status is invalid', 'MEETING_STATUS_INVALID', 400); }
}

module.exports = {
    MeetingNotFoundError, AlreadyCheckedInError, MeetingIdInvalidError, MeetingSqmThresholdInvalidError,
    MeetingResidentThresholdInvalidError, MeetingDateInvalidError, MeetingStatusInvalidError
};
