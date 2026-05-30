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


class UsernameTakenError extends BaseError {
    constructor() { super('Username already taken', 'USERNAME_TAKEN', 409); }
}

class EmailTakenError extends BaseError {
    constructor() { super('Email already taken', 'EMAIL_TAKEN', 409); }
}

class CannotModifySelfError extends BaseError {
    constructor() { super('Cannot modify own account via this endpoint', 'CANNOT_MODIFY_SELF', 400); }
}

class LastAdminProtectedError extends BaseError {
    constructor() { super('Community must keep at least one active admin', 'LAST_ADMIN_PROTECTED', 400); }
}

class RoleInvalidError extends BaseError {
    constructor() { super('Invalid role', 'ROLE_INVALID', 400); }
}

class TargetUserNotInCommunityError extends BaseError {
    constructor() { super('Target user not in your community', 'TARGET_USER_NOT_IN_COMMUNITY', 403); }
}

module.exports = {
    UserNotFoundError, DisplayNameEmptyError, DisplayNameTooLongError,
    MissingRequiredFieldsError,
    UsernameTakenError, EmailTakenError, CannotModifySelfError,
    LastAdminProtectedError, RoleInvalidError, TargetUserNotInCommunityError,
};