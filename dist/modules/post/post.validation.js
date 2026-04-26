"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = void 0;
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
