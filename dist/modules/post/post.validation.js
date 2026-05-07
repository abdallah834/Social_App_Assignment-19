"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactPost = exports.updatePost = exports.createPost = void 0;
const general_validation_1 = require("./../../common/validation/general.validation");
const zod_1 = __importDefault(require("zod"));
const enums_1 = require("../../common/enums");
const mongoose_1 = require("mongoose");
const multer_1 = require("../../common/utils/multer");
exports.createPost = {
    body: zod_1.default
        .strictObject({
        content: zod_1.default.string().optional(),
        files: zod_1.default
            .array(general_validation_1.generalValidationFields.file(multer_1.fileFieldValidation.image))
            .optional(),
        tags: zod_1.default.array(zod_1.default.string()).optional(),
        availability: zod_1.default.coerce
            .number()
            .default(enums_1.AvailabilityEnum.PUBLIC)
            .optional(),
    })
        .superRefine((args, ctx) => {
        if (!args.files?.length && !args.content) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "A post needs to contain at least content or an attachment",
            });
        }
        if (args.tags?.length) {
            const uniqueTags = [...new Set(args.tags)];
            if (uniqueTags.length !== args.tags.length) {
                ctx.addIssue({
                    code: "custom",
                    path: ["tags"],
                    message: "A post can't have duplicated tags",
                });
            }
            for (const tag of args.tags) {
                if (!mongoose_1.Types.ObjectId.isValid(tag)) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["tags"],
                        message: "Invalid tagged user ID",
                    });
                }
            }
        }
    }),
};
exports.updatePost = {
    params: zod_1.default.strictObject({
        postId: zod_1.default.string(),
    }),
    body: zod_1.default
        .strictObject({
        content: zod_1.default.string().optional(),
        files: zod_1.default
            .array(general_validation_1.generalValidationFields.file(multer_1.fileFieldValidation.image))
            .optional(),
        removeFiles: zod_1.default.array(zod_1.default.string()).optional(),
        removeTags: zod_1.default.array(general_validation_1.generalValidationFields.id).optional(),
        tags: zod_1.default.array(general_validation_1.generalValidationFields.id).optional(),
        availability: zod_1.default.coerce
            .number()
            .default(enums_1.AvailabilityEnum.PUBLIC)
            .optional(),
    })
        .superRefine((args, ctx) => {
        const hasContent = !!args.content;
        const hasFiles = !!args.files?.length;
        const hasAnyField = hasContent ||
            hasFiles ||
            !!args.removeFiles?.length ||
            !!args.removeTags?.length ||
            !!args.tags?.length ||
            args.availability !== undefined;
        if (!hasAnyField) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "No fields received.",
            });
            return;
        }
        if (args.content === "" || (args.files && args.files.length === 0)) {
            if (!hasContent && !hasFiles) {
                ctx.addIssue({
                    code: "custom",
                    path: ["content"],
                    message: "A post needs to contain at least content or an attachment",
                });
            }
        }
        if (args.tags?.length) {
            const uniqueTags = [...new Set(args.tags)];
            if (uniqueTags.length !== args.tags.length) {
                ctx.addIssue({
                    code: "custom",
                    path: ["tags"],
                    message: "A post can't have duplicated tags",
                });
            }
        }
    }),
};
exports.reactPost = {
    params: zod_1.default.strictObject({
        postId: general_validation_1.generalValidationFields.id,
    }),
    query: zod_1.default.strictObject({
        react: zod_1.default.coerce.number(),
    }),
};
