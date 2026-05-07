"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentReplies = exports.createComment = void 0;
const zod_1 = __importDefault(require("zod"));
const multer_1 = require("../../common/utils/multer");
const general_validation_1 = require("./../../common/validation/general.validation");
exports.createComment = {
    params: zod_1.default.strictObject({
        postId: general_validation_1.generalValidationFields.id,
    }),
    body: zod_1.default
        .strictObject({
        content: zod_1.default.string().optional(),
        files: zod_1.default
            .array(general_validation_1.generalValidationFields.file(multer_1.fileFieldValidation.image))
            .optional(),
        tags: zod_1.default.array(general_validation_1.generalValidationFields.id).optional(),
    })
        .superRefine((args, ctx) => {
        if (!args.files?.length && !args.content) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "A comment needs to contain at least content or an attachment",
            });
        }
        if (args.tags?.length) {
            const uniqueTags = [...new Set(args.tags)];
            if (uniqueTags.length !== args.tags.length) {
                ctx.addIssue({
                    code: "custom",
                    path: ["tags"],
                    message: "A comment can't have duplicated tags",
                });
            }
        }
    }),
};
exports.commentReplies = {
    params: zod_1.default.strictObject({
        postId: general_validation_1.generalValidationFields.id,
        commentId: general_validation_1.generalValidationFields.id,
    }),
    body: exports.createComment.body,
};
