"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.generateOTP = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../../config/config");
const exceptions_1 = require("../../exceptions");
const generateOTP = () => {
    return Math.floor(Math.random() * 900000 + 100000);
};
exports.generateOTP = generateOTP;
const sendEmail = async ({ to, cc, bcc, subject, html, text, attachments = [], }) => {
    if (!to && !cc && !bcc) {
        throw new exceptions_1.BadRequestException("Invalid recipient");
    }
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: config_1.GOOGLE_EMAIL,
            pass: config_1.GOOGLE_APP_PASSWORD,
        },
    });
    await transporter.sendMail({
        from: `"Social-Media-App Verification"`,
        to,
        cc,
        bcc,
        subject,
        text,
        html,
        attachments,
    });
};
exports.sendEmail = sendEmail;
