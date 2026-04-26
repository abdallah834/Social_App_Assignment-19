"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidationFields = void 0;
const zod_1 = require("zod");
exports.generalValidationFields = {
    username: zod_1.z.coerce
        .string({ error: "Make sure to include a valid username" })
        .min(2, { error: "Minimum characters are 2" })
        .max(25, { error: "max characters are 25" }),
    email: zod_1.z.email({ error: "Make sure to include a valid email address" }),
    password: zod_1.z
        .string()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,16}$/, {
        error: "Make sure to follow the indicated password pattern",
    }),
    phone: zod_1.z
        .string("Phone number is required")
        .regex(/^(00201|\+201|01)(0|1|2|5)\d{8}$/, {
        error: "Make sure to enter a valid phone number",
    }),
    confirmPassword: zod_1.z.coerce.string(),
    gender: zod_1.z.enum(["male", "female"], {
        error: "Gender must be either male or female",
    }),
    otp: zod_1.z.string("OTP code is required").regex(/^\d{6}$/, {
        error: "Make sure to enter a valid OTP code",
    }),
    file: function (mimeType) {
        return zod_1.z
            .strictObject({
            fieldname: zod_1.z.string(),
            originalname: zod_1.z.string(),
            encoding: zod_1.z.string(),
            mimetype: zod_1.z.enum(mimeType),
            buffer: zod_1.z.any().optional(),
            path: zod_1.z.string().optional(),
            size: zod_1.z.number(),
        })
            .superRefine((args, ctx) => {
            if (!args.path && !args.buffer) {
                ctx.addIssue({
                    code: "custom",
                    path: ["buffer"],
                    message: "Either a path or a buffer is needed in order to upload an attachment",
                });
            }
        });
    },
};
