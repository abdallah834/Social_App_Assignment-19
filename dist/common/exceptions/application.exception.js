"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenException = exports.UnauthorizedException = exports.internalServerError = exports.ConflictException = exports.BadRequestException = exports.NotFoundException = exports.ApplicationException = void 0;
class ApplicationException extends Error {
    message;
    statusCode;
    cause;
    constructor(message, statusCode, cause) {
        super();
        this.message = message;
        this.statusCode = statusCode;
        this.cause = cause;
        this.name = this.constructor.name;
        Error.captureStackTrace(this.constructor);
    }
}
exports.ApplicationException = ApplicationException;
class NotFoundException extends ApplicationException {
    constructor(message = "Not found", cause) {
        super(message, 404, cause);
    }
}
exports.NotFoundException = NotFoundException;
class BadRequestException extends ApplicationException {
    constructor(message = "Bad request", cause) {
        super(message, 400, cause);
    }
}
exports.BadRequestException = BadRequestException;
class ConflictException extends ApplicationException {
    constructor(message = "Conflict", cause) {
        super(message, 409, cause);
    }
}
exports.ConflictException = ConflictException;
class internalServerError extends ApplicationException {
    constructor(message = "Internal server error", cause) {
        super(message, 500, cause);
    }
}
exports.internalServerError = internalServerError;
class UnauthorizedException extends ApplicationException {
    constructor(message = "Internal server error", cause) {
        super(message, 401, cause);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends ApplicationException {
    constructor(message = "Internal server error", cause) {
        super(message, 403, cause);
    }
}
exports.ForbiddenException = ForbiddenException;
