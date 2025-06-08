const BaseError = require('./BaseError');

class UserNotFoundError extends BaseError {
    constructor() { super('User not found', 'USER_NOT_FOUND', 404); }
}

class DisplayNameEmptyError extends BaseError {
    constructor() { super('Display name is empty', 'DISPLAY_NAME_EMPTY', 400); }
}

class DisplayNameTooLongError extends BaseError {
    constructor() { super('Display name is too long', 'DISPLAY_NAME_TOO_LONG', 400); }
}

class MissingRequiredFieldsError extends BaseError {
    constructor() { super('Missing required fields', 'MISSING_REQUIRED_FIELDS', 400); }
}


module.exports = {
    UserNotFoundError, DisplayNameEmptyError, DisplayNameTooLongError,
    MissingRequiredFieldsError,
};