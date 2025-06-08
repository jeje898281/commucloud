// src/middlewares/errorHandler.js
const { BaseError } = require('../errors');

function errorHandler(err, req, res, _next) {
    if (err instanceof BaseError) {
        console.log('errorHandler', err);
        return res.status(err.statusCode).json({
            code: err.code,
            message: err.message,
        });
    }

    console.error('[UnhandledError]', err);

    return res.status(500).json({
        success: false,
        code: 'INTERNAL_ERROR',
        message: 'Internal Server Error',
    });
}

module.exports = errorHandler;
