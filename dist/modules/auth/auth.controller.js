"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../../common/response");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const auth_service_1 = __importDefault(require("./auth.service"));
const validators = __importStar(require("./auth.validation"));
const router = (0, express_1.Router)();
router.post("/signup", (0, validation_middleware_1.validation)(validators.signup), async (req, res, next) => {
    const data = await auth_service_1.default.signup(req.body);
    (0, response_1.successResponse)({
        message: "Account created successfully, a confirmation OTP was sent to your email",
        res,
        data,
        status: 201,
    });
});
router.post("/login", (0, validation_middleware_1.validation)(validators.login), async (req, res, next) => {
    const data = await auth_service_1.default.login(req.body, `${req.protocol}://${req.host}`);
    (0, response_1.successResponse)({
        message: "Login success",
        res,
        data,
    });
});
router.patch("/confirmEmail", (0, validation_middleware_1.validation)(validators.confirmEmail), async (req, res, next) => {
    await auth_service_1.default.confirmEmail(req.body);
    return (0, response_1.successResponse)({
        res,
        message: "Account confirmation completed",
        status: 201,
    });
});
router.patch("/resendConfirmationEmail", (0, validation_middleware_1.validation)(validators.resendConfirmationEmail), async (req, res, next) => {
    await auth_service_1.default.resendConfirmationEmail(req.body);
    return (0, response_1.successResponse)({
        res,
        message: "OTP resent successfully",
        status: 201,
    });
});
router.post("/signup/gmail", async (req, res, next) => {
    const account = await auth_service_1.default.signupWithGmail(req.body.idToken, `${req.protocol}://${req.host}`);
    (0, response_1.successResponse)({
        message: "Account created successfully",
        res,
        data: account,
        status: 201,
    });
});
router.post("/login/gmail", async (req, res, next) => {
    const loginTokens = await auth_service_1.default.loginWithGmail(req.body.idToken, `${req.protocol}://${req.host}`);
    (0, response_1.successResponse)({
        message: "Logged in using Gmail successfully",
        res,
        data: loginTokens,
        status: 201,
    });
});
router.post("/forgotPassword", (0, validation_middleware_1.validation)(validators.resendConfirmationEmail), async (req, res, next) => {
    await auth_service_1.default.reqForgetPasswordOTP(req.body);
    (0, response_1.successResponse)({
        message: "An otp was sent to reset your password",
        res,
    });
});
router.post("/verify/forgotPassword", (0, validation_middleware_1.validation)(validators.verifyPasswordReset), async (req, res, next) => {
    await auth_service_1.default.changeForgottenPassword(req.body);
    (0, response_1.successResponse)({
        message: "Your password was reset successfully",
        res,
    });
});
exports.default = router;
