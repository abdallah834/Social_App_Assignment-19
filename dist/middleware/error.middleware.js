"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const globalErrorHandler = (err, req, res, next) => {
    if (err.name === "MulterError") {
        err.statusCode = 400;
    }
    res.status(err.statusCode ?? 500).json({
        Error: err.message || "Internal server error",
        Stack: err.stack,
        cause: err.cause,
    });
};
exports.globalErrorHandler = globalErrorHandler;
