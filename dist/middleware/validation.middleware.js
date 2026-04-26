"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const exceptions_1 = require("../common/exceptions");
const validation = (schema) => {
    let issues = [];
    return (req, res, next) => {
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            if (req.file) {
                req.body.file = req.file;
            }
            if (req.files) {
                console.log(req.files);
                req.body.files = req.files;
            }
            if (req.files) {
                req.body.files = req.files;
            }
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
            if (validationResult.success) {
                issues = [];
                next();
            }
            if (issues.length) {
                throw new exceptions_1.BadRequestException("Validation error", {
                    issues,
                });
            }
        }
    };
};
exports.validation = validation;
