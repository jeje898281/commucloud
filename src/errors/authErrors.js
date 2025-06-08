const BaseError = require('./BaseError');
class UnauthorizedError extends BaseError {
    constructor() {
        super('Unauthorized', 'UNAUTHORIZED', 401);
    }
}
class TokenNotFoundError extends BaseError {
    constructor() {
        super('Token not found', 'TOKEN_NOT_FOUND', 401);
    }
}

class WrongPasswordError extends BaseError {
    constructor() {
        super('Wrong password', 'WRONG_PASSWORD', 401);
    }
}

class PasswordTooShortError extends BaseError {
    constructor() {
        super('Password too short', 'PASSWORD_TOO_SHORT', 400);
    }
}

class PasswordTooLongError extends BaseError {
    constructor() {
        super('Password too long', 'PASSWORD_TOO_LONG', 400);
    }
}

class PasswordInvalidFormatError extends BaseError {
    constructor() {
        super('Password invalid format', 'PASSWORD_INVALID_FORMAT', 400);
    }
}

class PasswordSameAsCurrentError extends BaseError {
    constructor() {
        super('Password same as current', 'PASSWORD_SAME_AS_CURRENT', 400);
    }
}


module.exports = {
    UnauthorizedError, TokenNotFoundError, WrongPasswordError, PasswordTooShortError,
    PasswordTooLongError, PasswordInvalidFormatError, PasswordSameAsCurrentError
};
