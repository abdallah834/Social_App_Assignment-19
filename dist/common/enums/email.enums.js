"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailConfig = exports.EmailEnum = void 0;
var EmailEnum;
(function (EmailEnum) {
    EmailEnum["CONFIRM_EMAIL"] = "Email_confirmation";
    EmailEnum["FORGOT_PASSWORD"] = "Forgot_password";
    EmailEnum["TWO_STEP_VERIFICATION"] = "TFA_verification";
})(EmailEnum || (exports.EmailEnum = EmailEnum = {}));
exports.EmailConfig = {
    Email_confirmation: { title: "Email confirmation" },
    Forgot_password: { title: "Forgot password" },
    TFA_verification: { title: "2FA verification" },
};
