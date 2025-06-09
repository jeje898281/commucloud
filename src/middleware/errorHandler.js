// src/middlewares/errorHandler.js
const { BaseError, BadRequestError } = require('../errors');
const { Prisma } = require('@prisma/client');

function errorHandler(err, req, res, _next) {
    const requestInfo = {
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
        userId: req.user?.userId || null,
        body: req.body,
        params: req.params,
        query: req.query
    };
    // if (err instanceof Prisma.PrismaClientValidationError) {
    //     err = new BadRequestError();
    // }
    if (err instanceof BaseError) {
        console.error('[HandledError]', {
            request: requestInfo,
            code: err.code,
            message: err.message
        });
        return res.status(err.statusCode).json({
            code: err.code,
            message: err.message,
        });
    }

    console.error('[UnhandledError]', {
        request: requestInfo,
        error: {
            name: err.name,
            message: err.message,
            stack: err.stack
        }
    });

    return res.status(500).json({
        success: false,
        code: 'INTERNAL_ERROR',
        message: 'Internal Server Error',
    });
}

module.exports = errorHandler;
