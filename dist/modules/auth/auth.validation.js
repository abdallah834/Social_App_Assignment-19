"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPasswordReset = exports.gmailTokenAndIss = exports.confirmEmail = exports.signup = exports.login = exports.resendConfirmationEmail = void 0;
const zod_1 = require("zod");
const validation_1 = require("../../common/validation");
exports.resendConfirmationEmail = {
    body: zod_1.z.strictObject({
        email: validation_1.generalValidationFields.email,
    }),
};
exports.login = {
    body: zod_1.z.strictObject({
        email: zod_1.z.email({
            error: "Email is required",
        }),
        password: zod_1.z.string({
            error: "Password is required",
        }),
        FCM: zod_1.z.string().optional(),
    }),
};
exports.signup = {
    body: zod_1.z
        .strictObject({
        username: validation_1.generalValidationFields.username,
        email: validation_1.generalValidationFields.email,
        password: validation_1.generalValidationFields.password,
        phone: validation_1.generalValidationFields.phone.optional(),
        confirmPassword: validation_1.generalValidationFields.confirmPassword,
        gender: validation_1.generalValidationFields.gender,
    })
        .refine((inputs) => {
        return inputs.password === inputs.confirmPassword;
    }, { error: "Make sure that both passwords match" }),
};
exports.confirmEmail = {
    body: exports.resendConfirmationEmail.body.safeExtend({
        otp: validation_1.generalValidationFields.otp,
    }),
};
exports.gmailTokenAndIss = {
    body: zod_1.z.strictObject({
        idToken: zod_1.z.string({
            error: "Gmail id token is required",
        }),
        issuer: zod_1.z.string({
            error: "Issuer is missing",
        }),
    }),
};
exports.verifyPasswordReset = {
    body: exports.confirmEmail.body.safeExtend({
        newPassword: validation_1.generalValidationFields.password,
    }),
};
