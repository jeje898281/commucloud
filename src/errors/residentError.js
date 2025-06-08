const BaseError = require('./BaseError');

class ResidentCodeAlreadyExistsError extends BaseError {
    constructor() { super('Resident code already exists', 'RESIDENT_CODE_ALREADY_EXISTS', 400); }
}

class ResidentNotFoundError extends BaseError {
    constructor() { super('Resident not found', 'RESIDENT_NOT_FOUND', 404); }
}

class ResidentHasCheckinDataError extends BaseError {
    constructor() { super('Resident has checkin data', 'RESIDENT_HAS_CHECKIN_DATA', 400); }
}

module.exports = { ResidentCodeAlreadyExistsError, ResidentNotFoundError, ResidentHasCheckinDataError };