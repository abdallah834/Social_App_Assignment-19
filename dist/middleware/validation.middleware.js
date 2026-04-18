"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const exceptions_1 = require("../common/exceptions");
const validation = (schema) => {
    const issues = [];
    return (req, res, next) => {
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                const error = validationResult.error;
                issues.push({
                    key,
                    issues: error.issues.map((issue) => {
                        return { path: issue.path, message: issue.message };
                    }),
                });
            }
            if (issues.length) {
                throw new exceptions_1.BadRequestException("Validation error", {
                    issues,
                });
            }
            next();
        }
    };
};
exports.validation = validation;
