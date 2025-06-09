const BaseError = require('./BaseError');

class BadRequestError extends BaseError {
    constructor(message = 'Bad request: Prisma validation error', code = 'BAD_REQUEST', statusCode = 400) {
        super(message, code, statusCode);
    }
}

module.exports = { BadRequestError };