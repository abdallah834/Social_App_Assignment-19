"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEmitter = void 0;
const node_events_1 = require("node:events");
const exceptions_1 = require("../../exceptions");
const enums_1 = require("../../enums");
exports.emailEmitter = new node_events_1.EventEmitter();
exports.emailEmitter.on(enums_1.EmailEnum.CONFIRM_EMAIL, async (emailFunction) => {
    try {
        await emailFunction();
    }
    catch (error) {
        throw new exceptions_1.internalServerError("Failed to send verification mail to user");
    }
});
exports.emailEmitter.on(enums_1.EmailEnum.FORGOT_PASSWORD, async (emailFunction) => {
    try {
        await emailFunction();
    }
    catch (error) {
        throw new exceptions_1.internalServerError("Failed to send verification mail to user");
    }
});
exports.emailEmitter.on(enums_1.EmailEnum.TWO_STEP_VERIFICATION, async (emailFunction) => {
    try {
        await emailFunction();
    }
    catch (error) {
        throw new exceptions_1.internalServerError("Failed to send verification mail to user");
    }
});
